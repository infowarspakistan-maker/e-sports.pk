import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/global/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, addDoc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { Shield, Plus, Edit2, Check, User as UserIcon, Settings, Calendar, Trophy, Image as ImageIcon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserDashboard = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'teams' | 'tournaments' | 'notifications'>('profile');
  
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGame, setFormGame] = useState('Tekken 8');
  const [formAvailability, setFormAvailability] = useState('Lft');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formTwitch, setFormTwitch] = useState('');
  const [formDiscord, setFormDiscord] = useState('');
  const [formSteam, setFormSteam] = useState('');

  // Team Management
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    game: 'Tekken 8',
    location: '',
    bio: '',
    status: 'Recruiting',
    logoUrl: '',
    bannerUrl: '',
    color: '#00D4FF'
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadMyTeams();

      // Real-time notifications listener
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snap) => {
        setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadMyTeams = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'teams'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setMyTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'players'), where('userId', '==', user?.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const p = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        setPlayerProfile(p);
        setFormName(p.name || '');
        setFormGame(p.game || 'Tekken 8');
        setFormAvailability(p.availability || 'Lft');
        setFormAvatarUrl(p.avatarUrl || '');
        setFormCity(p.city || '');
        setFormTwitch(p.twitch || '');
        setFormDiscord(p.discord || '');
        setFormSteam(p.steam || '');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (playerProfile) {
        await updateDoc(doc(db, 'players', playerProfile.id), {
          name: formName,
          game: formGame,
          availability: formAvailability,
          avatarUrl: formAvatarUrl,
          city: formCity,
          twitch: formTwitch,
          discord: formDiscord,
          steam: formSteam
        });
      } else {
        await addDoc(collection(db, 'players'), {
          userId: user?.uid,
          name: formName,
          game: formGame,
          availability: formAvailability,
          avatarUrl: formAvatarUrl,
          city: formCity,
          twitch: formTwitch,
          discord: formDiscord,
          steam: formSteam,
          rating: 80,
          teamId: '',
          teamName: 'Unaligned',
          isApproved: false,
          createdAt: new Date()
        });
      }
      setIsEditingProfile(false);
      loadUserData();
    } catch (e) {
      console.error(e);
      alert("Failed to save profile.");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'teams'), {
        userId: user?.uid,
        ...teamForm,
        isApproved: false,
        createdAt: new Date()
      });
      setIsCreatingTeam(false);
      setTeamForm({
        name: '', game: 'Tekken 8', location: '', bio: '', status: 'Recruiting', logoUrl: '', bannerUrl: '', color: '#00D4FF'
      });
      loadMyTeams();
    } catch (e) {
      console.error(e);
      alert("Failed to create team.");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-10 max-w-7xl mx-auto pb-20 relative">
      <div className="absolute inset-0 top-0 bg-gradient-to-b from-[#00D4FF]/5 via-transparent to-transparent pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic">
            Command <span className="text-[#00D4FF]">Center</span>
          </h1>
          <p className="text-[#A0A0AB] font-mono text-xs uppercase tracking-widest mt-3">
            Self-Service Dashboard & Profile Management
          </p>
        </div>
        
        {playerProfile && (
          <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/5 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
              <img src={playerProfile.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
            </div>
            <div className="pr-4">
              <div className="text-xs font-bold text-white uppercase tracking-widest">{playerProfile.name}</div>
              <div className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-widest">
                {playerProfile.isApproved ? 'Verified Player' : 'Pending Verification'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'profile' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-gray-500 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4 inline-block mr-2" />
          Player Profile
        </button>
        <button 
          onClick={() => setActiveTab('teams')}
          className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'teams' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline-block mr-2" />
          My Teams
        </button>
        <button 
          onClick={() => setActiveTab('tournaments')}
          className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'tournaments' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 inline-block mr-2" />
          Registered Tournaments
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'notifications' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-[#00D4FF] text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ml-1">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-mono text-gray-500">Loading data...</div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight italic">Esports Identity</h2>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Manage your public player persona</p>
                </div>
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-widest transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Profile
                  </button>
                )}
              </div>

              {!playerProfile && !isEditingProfile ? (
                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
                  <UserIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-6">No player profile found</p>
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-[#00D4FF] text-black px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Initialize Profile
                  </button>
                </div>
              ) : isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Gamer Tag / Name</label>
                      <input 
                        required 
                        value={formName} 
                        onChange={e => setFormName(e.target.value)} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm"
                        placeholder="e.g. Arslan Ash"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Game</label>
                      <select 
                        value={formGame}
                        onChange={e => setFormGame(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm"
                      >
                        <option value="Tekken 8">Tekken 8</option>
                        <option value="Valorant">Valorant</option>
                        <option value="CS2">CS2</option>
                        <option value="Dota 2">Dota 2</option>
                        <option value="PUBG Mobile">PUBG Mobile</option>
                        <option value="Free Fire">Free Fire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Availability / Recruitment</label>
                      <select 
                        value={formAvailability}
                        onChange={e => setFormAvailability(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm"
                      >
                        <option value="Lft">Looking for Team (LFT)</option>
                        <option value="Open">Open to Offers</option>
                        <option value="Signed">Signed</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Location / City</label>
                      <input 
                        required 
                        value={formCity} 
                        onChange={e => setFormCity(e.target.value)} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm"
                        placeholder="e.g. Lahore"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Avatar URL (Optional)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
                        <input 
                          type="url" 
                          value={formAvatarUrl} 
                          onChange={e => setFormAvatarUrl(e.target.value)} 
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 outline-none transition-all text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4">Social Links (Optional)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#9146FF] uppercase tracking-widest mb-2">Twitch</label>
                          <input 
                            value={formTwitch} 
                            onChange={e => setFormTwitch(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#9146FF] focus:ring-1 focus:ring-[#9146FF]/30 outline-none transition-all text-sm"
                            placeholder="Twitch Username"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#5865F2] uppercase tracking-widest mb-2">Discord</label>
                          <input 
                            value={formDiscord} 
                            onChange={e => setFormDiscord(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2]/30 outline-none transition-all text-sm"
                            placeholder="Discord Tag"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-2">Steam URL</label>
                          <input 
                            value={formSteam} 
                            onChange={e => setFormSteam(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white/30 outline-none transition-all text-sm"
                            placeholder="Steam Profile URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-3 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-[#00D4FF] text-black rounded-xl text-xs font-mono font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
                    >
                      Save Profile Updates
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Gamer Tag</div>
                      <div className="text-xl font-display font-bold text-white uppercase italic">{playerProfile.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Primary Discipline</div>
                      <div className="text-sm font-mono text-[#00D4FF] uppercase tracking-widest">{playerProfile.game}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Location</div>
                      <div className="text-sm font-mono text-white uppercase tracking-widest">{playerProfile.city}</div>
                    </div>
                    
                    {(playerProfile.twitch || playerProfile.discord || playerProfile.twitter) && (
                      <div className="pt-4 border-t border-white/5">
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Linked Accounts</div>
                        <div className="flex gap-4">
                          {playerProfile.twitch && (
                            <a href={`https://twitch.tv/${playerProfile.twitch}`} target="_blank" rel="noopener noreferrer" className="text-[#9146FF] hover:text-white transition-colors">
                              <span className="text-xs font-mono font-bold">Twitch</span>
                            </a>
                          )}
                          {playerProfile.discord && (
                            <div className="text-[#5865F2] hover:text-white transition-colors cursor-help" title={playerProfile.discord}>
                              <span className="text-xs font-mono font-bold">Discord</span>
                            </div>
                          )}
                          {playerProfile.twitter && (
                            <a href={`https://twitter.com/${playerProfile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:text-white transition-colors">
                              <span className="text-xs font-mono font-bold">Twitter</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-black/50 p-6 rounded-xl border border-white/5">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">Recruitment Status</div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded border ${
                      playerProfile.availability === 'Lft' ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]' :
                      playerProfile.availability === 'Signed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest">
                        {playerProfile.availability === 'Lft' ? 'Looking For Team' : playerProfile.availability}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                      {playerProfile.availability === 'Lft' 
                        ? 'Your profile is currently visible to team captains and scouts on the Recruitment board.' 
                        : 'Your recruitment status is restricted. Change to LFT to appear on scouting boards.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight italic mb-2">Team Management</h3>
                  <p className="text-gray-400 font-mono text-xs uppercase tracking-widest max-w-md">
                    Manage your team roster, recruitment status, and identity.
                  </p>
                </div>
                {!isCreatingTeam && (
                  <button 
                    onClick={() => setIsCreatingTeam(true)}
                    className="bg-[#00D4FF] text-black px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
                  >
                    Create New Team
                  </button>
                )}
              </div>

              {isCreatingTeam ? (
                <form onSubmit={handleCreateTeam} className="space-y-6 max-w-2xl bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4">Initialize Team Roster</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Team Name</label>
                      <input 
                        required 
                        value={teamForm.name} 
                        onChange={e => setTeamForm({...teamForm, name: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm" 
                        placeholder="e.g. Thunder Esports" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Primary Game</label>
                      <input 
                        required 
                        value={teamForm.game} 
                        onChange={e => setTeamForm({...teamForm, game: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm" 
                        placeholder="e.g. Tekken 8" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Base Location</label>
                      <input 
                        required 
                        value={teamForm.location} 
                        onChange={e => setTeamForm({...teamForm, location: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm" 
                        placeholder="e.g. Lahore / Online" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Recruitment Status</label>
                      <select 
                        value={teamForm.status} 
                        onChange={e => setTeamForm({...teamForm, status: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm"
                      >
                        <option value="Recruiting">Recruiting LFT</option>
                        <option value="Roster Full">Roster Full</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Team Bio</label>
                    <textarea 
                      required 
                      value={teamForm.bio} 
                      onChange={e => setTeamForm({...teamForm, bio: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm" 
                      rows={3} 
                      placeholder="Describe your organization..."
                    ></textarea>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingTeam(false)}
                      className="px-6 py-3 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-[#00D4FF] text-black rounded-xl text-xs font-mono font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
                    >
                      Register Team
                    </button>
                  </div>
                </form>
              ) : myTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myTeams.map(team => (
                    <div key={team.id} className="border border-white/10 bg-black rounded-2xl overflow-hidden group">
                      <div className="h-24 bg-white/5 relative">
                        {team.bannerUrl && <img src={team.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-50" />}
                        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-black border-2 border-[#00D4FF] overflow-hidden flex items-center justify-center">
                           {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 text-[#00D4FF]" />}
                        </div>
                      </div>
                      <div className="pt-10 px-6 pb-6 relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-display font-bold text-white uppercase italic">{team.name}</h4>
                          <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
                            team.status === 'Recruiting' ? 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/50' : 'bg-green-500/20 text-green-400 border-green-500/50'
                          }`}>
                            {team.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">{team.game} • {team.location}</p>
                        
                        <div className="text-[10px] font-mono text-gray-400">
                          {team.isApproved ? (
                            <span className="text-green-400">✓ Verified Organization</span>
                          ) : (
                            <span className="text-yellow-500">⚠ Pending Admin Verification</span>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                          <Link to={`/teams/${team.id}`} className="flex-1 text-center bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all">
                            View Public Page
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
                  <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-6">You don't manage any teams</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-tight">Inbox</h3>
                  <p className="text-sm text-gray-400">Match invites, tournament alerts, and roster updates.</p>
                </div>
              </div>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div key={notification.id} className={`p-4 rounded-2xl border ${notification.read ? 'bg-[#0A0A0A] border-white/5' : 'bg-gradient-to-r from-[#00D4FF]/10 to-[#0A0A0A] border-[#00D4FF]/30'} flex items-start gap-4 transition-colors`}>
                      <div className={`p-2 rounded-xl ${notification.read ? 'bg-white/5' : 'bg-[#00D4FF]/20 text-[#00D4FF]'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm mb-1">{notification.title}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">{notification.message}</p>
                        <div className="mt-2 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                          {notification.createdAt?.toDate ? new Date(notification.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                        </div>
                      </div>
                      {!notification.read && (
                        <button 
                          onClick={() => updateDoc(doc(db, 'notifications', notification.id), { read: true })}
                          className="text-[#00D4FF] hover:text-white text-xs font-mono font-bold uppercase tracking-widest transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No notifications found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-8 shadow-2xl text-center">
              <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight italic mb-2">Tournament Registrations</h3>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-6 max-w-md mx-auto">
                Track your upcoming brackets, match times, and check-in status.
              </p>
              <Link to="/tournaments" className="inline-block bg-[#00D4FF] text-black px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-widest hover:bg-white shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all">
                Find Tournaments
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
