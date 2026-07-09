import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, addDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SUPPORTED_GAMES } from '../../lib/constants';
import { Plus, Edit2, Trash2, Shield, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../global/AuthProvider';

export const AdminRankings = () => {
  const { user } = useAuthContext();
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(SUPPORTED_GAMES[0].id);
  const [activeCategory, setActiveCategory] = useState<'player' | 'team'>('team');
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    entityId: '',
    entityName: '',
    avatarUrl: '',
    region: 'Pakistan',
    points: 0,
    trend: 'same' as 'up' | 'down' | 'same'
  });

  useEffect(() => {
    fetchRankings();
  }, [activeGame, activeCategory]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'rankings')
      );
      const snap = await getDocs(q);
      const allRankings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Filter client side for ease, or use compound query if indexed
      const filtered = allRankings.filter(r => r.game === activeGame && r.entityType === activeCategory);
      filtered.sort((a, b) => b.points - a.points);
      
      setRankings(filtered);
    } catch (e) {
      console.error("Error fetching rankings:", e);
    }
    setLoading(false);
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        entityId: item.entityId,
        entityName: item.entityName,
        avatarUrl: item.avatarUrl || '',
        region: item.region || 'Pakistan',
        points: item.points,
        trend: item.trend
      });
    } else {
      setEditingItem(null);
      setFormData({
        entityId: '',
        entityName: '',
        avatarUrl: '',
        region: 'Pakistan',
        points: 0,
        trend: 'same'
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'rankings', editingItem.id), {
          ...formData,
          game: activeGame,
          entityType: activeCategory,
          lastUpdated: new Date()
        });
        
        // Log history
        if (editingItem.points !== formData.points) {
          await addDoc(collection(db, 'rankingHistory'), {
            rankingId: editingItem.id,
            entityName: formData.entityName,
            game: activeGame,
            entityType: activeCategory,
            previousPoints: editingItem.points,
            newPoints: formData.points,
            previousRank: null,
            newRank: null,
            timestamp: new Date(),
            updatedBy: user?.uid
          });
        }
      } else {
        const newRef = await addDoc(collection(db, 'rankings'), {
          ...formData,
          game: activeGame,
          entityType: activeCategory,
          lastUpdated: new Date()
        });
        
        await addDoc(collection(db, 'rankingHistory'), {
          rankingId: newRef.id,
          entityName: formData.entityName,
          game: activeGame,
          entityType: activeCategory,
          previousPoints: 0,
          newPoints: formData.points,
          previousRank: null,
          newRank: null,
          timestamp: new Date(),
          updatedBy: user?.uid
        });
      }
      setShowModal(false);
      fetchRankings();
    } catch (error) {
      console.error("Error saving ranking", error);
      alert("Error saving ranking");
    }
  };

  const handleDelete = async (id: string) => {
    
    try {
      await deleteDoc(doc(db, 'rankings', id));
      fetchRankings();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const handleSyncTournaments = async () => {
    try {
      
      
      const tourQuery = query(collection(db, 'tournaments'), where('status', '==', 'Completed'));
      const tourSnap = await getDocs(tourQuery);
      
      const teamPoints: Record<string, { id: string, name: string, game: string, points: number }> = {};
      tourSnap.docs.forEach(doc => {
        const t = doc.data();
        if (t.results) {
          const game = t.gameId || 'tekken-8'; // fallback
          if (t.results.firstPlaceTeamId) {
            const key = `${t.results.firstPlaceTeamId}_${game}`;
            if (!teamPoints[key]) teamPoints[key] = { id: t.results.firstPlaceTeamId, name: t.results.firstPlaceTeamName, game, points: 0 };
            teamPoints[key].points += 100;
          }
          if (t.results.secondPlaceTeamId) {
            const key = `${t.results.secondPlaceTeamId}_${game}`;
            if (!teamPoints[key]) teamPoints[key] = { id: t.results.secondPlaceTeamId, name: t.results.secondPlaceTeamName, game, points: 0 };
            teamPoints[key].points += 50;
          }
          if (t.results.thirdPlaceTeamId) {
            const key = `${t.results.thirdPlaceTeamId}_${game}`;
            if (!teamPoints[key]) teamPoints[key] = { id: t.results.thirdPlaceTeamId, name: t.results.thirdPlaceTeamName, game, points: 0 };
            teamPoints[key].points += 25;
          }
        }
      });

      // Get current rankings to match up
      const rankQuery = query(collection(db, 'rankings'), where('entityType', '==', 'team'));
      const rankSnap = await getDocs(rankQuery);
      
      const existingRankings = new Map();
      rankSnap.docs.forEach(d => {
        existingRankings.set(`${d.data().entityId}_${d.data().game}`, { id: d.id, ...d.data() });
      });

      const batch = writeBatch(db);
      let count = 0;

      for (const [key, calc] of Object.entries(teamPoints)) {
        const existing = existingRankings.get(key);
        if (existing) {
          if (existing.points !== calc.points) {
            batch.update(doc(db, 'rankings', existing.id), { points: calc.points, lastUpdated: new Date() });
            
            // History
            const historyRef = doc(collection(db, 'rankingHistory'));
            batch.set(historyRef, {
              rankingId: existing.id,
              entityName: calc.name,
              game: calc.game,
              entityType: 'team',
              previousPoints: existing.points,
              newPoints: calc.points,
              timestamp: new Date(),
              updatedBy: user?.uid,
              type: 'auto_sync'
            });
            count++;
          }
        } else {
          const newRef = doc(collection(db, 'rankings'));
          batch.set(newRef, {
            entityId: calc.id,
            entityName: calc.name,
            entityType: 'team',
            game: calc.game,
            points: calc.points,
            region: 'Pakistan',
            trend: 'up',
            lastUpdated: new Date()
          });
          
          const historyRef = doc(collection(db, 'rankingHistory'));
          batch.set(historyRef, {
            rankingId: newRef.id,
            entityName: calc.name,
            game: calc.game,
            entityType: 'team',
            previousPoints: 0,
            newPoints: calc.points,
            timestamp: new Date(),
            updatedBy: user?.uid,
            type: 'auto_sync'
          });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        alert(`Successfully synchronized ${count} team rankings from tournaments.`);
        fetchRankings();
      } else {
        alert("All team rankings are already up to date with completed tournaments.");
      }
      
    } catch (e) {
      console.error(e);
      alert("Error syncing from tournaments");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tight">Rankings Management</h2>
        <div className="flex gap-4">
          <button 
            onClick={handleSyncTournaments}
            className="flex items-center gap-2 bg-[#7B61FF]/20 text-[#7B61FF] hover:bg-[#7B61FF]/30 px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase tracking-widest transition-colors border border-[#7B61FF]/30"
          >
            <RefreshCw className="w-4 h-4" /> Sync from Tournaments
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#00D4FF] text-black px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
        <div>
          <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Game Title</label>
          <select 
            value={activeGame}
            onChange={(e) => setActiveGame(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#7B61FF] outline-none"
          >
            {SUPPORTED_GAMES.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
          <div className="flex bg-black border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => setActiveCategory('team')}
              className={`px-4 py-1 rounded text-xs font-mono uppercase tracking-widest ${activeCategory === 'team' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Teams
            </button>
            <button 
              onClick={() => setActiveCategory('player')}
              className={`px-4 py-1 rounded text-xs font-mono uppercase tracking-widest ${activeCategory === 'player' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Players
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Points</th>
                <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Trend</th>
                <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-mono text-sm">Loading rankings...</td>
                </tr>
              ) : rankings.length > 0 ? (
                rankings.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-display font-bold text-lg">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#121B2A] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={entry.entityName} className="w-full h-full object-cover" />
                          ) : (
                            activeCategory === 'team' ? <Shield className="w-4 h-4 text-gray-500" /> : <User className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{entry.entityName}</p>
                          <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{entry.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#00D4FF] font-mono font-bold">{entry.points}</td>
                    <td className="p-4">
                      <span className={`text-xs font-mono font-bold uppercase ${entry.trend === 'up' ? 'text-green-400' : entry.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                        {entry.trend}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(entry)} className="p-2 text-gray-400 hover:text-[#00D4FF] transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(entry.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-mono text-sm">No rankings found for this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-tight">{editingItem ? 'Edit Ranking' : 'New Ranking Entry'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Entity ID (User/Team ID)</label>
                <input required value={formData.entityId} onChange={e => setFormData({...formData, entityId: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#7B61FF]" placeholder="Paste ID here" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                <input required value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#7B61FF]" placeholder="Name" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Logo/Avatar URL (Optional)</label>
                <input value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#7B61FF]" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Points</label>
                  <input type="number" required value={formData.points} onChange={e => setFormData({...formData, points: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#7B61FF]" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Trend</label>
                  <select value={formData.trend} onChange={e => setFormData({...formData, trend: e.target.value as 'up'|'down'|'same'})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#7B61FF]">
                    <option value="up">Up</option>
                    <option value="same">Same</option>
                    <option value="down">Down</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#00D4FF] hover:bg-white text-black rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(0,212,255,0.3)]">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
