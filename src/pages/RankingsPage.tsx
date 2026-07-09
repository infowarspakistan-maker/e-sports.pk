import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, limit, updateDoc, doc, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Search, Filter, Shield, User, Download, Edit2, Save, X, MapPin } from 'lucide-react';
import { SUPPORTED_GAMES } from '../lib/constants';
import { useAuthContext } from '../components/global/AuthProvider';
import { RankingProfileModal } from '../components/rankings/RankingProfileModal';

interface RankingEntry {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'player' | 'team';
  avatarUrl?: string;
  game: string;
  region: string;
  points: number;
  trend: 'up' | 'down' | 'same';
  rank?: number;
}

const REGIONS = ['All', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan', 'AJK'];

export const RankingsPage = () => {
  const { user, userData } = useAuthContext();
  const isAdmin = userData?.role === 'admin';
  const [activeGame, setActiveGame] = useState('club-championship');
  const [activeCategory, setActiveCategory] = useState<'player' | 'team'>('team');
  const [activeRegion, setActiveRegion] = useState('All');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, { rank: number | '', points: number | '' }>>({});
  const [selectedProfile, setSelectedProfile] = useState<RankingEntry | null>(null);

  const EXTENDED_GAMES = [
    { id: 'club-championship', name: 'Club Championship', icon: '🏆', color: '#FFD700', category: 'overall', image: '', banner: '' },
    ...SUPPORTED_GAMES
  ];

  const activeGameObj = EXTENDED_GAMES.find(g => g.id === activeGame) || EXTENDED_GAMES[0];
  const themeColor = activeGameObj.color || '#7B61FF';

  useEffect(() => {
    setLoading(true);
    let q;
    if (activeGame === 'club-championship') {
      q = query(
        collection(db, 'rankings'),
        where('entityType', '==', 'team'),
        limit(1000)
      );
    } else {
      q = query(
        collection(db, 'rankings'),
        where('game', '==', activeGame),
        where('entityType', '==', activeCategory),
        limit(200)
      );
    }
    
    const unsubscribe = onSnapshot(q, (snap) => {
      let data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          rank: d.rank
        };
      }) as RankingEntry[];
      
      // Filter by region locally if not "All"
      if (activeRegion !== 'All') {
        data = data.filter(r => r.region === activeRegion);
      }

      if (activeGame === 'club-championship') {
        // Group by entityId or entityName
        const clubMap = new Map<string, RankingEntry>();
        data.forEach(r => {
          const key = r.entityId || r.entityName;
          if (!clubMap.has(key)) {
            clubMap.set(key, { ...r, points: 0, id: key });
          }
          const club = clubMap.get(key)!;
          club.points += r.points;
        });
        data = Array.from(clubMap.values());
      }
      
      // Sort by rank if present (and not club-championship), otherwise by points
      data.sort((a, b) => {
        if (activeGame !== 'club-championship' && a.rank !== undefined && b.rank !== undefined) return a.rank - b.rank;
        if (activeGame !== 'club-championship' && a.rank !== undefined) return -1;
        if (activeGame !== 'club-championship' && b.rank !== undefined) return 1;
        return b.points - a.points;
      });
      
      // Assign sequential rank if not saved
      data.forEach((item, idx) => {
        if (item.rank === undefined || activeGame === 'club-championship') {
          item.rank = idx + 1;
        }
      });
      
      setRankings(data);
      
      if (!isEditMode && activeGame !== 'club-championship') {
        // Init edit values only if not editing to avoid overwriting typed values
        const initialEdits: Record<string, { rank: number | '', points: number | '' }> = {};
        data.forEach(r => {
          initialEdits[r.id] = { rank: r.rank || '', points: r.points || '' };
        });
        setEditValues(initialEdits);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching rankings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeGame, activeCategory, activeRegion]); // Re-subscribe when region changes so filtering applies correctly on data fetch or changes

  const filteredRankings = rankings.filter(r => 
    r.entityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Rank', 'Name', 'Region', 'Points', 'Trend'];
    const rows = filteredRankings.map(r => [
      r.rank,
      `"${r.entityName}"`,
      `"${r.region || 'Pakistan'}"`,
      r.points,
      r.trend
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rankings_${activeCategory}_${activeGame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdits = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      for (const id of Object.keys(editValues)) {
        const val = editValues[id];
        const original = rankings.find(r => r.id === id);
        if (!original) continue;

        if (val.points !== '' || val.rank !== '') {
          const updates: any = {};
          if (val.points !== '' && val.points !== original.points) updates.points = Number(val.points);
          if (val.rank !== '' && val.rank !== original.rank) updates.rank = Number(val.rank);
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'rankings', id), updates);
            
            // Historical Tracking
            await addDoc(collection(db, 'rankingHistory'), {
              rankingId: id,
              entityName: original.entityName,
              game: original.game,
              entityType: original.entityType,
              previousPoints: original.points,
              newPoints: val.points !== '' ? Number(val.points) : original.points,
              previousRank: original.rank || null,
              newRank: val.rank !== '' ? Number(val.rank) : (original.rank || null),
              timestamp: new Date(),
              updatedBy: user?.uid
            });
          }
        }
      }
      setIsEditMode(false);
      setLoading(false);
    } catch (e) {
      console.error(e);
      alert('Error saving edits.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-10 max-w-7xl mx-auto pb-20 relative">
      <div 
        className="absolute inset-0 top-0 pointer-events-none -z-10"
        style={{ backgroundImage: `linear-gradient(to bottom, ${themeColor}15, transparent, transparent)` }}
      ></div>
      
      <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic mb-4 flex justify-center items-center gap-4">
          <Trophy className="w-10 h-10 text-[#FFD700]" />
          Official <span style={{ color: themeColor }}>Rankings</span>
        </h1>
        <p className="text-[#A0A0AB] text-sm md:text-base font-body leading-relaxed max-w-2xl mx-auto">
          The definitive leaderboard for Pakistan's elite e-sports athletes and teams. Rankings are updated in real-time based on verified tournament results.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex bg-[#0A0A0A] border border-white/10 rounded-full p-1 shadow-2xl overflow-x-auto max-w-full hide-scrollbar">
          {EXTENDED_GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => {
                setActiveGame(game.id);
                if (game.id === 'club-championship') setActiveCategory('team');
              }}
              className={`px-4 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeGame === game.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeGame === game.id ? { backgroundColor: game.color || '#7B61FF', boxShadow: `0 0 15px ${game.color || '#7B61FF'}66` } : {}}
            >
              <span className="mr-2">{game.icon}</span>
              {game.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className={`flex bg-[#0A0A0A] border border-white/10 rounded-full p-1 shadow-2xl ${activeGame === 'club-championship' ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => setActiveCategory('team')}
            className={`px-8 py-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeCategory === 'team' 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Team Rankings
          </button>
          <button
            onClick={() => setActiveCategory('player')}
            className={`px-8 py-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeCategory === 'player' 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Player Rankings
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-center">
          <div className="relative flex-1 md:w-48 min-w-[150px]">
            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-full pl-11 pr-4 py-3 text-white text-xs font-mono outline-none focus:border-[#7B61FF] transition-colors appearance-none cursor-pointer"
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>{r === 'All' ? 'Nationwide' : r}</option>
              ))}
            </select>
          </div>
          
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory}s...`} 
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-full pl-11 pr-4 py-3 text-white text-xs font-mono outline-none focus:border-[#7B61FF] transition-colors"
            />
          </div>
          
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-[#121B2A] border-none hover:bg-[#7B61FF] text-white px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cyber-button shadow-[0_0_15px_rgba(123,97,255,0.2)]"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          
          {isAdmin && (
            isEditMode ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdits}
                  className="flex items-center gap-2 bg-green-500 text-black hover:bg-green-400 px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cyber-button"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-400 px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cyber-button"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 text-white hover:bg-white hover:text-black px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cyber-button"
                style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}66` }}
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )
          )}
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative cyber-angled-border scanline-effect">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/90 to-[#0A0A0A]/95 -z-10 pointer-events-none"></div>
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-[#121B2A]/70 backdrop-blur-md text-[10px] font-mono font-bold text-[#00D4FF] uppercase tracking-widest relative z-10">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 md:col-span-4">{activeCategory === 'team' ? 'Team Name' : 'Player Name'}</div>
          <div className="col-span-3 hidden md:block">Region</div>
          <div className="col-span-3 md:col-span-2 text-right">Points</div>
          <div className="col-span-3 md:col-span-2 text-center">Trend</div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div 
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${themeColor}`, borderTopColor: 'transparent' }}
            ></div>
          </div>
        ) : filteredRankings.length > 0 ? (
          <div className="divide-y divide-white/5 relative z-10">
            {filteredRankings.map((entry, index) => (
              <div 
                key={entry.id} 
                onClick={() => !isEditMode && setSelectedProfile(entry)}
                className={`grid grid-cols-12 gap-4 p-6 items-center transition-all duration-300 group ${!isEditMode ? 'cursor-pointer cyber-glow-row hover:scale-[1.01] hover:z-20 relative' : ''} animate-in fade-in slide-in-from-bottom-4`}
                style={{ 
                  animationDelay: `${index * 50}ms`, 
                  animationFillMode: 'both',
                  ...(index < 3 ? { backgroundImage: `linear-gradient(to right, ${themeColor}1A, transparent)` } : {}) 
                }}
              >
                <div className="col-span-1 flex justify-center">
                  {isEditMode ? (
                    <input 
                      type="number"
                      value={editValues[entry.id]?.rank ?? entry.rank}
                      onChange={e => setEditValues({ ...editValues, [entry.id]: { ...editValues[entry.id], rank: e.target.value === '' ? '' : Number(e.target.value) } })}
                      className="w-12 bg-black border border-white/20 rounded p-1 text-center text-white text-xs outline-none focus:border-[#7B61FF]"
                    />
                  ) : (
                    index === 0 ? <Medal className="w-6 h-6 text-[#FFD700]" /> :
                    index === 1 ? <Medal className="w-6 h-6 text-[#C0C0C0]" /> :
                    index === 2 ? <Medal className="w-6 h-6 text-[#CD7F32]" /> :
                    <span className="text-lg font-display font-bold text-gray-500">{entry.rank}</span>
                  )}
                </div>
                
                <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt={entry.entityName} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#121B2A] border border-white/10 flex items-center justify-center">
                      {activeCategory === 'team' ? <Shield className="w-5 h-5 text-gray-400" /> : <User className="w-5 h-5 text-gray-400" />}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold text-base md:text-lg ${index < 3 ? 'text-white' : 'text-gray-300'}`}>
                      {entry.entityName}
                    </span>
                    {index === 0 && <Medal className="w-4 h-4 text-[#FFD700]" title="Gold Tier" />}
                    {index === 1 && <Medal className="w-4 h-4 text-[#C0C0C0]" title="Silver Tier" />}
                    {index === 2 && <Medal className="w-4 h-4 text-[#CD7F32]" title="Bronze Tier" />}
                  </div>
                </div>
                
                <div className="col-span-3 hidden md:flex items-center text-xs font-mono text-gray-400">
                  {entry.region || 'Pakistan'}
                </div>
                
                <div className="col-span-3 md:col-span-2 text-right">
                  {isEditMode ? (
                    <input 
                      type="number"
                      value={editValues[entry.id]?.points ?? entry.points}
                      onChange={e => setEditValues({ ...editValues, [entry.id]: { ...editValues[entry.id], points: e.target.value === '' ? '' : Number(e.target.value) } })}
                      className="w-16 bg-black border border-white/20 rounded p-1 text-right text-white text-xs outline-none focus:border-[#7B61FF]"
                    />
                  ) : (
                    <>
                      <span className="text-xl font-display font-black text-[#00D4FF] italic">{entry.points}</span>
                      <span className="text-[9px] font-mono text-gray-500 ml-1">PTS</span>
                    </>
                  )}
                </div>
                
                <div className="col-span-3 md:col-span-2 flex justify-center">
                  {entry.trend === 'up' ? (
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-bold">UP</span>
                    </div>
                  ) : entry.trend === 'down' ? (
                    <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full flex items-center gap-1 border border-red-500/30">
                      <TrendingDown className="w-3 h-3" />
                      <span className="text-[10px] font-bold">DOWN</span>
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full flex items-center gap-1 border border-gray-500/30">
                      <Minus className="w-3 h-3" />
                      <span className="text-[10px] font-bold">SAME</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center">
            <Trophy className="w-16 h-16 text-gray-700 mb-4 opacity-50" />
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight italic mb-2">No Rankings Data</h3>
            <p className="text-sm text-gray-500 font-mono">Check back after the next tournament concludes.</p>
          </div>
        )}
      </div>

      {selectedProfile && (
        <RankingProfileModal 
          entry={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          themeColor={themeColor} 
        />
      )}
    </div>
  );
};
