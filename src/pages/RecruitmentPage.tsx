import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, Search, Filter, MapPin, User, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EsportsPlayerCard } from '../components/features/EsportsPlayerCard';
import { SUPPORTED_GAMES } from '../lib/constants';

export const RecruitmentPage = () => {
  const [loading, setLoading] = useState(true);
  const [lftPlayers, setLftPlayers] = useState<any[]>([]);
  const [recruitingTeams, setRecruitingTeams] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  
  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterLocation, setFilterLocation] = useState('');

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    setLoading(true);
    try {
      // Fetch LFT Players
      const pQuery = query(collection(db, 'players'), where('availability', '==', 'Lft'));
      const pSnap = await getDocs(pQuery);
      setLftPlayers(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      // Fetch Recruiting Teams
      const tQuery = query(collection(db, 'teams'), where('status', '==', 'Recruiting'));
      const tSnap = await getDocs(tQuery);
      setRecruitingTeams(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching recruitment data:", e);
    }
    setLoading(false);
  };

  const filteredPlayers = lftPlayers.filter(p => {
    if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterGame !== 'All' && p.game !== filterGame) return false;
    // Roles could be implemented in profiles, here we assume it's in a `roles` array or string, or we mock it for now
    if (filterLocation && !p.city?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
    return true;
  });

  const filteredTeams = recruitingTeams.filter(t => {
    if (searchQuery && !t.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterGame !== 'All' && t.game !== filterGame) return false;
    if (filterLocation && !t.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-24 px-6 md:px-10 max-w-7xl mx-auto pb-20 relative">
      <div className="absolute inset-0 top-0 bg-gradient-to-b from-[#00D4FF]/5 via-transparent to-transparent pointer-events-none -z-10"></div>
      
      <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic mb-4">
          Scouting <span className="text-[#00D4FF]">Grounds</span>
        </h1>
        <p className="text-[#A0A0AB] text-sm md:text-base font-body leading-relaxed max-w-2xl mx-auto">
          Discover top-tier free agents looking for their next organization, or browse elite teams currently recruiting fresh talent to complete their rosters.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 animate-in fade-in duration-700 delay-100">
        <div className="flex bg-[#0A0A0A] border border-white/10 rounded-full p-1 shadow-2xl">
          <button
            onClick={() => setActiveTab('players')}
            className={`px-8 py-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
              activeTab === 'players' 
                ? 'bg-[#00D4FF] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Free Agents ({lftPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-8 py-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
              activeTab === 'teams' 
                ? 'bg-[#00D4FF] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recruiting Teams ({recruitingTeams.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..." 
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-full pl-11 pr-4 py-3 text-white text-xs font-mono outline-none focus:border-[#00D4FF] transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-[#0A0A0A] border border-white/10 p-3 rounded-full hover:bg-white/5 transition-colors ${showFilters ? 'border-[#00D4FF] text-[#00D4FF]' : 'text-white'}`}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl mb-12 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Game Title</label>
              <select 
                value={filterGame}
                onChange={e => setFilterGame(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm font-mono"
              >
                <option value="All">All Games</option>
                {SUPPORTED_GAMES.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Required Role</label>
              <select 
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm font-mono"
              >
                <option value="All">All Roles</option>
                <option value="IGL">In-Game Leader (IGL)</option>
                <option value="Entry">Entry Fragger / Striker</option>
                <option value="Support">Support / Anchor</option>
                <option value="Coach">Coach / Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Location / Region</label>
              <input 
                type="text"
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none text-sm font-mono"
                placeholder="e.g. Lahore, Karachi, Online..."
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {activeTab === 'players' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <EsportsPlayerCard key={player.id} player={player} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[24px]">
                  <User className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-white font-display font-bold uppercase tracking-tight italic mb-2">No Free Agents</h3>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No players match your specific criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <div key={team.id} className="bg-[#0A0A0A] border border-white/5 hover:border-[#00D4FF]/30 transition-all rounded-[24px] overflow-hidden group shadow-2xl flex flex-col h-full">
                    <div className="h-32 relative">
                      <div className="absolute inset-0 bg-[#00D4FF]/5 group-hover:bg-[#00D4FF]/10 transition-colors"></div>
                      <img src={team.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800'} className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Team Banner" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-[#00D4FF]/20 border border-[#00D4FF]/40 text-[#00D4FF] px-2 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-widest backdrop-blur-md">
                        Recruiting
                      </div>
                    </div>
                    
                    <div className="px-6 -mt-8 relative z-10 flex flex-col flex-1">
                      <div className="w-16 h-16 rounded-xl bg-black border border-white/10 p-1 mb-4 shadow-xl">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full bg-[#121B2A] rounded-lg flex items-center justify-center font-display font-black text-white text-xl">
                            {team.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tight mb-2 group-hover:text-[#00D4FF] transition-colors">{team.name}</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-mono text-[#00D4FF] font-bold uppercase tracking-widest">{team.game}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                          <MapPin className="w-3 h-3" /> {team.location}
                        </div>
                      </div>
                      
                      <p className="text-sm text-[#A0A0AB] mb-6 line-clamp-3 leading-relaxed">
                        "{team.bio || 'Looking for dedicated players to fill our roster and compete in upcoming premier tournaments.'}"
                      </p>
                      
                      <div className="mb-4">
                        <div className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest mb-2">Open Roles</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-[#1A73E8]/20 border border-[#1A73E8]/40 text-[#1A73E8] rounded text-[9px] font-mono font-bold uppercase">IGL</span>
                          <span className="px-2 py-1 bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] rounded text-[9px] font-mono font-bold uppercase">Support</span>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-white/5 pt-5 pb-5 space-y-3">
                        <button className="w-full bg-[#00D4FF] hover:bg-white text-black py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                          Apply for Tryout
                        </button>
                        <Link to={`/teams`} className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors w-full px-2">
                          <span>View Team Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[24px]">
                  <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-white font-display font-bold uppercase tracking-tight italic mb-2">No Teams Recruiting</h3>
                  <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Check back later for new opportunities.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
