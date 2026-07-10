import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Users, MapPin, Award, Shield, Check, Trash2, Edit2, Image as ImageIcon, Briefcase, ChevronRight, UserCheck, Star, Trophy, Crown, Crosshair, Activity, Brain } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SUPPORTED_GAMES } from '../lib/constants';
import { useAuthContext } from '../components/global/AuthProvider';
import { ImageUpload } from '../components/shared/ImageUpload';
import { TeamCard } from '../components/features/TeamCard';

const DEFAULT_TEAM_LOGOS = [
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=150&auto=format&fit=crop&q=80'
];

const DEFAULT_TEAM_BANNERS = [
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
];

interface Team {
  id: string;
  userId?: string;
  isApproved?: boolean;
  name: string;
  game: string;
  gameId: string;
  location: string;
  color: string;
  status: 'Recruiting' | 'Roster Full';
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  sponsors: string[];
  galleryUrls: string[];
  recruitmentRoles: string[];
  secondaryGames: string[];
}

export const TeamsPage = () => {
  const { user, claims } = useAuthContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Detail Modal
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // recruitment simulation state
  const [applicantHandle, setApplicantHandle] = useState('');
  const [applicantRole, setApplicantRole] = useState('Entry Fragger');
  const [applicantMessage, setApplicantMessage] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [showApplySuccess, setShowApplySuccess] = useState(false);

  // Form Modal (Create or Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState('');

  // Team Form States
  const [formName, setFormName] = useState('');
  const [formPrimaryGame, setFormPrimaryGame] = useState(SUPPORTED_GAMES[0].id);
  const [formLocation, setFormLocation] = useState('Lahore');
  const [formColor, setFormColor] = useState('#1A73E8');
  const [formStatus, setFormStatus] = useState<'Recruiting' | 'Roster Full'>('Recruiting');
  const [formBio, setFormBio] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState(DEFAULT_TEAM_LOGOS[0]);
  const [formBannerUrl, setFormBannerUrl] = useState(DEFAULT_TEAM_BANNERS[0]);
  const [logoUrlMode, setLogoUrlMode] = useState(false);
  const [bannerUrlMode, setBannerUrlMode] = useState(false);
  const [formSponsorsText, setFormSponsorsText] = useState('');
  const [formGalleryText, setFormGalleryText] = useState('');
  const [formRecruitmentRolesText, setFormRecruitmentRolesText] = useState('');
  const [formSecondaryGames, setFormSecondaryGames] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      // Fetch Players to render Roster members dynamically
      const playersSnap = await getDocs(collection(db, 'players'));
      const playersList = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersList);

      // Fetch Tournaments for aggregated medals
      const toursSnap = await getDocs(collection(db, 'tournaments'));
      const toursList = toursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(toursList);

      // Fetch Teams
      const teamsSnap = await getDocs(collection(db, 'teams'));
      let teamsList = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

      if (teamsList.length === 0) {
        // Seed default teams if Firestore is empty
        const seeded = [
          {
            id: 't1',
            userId: 'system_seed',
            isApproved: true,
            name: 'Team Thunder',
            game: 'Tekken 8',
            gameId: 'tekken-8',
            location: 'Lahore',
            color: '#FF4444',
            status: 'Recruiting' as const,
            bio: 'Leading Tekken 8 and Street Fighter franchise squad based in Lahore. Formed in 2023 with direct investment. Currently seeking fresh talent for international qualifiers.',
            logoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
            sponsors: ['Asus ROG Pakistan', 'Jazz Super 4G'],
            galleryUrls: [
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80'
            ],
            recruitmentRoles: ['Primary Tekken Sparring Partner', 'Manager & Coach'],
            secondaryGames: ['street-fighter-6']
          },
          {
            id: 't2',
            userId: 'system_seed',
            isApproved: true,
            name: '4Thrives',
            game: 'PUBG Mobile',
            gameId: 'pubg-mobile',
            location: 'Islamabad',
            color: '#FF9900',
            status: 'Recruiting' as const,
            bio: 'Top tier PUBG Mobile lineup based in Islamabad. Join our physical and online recruitment trial bootcamps. Established top 8 regional ranking in South Asia.',
            logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            sponsors: ['Red Bull Pakistan', 'TCL Pakistan'],
            galleryUrls: [
              'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80'
            ],
            recruitmentRoles: ['Support Fragger', 'IGL Lead backup'],
            secondaryGames: ['free-fire']
          },
          {
            id: 't3',
            userId: 'system_seed',
            isApproved: true,
            name: 'Karachi Kings Esports',
            game: 'FIFAe',
            gameId: 'fifae',
            location: 'Karachi',
            color: '#1A73E8',
            status: 'Roster Full' as const,
            bio: 'Karachi-based FIFAe competitive powerhouse with multiple domestic trophies. Focused heavily on grooming school-level talent into champion players.',
            logoUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
            sponsors: ['Sony Pakistan', 'Savyour'],
            galleryUrls: [],
            recruitmentRoles: [],
            secondaryGames: []
          }
        ];

        for (const team of seeded) {
          try {
            await setDoc(doc(db, 'teams', team.id), team);
          } catch (writeErr) {
            console.warn("Teams auto-seeding skipped due to restricted permissions (expected for non-admins):", writeErr);
          }
        }
        teamsList = seeded as Team[];
      }

      setTeams(teamsList);
    } catch (err) {
      console.error("Failed to load teams registry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormId('');
    setFormName('');
    setFormPrimaryGame(SUPPORTED_GAMES[0].id);
    setFormLocation('Lahore');
    setFormColor('#1A73E8');
    setFormStatus('Recruiting');
    setFormBio('');
    setFormLogoUrl(DEFAULT_TEAM_LOGOS[0]);
    setFormBannerUrl(DEFAULT_TEAM_BANNERS[0]);
    setFormSponsorsText('');
    setFormGalleryText('');
    setFormRecruitmentRolesText('');
    setFormSecondaryGames([]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (team: Team) => {
    setIsEditing(true);
    setFormId(team.id);
    setFormName(team.name);
    setFormPrimaryGame(team.gameId || SUPPORTED_GAMES[0].id);
    setFormLocation(team.location || 'Lahore');
    setFormColor(team.color || '#1A73E8');
    setFormStatus(team.status || 'Recruiting');
    setFormBio(team.bio || '');
    setFormLogoUrl(team.logoUrl || DEFAULT_TEAM_LOGOS[0]);
    setFormBannerUrl(team.bannerUrl || DEFAULT_TEAM_BANNERS[0]);
    setFormSponsorsText(team.sponsors ? team.sponsors.join(', ') : '');
    setFormGalleryText(team.galleryUrls ? team.galleryUrls.join(', ') : '');
    setFormRecruitmentRolesText(team.recruitmentRoles ? team.recruitmentRoles.join(', ') : '');
    setFormSecondaryGames(team.secondaryGames || []);
    setShowFormModal(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setLoading(true);
    const selectedPrimaryGame = SUPPORTED_GAMES.find(g => g.id === formPrimaryGame);
    const primaryGameName = selectedPrimaryGame ? selectedPrimaryGame.name : 'Unknown Game';

    const teamPayload = {
      name: formName.trim(),
      game: primaryGameName,
      gameId: formPrimaryGame,
      location: formLocation,
      color: formColor,
      status: formStatus,
      bio: formBio.trim(),
      logoUrl: formLogoUrl,
      bannerUrl: formBannerUrl,
      sponsors: formSponsorsText.split(',').map(s => s.trim()).filter(Boolean),
      galleryUrls: formGalleryText.split(',').map(g => g.trim()).filter(Boolean),
      recruitmentRoles: formRecruitmentRolesText.split(',').map(r => r.trim()).filter(Boolean),
      secondaryGames: formSecondaryGames,
      updatedAt: new Date()
    };

    try {
      if (isEditing && formId) {
        await updateDoc(doc(db, 'teams', formId), teamPayload);
      } else {
        const uniqueId = `t_${Date.now()}`;
        await setDoc(doc(db, 'teams', uniqueId), {
          ...teamPayload,
          id: uniqueId,
          userId: user ? user.uid : 'anonymous',
          isApproved: claims?.role === 'admin' ? true : false,
          createdAt: new Date()
        });
      }
      setShowFormModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to save team details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'teams', teamId));
      setShowDetailModal(false);
      setActiveTeam(null);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete team profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSecondaryGame = (gameId: string) => {
    if (formSecondaryGames.includes(gameId)) {
      setFormSecondaryGames(formSecondaryGames.filter(g => g !== gameId));
    } else {
      setFormSecondaryGames([...formSecondaryGames, gameId]);
    }
  };

  // Simulation of recruiting applications
  const handleRecruitmentApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantHandle.trim() || !applicantMessage.trim()) return;

    const newApp = {
      id: Date.now(),
      handle: applicantHandle.trim(),
      role: applicantRole,
      message: applicantMessage.trim(),
      date: new Date().toLocaleDateString()
    };

    setApplications([newApp, ...applications]);
    setApplicantHandle('');
    setApplicantMessage('');
    setShowApplySuccess(true);
    setTimeout(() => setShowApplySuccess(false), 3000);
  };

  // Get roster affiliated dynamically
  const getTeamRoster = (teamId: string) => {
    return players.filter(p => p.teamId === teamId);
  };

  // Get tournament accomplishments
  const getTeamMedalsAndWins = (teamId: string) => {
    const finishes: Array<{ tournamentName: string; position: 1 | 2 | 3; prize: string; date: string }> = [];

    tournaments.forEach(tour => {
      if (tour.status === 'completed' && tour.results) {
        if (tour.results.firstPlaceTeamId === teamId) {
          finishes.push({ tournamentName: tour.name, position: 1, prize: tour.results.firstPlacePrize || 'First Prize', date: tour.date || 'Completed' });
        }
        if (tour.results.secondPlaceTeamId === teamId) {
          finishes.push({ tournamentName: tour.name, position: 2, prize: tour.results.secondPlacePrize || 'Second Prize', date: tour.date || 'Completed' });
        }
        if (tour.results.thirdPlaceTeamId === teamId) {
          finishes.push({ tournamentName: tour.name, position: 3, prize: tour.results.thirdPlacePrize || 'Third Prize', date: tour.date || 'Completed' });
        }
      }
    });

    return finishes;
  };

  // Filter teams list
  const filteredTeams = teams.filter(t => {
    const isApproved = t.isApproved === true;
    const isOwner = user && t.userId === user.uid;
    const isAdmin = claims?.role === 'admin';
    
    // Unapproved profiles are only visible to the owner or admins
    if (!isApproved && !isOwner && !isAdmin) {
      return false;
    }

    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.bio && t.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGame = selectedGame === 'all' || 
      t.gameId === selectedGame ||
      (t.secondaryGames && t.secondaryGames.includes(selectedGame));

    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'recruiting' && t.status === 'Recruiting') ||
      (selectedStatus === 'full' && t.status === 'Roster Full');

    return matchesSearch && matchesGame && matchesStatus;
  });

  return (
    <div className="w-full bg-transparent min-h-screen pt-12 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
      
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">Ecosystem Guilds</span>
            <span className="text-[#A0A0AB] text-xs">///</span>
            <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">Clans & Professional Teams</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tighter uppercase mb-2">Teams & Esports Clubs</h1>
          <p className="text-[#A0A0AB] font-body text-sm max-w-[600px]">
            Review top organizations competing across Pakistan. Access registered rosters, check ongoing sponsorship affiliations, and apply directly to active recruitments.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#121B2A]/70 backdrop-blur-md border border-[#2A2A35] rounded text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="Search teams by name, game or bio..."
            />
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#121B2A] hover:bg-[#00D4FF] text-white hover:text-black border-none text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] cyber-button"
          >
            <Plus className="w-4 h-4" /> Create Esports Team
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-10 bg-[#121B2A]/70 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)] p-4 rounded items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Filter Registry</span>
        </div>
        
        {/* Game Filter */}
        <select 
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">🎮 All Supported Games</option>
          {SUPPORTED_GAMES.map(game => (
            <option key={game.id} value={game.id}>{game.icon} {game.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">📌 Any Recruiting Status</option>
          <option value="recruiting">Recruiting Active</option>
          <option value="full">Roster Full</option>
        </select>

        {filteredTeams.length > 0 && (
          <span className="text-[10px] text-[#A0A0AB] ml-auto font-mono uppercase tracking-widest">
            Showing {filteredTeams.length} matches
          </span>
        )}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#121B2A]/70 backdrop-blur-md h-72 rounded border border-white/5 shadow-lg"></div>
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-20 premium-gaming-card shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-[600px] mx-auto">
          <Users className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
          <p className="font-display font-bold text-xl text-white">No esports teams found</p>
          <p className="text-sm text-[#A0A0AB] mt-2 max-w-sm mx-auto font-body">
            Try adjusting your search query, or start a new esports club and invite players to join!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#121B2A]/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] text-xs font-mono font-bold uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
          >
            Create Esports Team &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team) => {
            const roster = getTeamRoster(team.id);
            const achievements = getTeamMedalsAndWins(team.id);

            return (
              <TeamCard
                key={team.id}
                team={team}
                roster={roster}
                achievements={achievements}
                onViewDetails={() => {
                  setActiveTeam(team);
                  setShowDetailModal(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL PANEL */}
      {showDetailModal && activeTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
          <div className="premium-gaming-card w-full max-w-6xl h-auto max-h-[95vh] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300 flex flex-col">
            
            {/* Cover Banner */}
            <div className="h-44 relative bg-white/10">
              <img
                src={activeTeam.bannerUrl || DEFAULT_TEAM_BANNERS[0]}
                alt={activeTeam.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 flex items-end gap-4">
                <div 
                  className="w-20 h-20 rounded-2xl bg-[#121B2A] p-1 overflow-hidden shadow-md flex items-center justify-center font-black text-2xl"
                  style={{ color: activeTeam.color || '#1A73E8' }}
                >
                  {activeTeam.logoUrl ? (
                    <img src={activeTeam.logoUrl} alt={activeTeam.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    activeTeam.name.charAt(0)
                  )}
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activeTeam.name}</h2>
                  <p className="text-white/80 text-xs font-semibold flex items-center gap-1 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Primary: {activeTeam.game}
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenEditModal(activeTeam);
                }}
                className="absolute bottom-4 right-6 bg-[#1A73E8] hover:bg-[#1967D2] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modify Team Profile
              </button>
            </div>

            {/* Split layout */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              
              {/* Left Column info */}
              <div className="lg:col-span-1 space-y-6 lg:border-r lg:border-white/10 lg:pr-12">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Ecosystem Status</h4>
                  <div className="bg-transparent border border-white/10 p-4 rounded-2xl space-y-3.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Roster Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activeTeam.status === 'Recruiting' ? 'bg-green-100 text-green-700' : 'bg-white/10 text-gray-200'
                      }`}>
                        {activeTeam.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Location Base</span>
                      <span className="font-semibold text-white flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {activeTeam.location}
                      </span>
                    </div>

                    {activeTeam.secondaryGames && activeTeam.secondaryGames.length > 0 && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-400">Affiliated Games</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[140px]">
                          {activeTeam.secondaryGames.map(sg => {
                            const foundObj = SUPPORTED_GAMES.find(g => g.id === sg);
                            return (
                              <span key={sg} className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded font-medium">
                                {foundObj ? foundObj.name : sg}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                {/* Sponsors list */}
                {activeTeam.sponsors && activeTeam.sponsors.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Corporate Sponsors</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeTeam.sponsors.map((sponsor, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#E8F0FE] text-[#1A73E8] text-xs font-semibold rounded-lg border border-blue-50 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#1A73E8]" />
                          {sponsor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Medals aggregated from Completed Tournaments */}
                {getTeamMedalsAndWins(activeTeam.id).length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Ecosystem Team Medals</h4>
                    <div className="space-y-2">
                      {getTeamMedalsAndWins(activeTeam.id).map((finish, idx) => (
                        <div key={idx} className="p-3 border border-yellow-200 bg-yellow-50/30 rounded-2xl flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            finish.position === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                            finish.position === 2 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                            'bg-amber-100 text-amber-700 border border-amber-300'
                          }`}>
                            {finish.position === 1 ? '🥇' : finish.position === 2 ? '🥈' : '🥉'}
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-white line-clamp-1">{finish.tournamentName}</h5>
                            <p className="text-[10px] text-yellow-700 font-bold">{finish.prize}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                {/* Right Columns: Roster Grid, Photos, and Recruitment Form */}
                <div className="lg:col-span-2 space-y-10">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Club Biography</h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-transparent p-4 rounded-2xl border border-white/10">
                    {activeTeam.bio || 'No custom bio provided.'}
                  </p>
                </div>

                {/* Roster Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Active Guild Roster</h4>
                  
                  {getTeamRoster(activeTeam.id).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getTeamRoster(activeTeam.id).map((member, index) => {
                        // Mock roles for visual purposes since it might not be in DB yet
                        const mockRoles = [
                          { name: 'IGL', icon: <Crown className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                          { name: 'Entry', icon: <Crosshair className="w-3.5 h-3.5" />, color: 'text-red-400', bg: 'bg-red-400/10' },
                          { name: 'Support', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                          { name: 'Flex', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                          { name: 'Coach', icon: <Brain className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                        ];
                        // Assign a specific mock role based on index to ensure variety
                        const role = mockRoles[index % mockRoles.length];

                        return (
                          <div key={member.id} className="relative group p-4 bg-gradient-to-br from-[#121B2A] to-[#0A0A0A] border border-white/5 hover:border-[#00D4FF]/30 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all cursor-pointer overflow-hidden">
                            {/* Hover light effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/0 via-[#00D4FF]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                            
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-14 h-14 rounded-[14px] object-cover border border-white/10 group-hover:border-[#00D4FF]/50 transition-colors z-10"
                            />
                            
                            <div className="flex-1 z-10">
                              <h5 className="font-display font-bold text-base text-white group-hover:text-[#00D4FF] transition-colors">{member.name}</h5>
                              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{member.city || 'Unknown Region'}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 z-10">
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${role.bg} ${role.color} border border-current border-opacity-20`}>
                                {role.icon}
                                <span className="text-[9px] font-bold uppercase tracking-widest">{role.name}</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                                {member.rating || 'OVR 85'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-transparent border border-dashed border-white/10 p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Roster currently empty.</p>
                      <p className="text-[10px] text-gray-500 mt-1">Players must link this team in their profiles.</p>
                    </div>
                  )}
                </div>

                {/* Image Gallery */}
                {activeTeam.galleryUrls && activeTeam.galleryUrls.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4 text-purple-600" /> Event & Bootcamp Photos
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {activeTeam.galleryUrls.map((gUrl, idx) => (
                        <div key={idx} className="h-32 rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-white/10">
                          <img src={gUrl} alt="camp gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruitment application system */}
                {activeTeam.status === 'Recruiting' && (
                  <div className="border border-white/10 bg-transparent p-5 rounded-3xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#1A73E8]" /> Interactive Recruitment Desk
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">
                      This team is actively hiring. Apply now! Target Roles: {activeTeam.recruitmentRoles?.join(', ') || 'Roster Competitors'}.
                    </p>

                    <form onSubmit={handleRecruitmentApply} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={applicantHandle}
                          onChange={(e) => setApplicantHandle(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-300 bg-[#121B2A] rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1A73E8]"
                          placeholder="Your Gamer Tag/Handle..."
                        />
                        <select
                          value={applicantRole}
                          onChange={(e) => setApplicantRole(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-300 bg-[#121B2A] rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1A73E8]"
                        >
                          <option value="Entry Fragger">Entry Fragger</option>
                          <option value="IGL / Captain">IGL / Captain</option>
                          <option value="Support / Lurker">Support / Lurker</option>
                          <option value="Coach / Trainer">Coach / Trainer</option>
                        </select>
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={applicantMessage}
                        onChange={(e) => setApplicantMessage(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 bg-[#121B2A] rounded-lg text-xs outline-none resize-none focus:ring-1 focus:ring-[#1A73E8]"
                        placeholder="Tell the recruiting managers about your rank, previous teams, and why you would thrive in Team Roster..."
                      />

                      <div className="flex justify-between items-center">
                        {showApplySuccess && (
                          <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                            <UserCheck className="w-3.5 h-3.5" /> Application sent successfully!
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1967D2] text-white text-[11px] font-bold rounded-lg ml-auto transition-colors"
                        >
                          Submit Trial Application
                        </button>
                      </div>
                    </form>

                    {/* Simulation logs of applicants */}
                    {applications.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase">Received Inquiries ({applications.length})</span>
                        {applications.map((app) => (
                          <div key={app.id} className="p-2.5 bg-[#121B2A] border border-white/10 rounded-xl text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-200">{app.handle}</span>
                              <span className="px-2 py-0.5 bg-[#00D4FF]/10 text-[#1A73E8] rounded text-[9px] font-bold">{app.role}</span>
                            </div>
                            <p className="text-gray-300 text-[11px] italic">"{app.message}"</p>
                            <span className="text-[9px] text-gray-400 mt-1 block">{app.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Bottom danger zone */}
            <div className="px-6 py-4 bg-transparent/5 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
              <span className="text-gray-400">ID: {activeTeam.id}</span>
              <button
                onClick={() => handleDeleteTeam(activeTeam.id)}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Team Profile
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (CREATE OR EDIT) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          {!user ? (
            <div className="premium-gaming-card w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 p-6 sm:p-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <Shield className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3 uppercase">Login Required</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You must be signed in to E-Sports Pakistan to register or modify an esports club profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 bg-[#00D4FF] hover:bg-white text-black font-bold rounded-xl transition-all text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                >
                  Go to Login
                </a>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="inline-flex items-center justify-center px-8 py-3 border border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl transition-all text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-gaming-card w-full max-w-5xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00D4FF]/10 text-[#1A73E8] rounded-2xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {isEditing ? "Modify Esports Club Profile" : "Register New Esports Club"}
                  </h2>
                  <p className="text-[11px] text-gray-400">Construct your team identity, recruit members, and secure sponsors</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-gray-400 hover:text-gray-300 p-1.5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="overflow-y-auto p-6 space-y-7 flex-1 bg-[#121B2A]">
              
              {/* Basic configuration */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">1</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Club Specifications</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Team / Esports Club Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                          formName.trim().length >= 3 
                            ? 'border-green-500 focus:ring-4 focus:ring-green-100' 
                            : formName.trim().length > 0 
                              ? 'border-amber-400 focus:ring-4 focus:ring-amber-100' 
                              : 'border-white/10 focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8]'
                        }`}
                        placeholder="E.g., Karachi Vipers"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {formName.trim().length >= 3 ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : formName.trim().length > 0 ? (
                          <span className="text-[10px] text-amber-500 font-bold">Short</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Min 3 characters. Your official team branding name.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Location Base (City)</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                    <span className="text-[10px] text-gray-400 block">Where your core gaming house is stationed in Pakistan.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Primary Competitive Game</label>
                    <select
                      value={formPrimaryGame}
                      onChange={(e) => setFormPrimaryGame(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      {SUPPORTED_GAMES.map(game => (
                        <option key={game.id} value={game.id}>{game.icon} {game.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 block">Your flagship competitive game arena.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Roster Recruitment Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      <option value="Recruiting">Actively Recruiting (Hiring Candidates)</option>
                      <option value="Roster Full">Roster Full / Locked</option>
                    </select>
                    <span className="text-[10px] text-gray-400 block">Advertises if player applications are open.</span>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Branding Color Accent & Custom Preview</label>
                      <span className="text-[10px] bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full font-bold">Dynamic Paint</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="w-14 h-12 border border-white/10 rounded-xl outline-none cursor-pointer p-1 bg-[#121B2A] shrink-0 hover:border-gray-400 transition-all"
                      />
                      <div className="flex-1 bg-transparent/5 border border-white/10 p-2.5 rounded-xl flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                          style={{ backgroundColor: formColor, boxShadow: `0 0 10px ${formColor}40` }}
                        >
                          ★
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-gray-200">{formName || 'Karachi Esports Club'}</span>
                          <span className="block text-[9px] text-gray-400 font-semibold uppercase tracking-wider" style={{ color: formColor }}>
                            Hex: {formColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Club Bio / Mission Statement</label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        formBio.length > 450 ? 'bg-red-50 text-red-500' : 'bg-white/10 text-gray-400'
                      }`}>
                        {formBio.length}/500 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      maxLength={500}
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none resize-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="Details about active bootcamps, training protocols, league wins, and sponsor opportunities..."
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Introduce your team vision to sponsors and pro players.</span>
                      {formBio.length < 40 && formBio.length > 0 ? (
                        <span className="text-amber-500 font-medium">Description is short (aim for at least 40 chars)</span>
                      ) : formBio.length >= 40 ? (
                        <span className="text-green-600 font-medium flex items-center gap-0.5"><Check className="w-3 h-3" /> Perfect description size</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphic Asset Section */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">2</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Graphic Assets & Presets</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Logo Graphic</span>
                        <button
                          type="button"
                          onClick={() => setLogoUrlMode(!logoUrlMode)}
                          className="text-xs text-[#1A73E8] hover:underline"
                        >
                          {logoUrlMode ? "Upload Image instead" : "Paste Image URL instead"}
                        </button>
                      </div>
                      {logoUrlMode ? (
                        <input
                          type="text"
                          value={formLogoUrl}
                          onChange={(e) => setFormLogoUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-[#121B2A] text-white"
                          placeholder="https://images.unsplash.com/... or paste image URL"
                        />
                      ) : (
                        <ImageUpload
                          label="Upload Custom Team Logo"
                          storagePath="teams/logos"
                          currentUrl={DEFAULT_TEAM_LOGOS.includes(formLogoUrl) ? '' : formLogoUrl}
                          onUploadComplete={(url) => { if (url) setFormLogoUrl(url); }}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Or Choose Logo Preset</span>
                      <div className="flex flex-wrap gap-3">
                        {DEFAULT_TEAM_LOGOS.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFormLogoUrl(url)}
                            className={`w-14 h-14 rounded-2xl cursor-pointer border-2 overflow-hidden transition-all relative group hover:scale-105 hover:shadow-md ${
                              formLogoUrl === url ? 'border-[#1A73E8] ring-4 ring-blue-50 shadow-md scale-105' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt="logo preset" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                            {formLogoUrl === url && (
                              <div className="absolute inset-0 bg-[#1A73E8]/30 flex items-center justify-center">
                                <div className="bg-[#121B2A] p-1 rounded-full shadow-md">
                                  <Check className="w-3.5 h-3.5 text-[#1A73E8]" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Banner Graphic</span>
                        <button
                          type="button"
                          onClick={() => setBannerUrlMode(!bannerUrlMode)}
                          className="text-xs text-[#1A73E8] hover:underline"
                        >
                          {bannerUrlMode ? "Upload Image instead" : "Paste Image URL instead"}
                        </button>
                      </div>
                      {bannerUrlMode ? (
                        <input
                          type="text"
                          value={formBannerUrl}
                          onChange={(e) => setFormBannerUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-[#121B2A] text-white"
                          placeholder="https://images.unsplash.com/... or paste image URL"
                        />
                      ) : (
                        <ImageUpload
                          label="Upload Custom Club Banner"
                          storagePath="teams/banners"
                          currentUrl={DEFAULT_TEAM_BANNERS.includes(formBannerUrl) ? '' : formBannerUrl}
                          onUploadComplete={(url) => { if (url) setFormBannerUrl(url); }}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Or Choose Banner Preset</span>
                      <div className="grid grid-cols-3 gap-3">
                        {DEFAULT_TEAM_BANNERS.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFormBannerUrl(url)}
                            className={`h-16 rounded-xl cursor-pointer border-2 overflow-hidden relative group hover:scale-105 hover:shadow-md transition-all ${
                              formBannerUrl === url ? 'border-[#1A73E8] ring-4 ring-blue-50 shadow-md scale-105' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt="banner preset" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                            {formBannerUrl === url && (
                              <div className="absolute inset-0 bg-[#1A73E8]/30 flex items-center justify-center">
                                <div className="bg-[#121B2A] p-1 rounded-full shadow-md">
                                  <Check className="w-3.5 h-3.5 text-[#1A73E8]" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary game tags */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">3</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Multi-Game Guild Expansion</h3>
                </div>
                
                <span className="block text-[11px] text-gray-400 font-semibold mb-1">Select secondary game divisions your esports club represents in tournaments:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SUPPORTED_GAMES.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleToggleSecondaryGame(game.id)}
                      className={`p-3 border rounded-xl cursor-pointer text-xs font-bold flex items-center gap-2 transition-all active:scale-95 hover:shadow-sm ${
                        formSecondaryGames.includes(game.id)
                          ? 'border-[#1A73E8] bg-[#00D4FF]/10 text-[#1A73E8] ring-2 ring-blue-100 shadow-sm'
                          : 'border-white/10 hover:bg-transparent/5 text-gray-300 bg-[#121B2A]'
                      }`}
                    >
                      <span className="text-base shrink-0">{game.icon}</span>
                      <span className="truncate">{game.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corporate Sponsors, Galleries, open positions */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">4</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Media, Sponsors & Open Divisions</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Corporate Sponsors (Comma-separated list)</label>
                    <input
                      type="text"
                      value={formSponsorsText}
                      onChange={(e) => setFormSponsorsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="Sony Pakistan, Red Bull, Logitech G, Razer"
                    />
                    <span className="text-[10px] text-gray-400 block">List corporate partners supporting your esports roster.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Recruiting Open Positions (Comma-separated list)</label>
                    <input
                      type="text"
                      value={formRecruitmentRolesText}
                      onChange={(e) => setFormRecruitmentRolesText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="Entry Fragger, IGL backup, Tekken 8 Coach, Manager"
                    />
                    <span className="text-[10px] text-gray-400 block">List specific positions you are actively looking to hire.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Gallery Image URLs (Comma-separated, absolute URLs)</label>
                    <input
                      type="text"
                      value={formGalleryText}
                      onChange={(e) => setFormGalleryText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600, https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600"
                    />
                    <span className="text-[10px] text-gray-400 block">Provide high-resolution image links to demonstrate bootcamps and team gear.</span>
                    
                    {formGalleryText && formGalleryText.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                      <div className="mt-3 p-4 bg-transparent/5 border border-white/10 rounded-2xl">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Live Gallery Thumbnail Previews</span>
                        <div className="flex flex-wrap gap-2.5">
                          {formGalleryText.split(',').map((url, index) => {
                            const trimmedUrl = url.trim();
                            if (!trimmedUrl) return null;
                            return (
                              <div key={index} className="w-16 h-12 rounded-lg border border-gray-300 bg-[#121B2A] overflow-hidden shadow-inner hover:scale-105 transition-all">
                                <img 
                                  src={trimmedUrl} 
                                  alt="thumbnail preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Hide broken links or replace
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=60&auto=format';
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-6 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2.5 border border-white/10 hover:bg-transparent/5 text-gray-400 font-semibold rounded-full text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-[#1A73E8] hover:bg-[#1967D2] text-white font-semibold rounded-full text-xs transition-all shadow-md flex items-center gap-1.5 ml-auto hover:shadow-lg active:scale-95"
                >
                  <Check className="w-4 h-4" /> Save Esports Team Card
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
