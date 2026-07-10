import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Calendar, Trophy, Users, Shield, Check, Trash2, Edit2, Play, ChevronRight, Gift, CircleDot, Info, Star, Award } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SUPPORTED_GAMES, PLATFORMS } from '../lib/constants';
import { useAuthContext } from '../components/global/AuthProvider';
import { ImageUpload } from '../components/shared/ImageUpload';

import { VisualBracket } from '../components/features/VisualBracket';

const DEFAULT_TOURNAMENT_BANNERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&auto=format&fit=crop&q=80'
];

interface TournamentResults {
  firstPlaceTeamId: string;
  firstPlaceTeamName: string;
  firstPlacePrize: string;
  firstPlacePlayerId: string; // MVP player reference
  firstPlacePlayerName: string;

  secondPlaceTeamId: string;
  secondPlaceTeamName: string;
  secondPlacePrize: string;

  thirdPlaceTeamId: string;
  thirdPlaceTeamName: string;
  thirdPlacePrize: string;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  gameId: string;
  platform: string;
  prize: string; // E.g., "Rs. 500,000"
  entryFee: string; // E.g., "Rs. 1,500" or "Free"
  date: string; // E.g., "Aug 15 - Aug 17, 2026"
  registeredCount: number;
  maxTeams: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  bannerUrl: string;
  rules: string[];
  registeredTeamsList: string[]; // List of team names registered
  results?: TournamentResults;
}

export const TournamentsPage = () => {
  const { user, claims } = useAuthContext();
  const isAdmin = claims?.role === 'admin' || (user?.email && ['infowarspakistan@gmail.com', 'infowarspakistan@gmail.cin'].includes(user.email.toLowerCase()));
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Detail Modal
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Registration simulation inside detail view
  const [selectedRegisterTeamId, setSelectedRegisterTeamId] = useState('');
  const [customRegisterTeamName, setCustomRegisterTeamName] = useState('');
  const [showRegSuccess, setShowRegSuccess] = useState(false);

  // Form Modal (Create or Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState('');

  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formGameId, setFormGameId] = useState(SUPPORTED_GAMES[0].id);
  const [formPlatform, setFormPlatform] = useState(PLATFORMS[0].name);
  const [formPrize, setFormPrize] = useState('Rs. 100,000');
  const [formEntryFee, setFormEntryFee] = useState('Free');
  const [formDate, setFormDate] = useState('Aug 15 - Aug 17, 2026');
  const [formMaxTeams, setFormMaxTeams] = useState(32);
  const [formStatus, setFormStatus] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [formBannerUrl, setFormBannerUrl] = useState(DEFAULT_TOURNAMENT_BANNERS[0]);
  const [bannerUrlMode, setBannerUrlMode] = useState(false);
  const [formRulesText, setFormRulesText] = useState('1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.\n3. Discord communication is mandatory.');

  // Form Podium Results (only relevant if completed)
  const [resFirstTeam, setResFirstTeam] = useState('none');
  const [resFirstPrize, setResFirstPrize] = useState('Rs. 50,000');
  const [resFirstPlayer, setResFirstPlayer] = useState('none');
  const [resSecondTeam, setResSecondTeam] = useState('none');
  const [resSecondPrize, setResSecondPrize] = useState('Rs. 30,000');
  const [resThirdTeam, setResThirdTeam] = useState('none');
  const [resThirdPrize, setResThirdPrize] = useState('Rs. 20,000');

  const fetchData = async () => {
    try {
      // Fetch Teams for dropdowns and associations
      const teamsSnap = await getDocs(collection(db, 'teams'));
      const teamsList = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);

      // Fetch Players for MVP selection
      const playersSnap = await getDocs(collection(db, 'players'));
      const playersList = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersList);
    } catch (err) {
      console.error("Failed to load metadata in tournaments:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for tournaments
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'tournaments'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default tournaments
        const seeded: Tournament[] = [
          {
            id: 't_1',
            name: 'National Tekken Championship 2026',
            game: 'Tekken 8',
            gameId: 'tekken-8',
            platform: 'PlayStation 5',
            prize: 'Rs. 500,000',
            entryFee: 'Rs. 1,500',
            date: 'Aug 15 - Aug 17, 2026',
            registeredCount: 32,
            maxTeams: 64,
            status: 'upcoming',
            bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            rules: [
              'Matches are 3 out of 5 rounds, 60 seconds each.',
              'Loser of previous game may switch character. Winner must lock character.',
              'Direct connection lag test will be conducted in lobbies.',
              'Players must report with screenshots on Discord.'
            ],
            registeredTeamsList: ['Team Thunder', 'Karachi Kings Esports']
          },
          {
            id: 't_2',
            name: 'PUBG Mobile Pakistan Cup',
            game: 'PUBG Mobile',
            gameId: 'pubg-mobile',
            platform: 'Mobile',
            prize: 'Rs. 1,000,000',
            entryFee: 'Free Entry',
            date: 'Sep 02 - Sep 10, 2026',
            registeredCount: 48,
            maxTeams: 128,
            status: 'ongoing',
            bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
            rules: [
              'Squad mode matches played on Erangel, Miramar, and Sanhok.',
              'Points distribution according to official global formats.',
              'Tablet devices are strictly forbidden. Mobile phones only.',
              'Emulators are automatically flagged and disqualified.'
            ],
            registeredTeamsList: ['4Thrives', 'Desert Falcons']
          },
          {
            id: 't_3',
            name: 'Peshawar Showdown Cup',
            game: 'Tekken 8',
            gameId: 'tekken-8',
            platform: 'PlayStation 5',
            prize: 'Rs. 200,000',
            entryFee: 'Rs. 500',
            date: 'Jun 10 - Jun 12, 2026',
            registeredCount: 16,
            maxTeams: 16,
            status: 'completed',
            bannerUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&auto=format&fit=crop&q=80',
            rules: [
              'Standard double elimination pool brackets.',
              'Offline venue report required in Peshawar Club.'
            ],
            registeredTeamsList: ['Team Thunder', 'Karachi Kings Esports'],
            results: {
              firstPlaceTeamId: 't1',
              firstPlaceTeamName: 'Team Thunder',
              firstPlacePrize: 'Rs. 100,000',
              firstPlacePlayerId: 'p_1',
              firstPlacePlayerName: 'Ahmad Khan',
              secondPlaceTeamId: 't3',
              secondPlaceTeamName: 'Karachi Kings Esports',
              secondPlacePrize: 'Rs. 60,000',
              thirdPlaceTeamId: 'none',
              thirdPlaceTeamName: 'Free Agents XI',
              thirdPlacePrize: 'Rs. 40,000'
            }
          }
        ];

        for (const tour of seeded) {
          try {
            await setDoc(doc(db, 'tournaments', tour.id), tour);
          } catch (writeErr) {
            console.warn("Tournaments auto-seeding skipped due to restricted permissions (expected for non-admins):", writeErr);
          }
        }
        setTournaments(seeded);
      } else {
        setTournaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament)));
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to subscribe to tournaments in TournamentsPage:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormId('');
    setFormName('');
    setFormGameId(SUPPORTED_GAMES[0].id);
    setFormPlatform(PLATFORMS[0].name);
    setFormPrize('Rs. 150,000');
    setFormEntryFee('Free');
    setFormDate('Aug 15 - Aug 17, 2026');
    setFormMaxTeams(32);
    setFormStatus('upcoming');
    setFormBannerUrl(DEFAULT_TOURNAMENT_BANNERS[0]);
    setFormRulesText('1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.\n3. Discord communication is mandatory.');
    
    // reset podiums
    setResFirstTeam('none');
    setResFirstPrize('Rs. 75,000');
    setResFirstPlayer('none');
    setResSecondTeam('none');
    setResSecondPrize('Rs. 45,000');
    setResThirdTeam('none');
    setResThirdPrize('Rs. 30,000');
    
    setShowFormModal(true);
  };

  const handleOpenEditModal = (tour: Tournament) => {
    setIsEditing(true);
    setFormId(tour.id);
    setFormName(tour.name);
    setFormGameId(tour.gameId || SUPPORTED_GAMES[0].id);
    setFormPlatform(tour.platform || PLATFORMS[0].name);
    setFormPrize(tour.prize || 'Rs. 100,000');
    setFormEntryFee(tour.entryFee || 'Free');
    setFormDate(tour.date || 'Aug 15 - Aug 17, 2026');
    setFormMaxTeams(tour.maxTeams || 32);
    setFormStatus(tour.status || 'upcoming');
    setFormBannerUrl(tour.bannerUrl || DEFAULT_TOURNAMENT_BANNERS[0]);
    setFormRulesText(tour.rules ? tour.rules.join('\n') : '');

    // Set existing results if any
    if (tour.results) {
      setResFirstTeam(tour.results.firstPlaceTeamId || 'none');
      setResFirstPrize(tour.results.firstPlacePrize || 'Rs. 50,000');
      setResFirstPlayer(tour.results.firstPlacePlayerId || 'none');
      setResSecondTeam(tour.results.secondPlaceTeamId || 'none');
      setResSecondPrize(tour.results.secondPlacePrize || 'Rs. 30,000');
      setResThirdTeam(tour.results.thirdPlaceTeamId || 'none');
      setResThirdPrize(tour.results.thirdPlacePrize || 'Rs. 20,000');
    } else {
      setResFirstTeam('none');
      setResFirstPrize('Rs. 50,000');
      setResFirstPlayer('none');
      setResSecondTeam('none');
      setResSecondPrize('Rs. 30,000');
      setResThirdTeam('none');
      setResThirdPrize('Rs. 20,000');
    }

    setShowFormModal(true);
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setLoading(true);
    const selectedGameObj = SUPPORTED_GAMES.find(g => g.id === formGameId);
    const gameName = selectedGameObj ? selectedGameObj.name : 'Unknown Game';

    // Construct results payload if completed
    let resultsPayload: TournamentResults | undefined = undefined;
    if (formStatus === 'completed') {
      const matchFirstTeam = teams.find(t => t.id === resFirstTeam);
      const matchFirstPlayer = players.find(p => p.id === resFirstPlayer);
      const matchSecondTeam = teams.find(t => t.id === resSecondTeam);
      const matchThirdTeam = teams.find(t => t.id === resThirdTeam);

      resultsPayload = {
        firstPlaceTeamId: resFirstTeam,
        firstPlaceTeamName: matchFirstTeam ? matchFirstTeam.name : 'Free Agents Club',
        firstPlacePrize: resFirstPrize,
        firstPlacePlayerId: resFirstPlayer,
        firstPlacePlayerName: matchFirstPlayer ? matchFirstPlayer.name : 'None / Team MVP',
        secondPlaceTeamId: resSecondTeam,
        secondPlaceTeamName: matchSecondTeam ? matchSecondTeam.name : 'Independent Clan',
        secondPlacePrize: resSecondPrize,
        thirdPlaceTeamId: resThirdTeam,
        thirdPlaceTeamName: matchThirdTeam ? matchThirdTeam.name : 'Underdogs Esports',
        thirdPlacePrize: resThirdPrize
      };
    }

    const tournamentPayload = {
      name: formName.trim(),
      game: gameName,
      gameId: formGameId,
      platform: formPlatform,
      prize: formPrize,
      entryFee: formEntryFee,
      date: formDate,
      maxTeams: Number(formMaxTeams),
      status: formStatus,
      bannerUrl: formBannerUrl,
      rules: formRulesText.split('\n').map(r => r.trim()).filter(Boolean),
      ...(resultsPayload ? { results: resultsPayload } : {}),
      updatedAt: new Date()
    };

    try {
      if (isEditing && formId) {
        await updateDoc(doc(db, 'tournaments', formId), tournamentPayload);
      } else {
        const uniqueId = `t_${Date.now()}`;
        await setDoc(doc(db, 'tournaments', uniqueId), {
          ...tournamentPayload,
          id: uniqueId,
          registeredCount: 0,
          registeredTeamsList: [],
          createdAt: new Date()
        });
      }
      setShowFormModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to save tournament details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tourId: string) => {
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'tournaments', tourId));
      setShowDetailModal(false);
      setActiveTournament(null);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete tournament:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tournament Registration submission simulation
  const handleRegisterTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTournament) return;

    let teamNameToRegister = '';
    if (selectedRegisterTeamId === 'custom') {
      if (!customRegisterTeamName.trim()) return;
      teamNameToRegister = customRegisterTeamName.trim();
    } else {
      const match = teams.find(t => t.id === selectedRegisterTeamId);
      if (!match) return;
      teamNameToRegister = match.name;
    }

    // Guard if already registered
    if (activeTournament.registeredTeamsList?.includes(teamNameToRegister)) {
      alert("This esports team is already registered for this tournament.");
      return;
    }

    setLoading(true);
    try {
      const updatedTeamsList = [...(activeTournament.registeredTeamsList || []), teamNameToRegister];
      const updatedCount = (activeTournament.registeredCount || 0) + 1;

      await updateDoc(doc(db, 'tournaments', activeTournament.id), {
        registeredTeamsList: updatedTeamsList,
        registeredCount: updatedCount
      });

      // Update local state in view
      const updatedTour: Tournament = {
        ...activeTournament,
        registeredTeamsList: updatedTeamsList,
        registeredCount: updatedCount
      };

      setActiveTournament(updatedTour);
      setSelectedRegisterTeamId('');
      setCustomRegisterTeamName('');
      setShowRegSuccess(true);
      setTimeout(() => setShowRegSuccess(false), 3000);
      await fetchData();
    } catch (err) {
      console.error("Failed to submit team registration:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.game.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGame = selectedGame === 'all' || t.gameId === selectedGame;
    const matchesPlatform = selectedPlatform === 'all' || t.platform.includes(selectedPlatform);
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesGame && matchesPlatform && matchesStatus;
  });

  return (
    <div className="w-full bg-transparent min-h-screen pt-12 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">Tournament Hub</span>
            <span className="text-[#A0A0AB] text-xs">///</span>
            <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">From Grassroots to Glory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tighter uppercase mb-2">Tournaments & Championships</h1>
          <p className="text-[#A0A0AB] font-body text-sm max-w-[600px]">
            Compete for huge prize pools across Pakistan. View match rules, explore visual elimination brackets, register your guild, and track real-time podium results.
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
              placeholder="Search tournaments by title..."
            />
          </div>
          
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#121B2A] hover:bg-[#00D4FF] text-white hover:text-black border-none text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] cyber-button"
            >
              <Plus className="w-4 h-4" /> Create Tournament
            </button>
          )}
        </div>
      </div>

      {/* Grid Filters */}
      <div className="flex flex-wrap gap-4 mb-10 bg-[#121B2A]/70 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)] p-4 rounded items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Filter Events</span>
        </div>
        
        {/* Game filter */}
        <select 
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">🎮 All Games</option>
          {SUPPORTED_GAMES.map(game => (
            <option key={game.id} value={game.id}>
              {game.icon.startsWith('http') ? '🎮' : game.icon} {game.name}
            </option>
          ))}
        </select>

        {/* Platform filter */}
        <select 
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">🖥️ All Platforms</option>
          {PLATFORMS.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">📌 Any Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        {filteredTournaments.length > 0 && (
          <span className="text-[10px] text-[#A0A0AB] ml-auto font-mono uppercase tracking-widest">
            Showing {filteredTournaments.length} matches
          </span>
        )}
      </div>

      {/* Tournaments List Grid */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="bg-[#121B2A]/70 backdrop-blur-md h-40 rounded border border-white/5 shadow-lg"></div>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-20 premium-gaming-card shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-[600px] mx-auto">
          <Trophy className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
          <p className="font-display font-bold text-xl text-white">No tournaments listed</p>
          <p className="text-sm text-[#A0A0AB] mt-2 max-w-sm mx-auto font-body">
            Try adjusting your filter search, or setup a brand new competitive championship right now.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#121B2A] hover:bg-[#00D4FF] text-white hover:text-black border-none text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] cyber-button"
            >
              Create Tournament &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTournaments.map((tour) => {
            return (
              <div
                key={tour.id}
                onClick={() => {
                  setActiveTournament(tour);
                  setShowDetailModal(true);
                }}
                className="premium-gaming-card overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-stretch cursor-pointer group cyber-angled-border scanline-effect cyber-glow-row relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/50 -z-10 pointer-events-none"></div>
                {/* Banner Thumbnail */}
                <div className="w-full md:w-64 h-40 md:h-auto relative shrink-0 bg-[#2A2A35] border-r border-white/5">
                  <img
                    src={tour.bannerUrl || DEFAULT_TOURNAMENT_BANNERS[0]}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14141E]/80 to-transparent"></div>
                  
                  {/* Status Badge overlay */}
                  <span className={`absolute top-4 left-4 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
                    tour.status === 'upcoming' ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]' :
                    tour.status === 'ongoing' ? 'bg-[#FF4444]/20 text-[#FF4444] border-[#FF4444]/50 shadow-[0_0_10px_rgba(255,68,68,0.3)]' :
                    'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.3)]'
                  }`}>
                    {tour.status}
                  </span>
                </div>

                {/* Content body info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#121B2A]/5 text-white text-[10px] font-mono font-bold rounded border border-white/10 uppercase tracking-widest">
                          {tour.game}
                        </span>
                        <span className="px-2 py-0.5 bg-[#121B2A]/5 text-[#A0A0AB] text-[10px] font-mono font-bold rounded border border-white/10 uppercase tracking-widest">
                          {tour.platform}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModal(tour)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121B2A] hover:bg-[#00D4FF] border border-[#2A2A35] hover:border-[#00D4FF] text-white hover:text-black rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                            title="Edit Tournament"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          
                          {deletingId === tour.id ? (
                            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/50 rounded px-2 py-1">
                              <span className="text-[9px] text-red-400 font-bold font-mono mr-0.5">Confirm?</span>
                              <button
                                onClick={() => handleDeleteTournament(tour.id)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-mono font-bold uppercase transition-all"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[9px] font-mono font-bold uppercase transition-all"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(tour.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-400 hover:text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                              title="Delete Tournament"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-[#00D4FF] transition-colors leading-tight mb-4 tracking-tight">
                      {tour.name}
                    </h3>

                    {/* Metadata timeline details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#A0A0AB] font-mono font-bold uppercase tracking-widest">Prize Pool</span>
                        <p className="font-bold text-[#00D4FF]">{tour.prize}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#A0A0AB] font-mono font-bold uppercase tracking-widest">Entry Fee</span>
                        <p className="font-semibold text-white">{tour.entryFee}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#A0A0AB] font-mono font-bold uppercase tracking-widest">Registered</span>
                        <p className="font-semibold text-white">{tour.registeredCount || 0} / {tour.maxTeams} Guilds</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#A0A0AB] font-mono font-bold uppercase tracking-widest">Schedule</span>
                        <p className="font-semibold text-white truncate">{tour.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Results Podium short-preview if completed */}
                  {tour.status === 'completed' && tour.results && (
                    <div className="mt-6 pt-4 border-t border-dashed border-white/10 flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-[#FFD700] flex items-center gap-1 uppercase tracking-widest">🥇 1st: {tour.results.firstPlaceTeamName}</span>
                      <span className="text-[#A0A0AB]">///</span>
                      <span className="text-white font-bold uppercase tracking-widest">🥈 2nd: {tour.results.secondPlaceTeamName}</span>
                      <span className="text-[#A0A0AB]">///</span>
                      <span className="text-[#00D4FF] font-bold uppercase tracking-widest">MVP: {tour.results.firstPlacePlayerName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {showDetailModal && activeTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
          <div className="premium-gaming-card w-full max-w-6xl h-auto max-h-[95vh] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300 flex flex-col">
            
            {/* Header banner */}
            <div className="h-44 relative bg-white/10 shrink-0">
              <img
                src={activeTournament.bannerUrl || DEFAULT_TOURNAMENT_BANNERS[0]}
                alt={activeTournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold uppercase rounded">{activeTournament.status}</span>
                    <span className="text-white/85 text-xs font-semibold">{activeTournament.game} • {activeTournament.platform}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{activeTournament.name}</h2>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenEditModal(activeTournament);
                    }}
                    className="bg-[#00D4FF] hover:bg-[#00B4D8] text-black font-mono uppercase tracking-wider px-4 py-2 rounded text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Tournament
                  </button>
                )}
              </div>
            </div>

            {/* Split layout */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                
                {/* Left Column Info and registered teams */}
                <div className="lg:col-span-1 space-y-6 lg:border-r lg:border-white/10 lg:pr-12">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Key Metrics</h4>
                  <div className="bg-transparent border border-white/10 p-4 rounded-2xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Prize pool</span>
                      <span className="font-bold text-[#1A73E8] text-sm">{activeTournament.prize}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="font-semibold text-white">{activeTournament.entryFee}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Guild registrations</span>
                      <span className="font-semibold text-white">{activeTournament.registeredCount || 0} / {activeTournament.maxTeams} Teams</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Schedule</span>
                      <span className="font-semibold text-white">{activeTournament.date}</span>
                    </div>
                  </div>
                </div>

                {/* List of registered clans */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Registered Clans ({activeTournament.registeredCount || 0})</h4>
                  {activeTournament.registeredTeamsList && activeTournament.registeredTeamsList.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {activeTournament.registeredTeamsList.map((tName, idx) => (
                        <div key={idx} className="px-3 py-2 bg-transparent/5 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-semibold text-white cyber-glow-row transition-all duration-300">
                          <Shield className="w-3.5 h-3.5 text-[#00D4FF]" />
                          <span>{tName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 bg-transparent/5 p-3 rounded-xl border border-white/10 text-center">No clubs registered yet.</p>
                  )}
                </div>

                {/* Live team registration */}
                {activeTournament.status !== 'completed' && (
                  <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-[24px] space-y-4 shadow-xl">
                    <span className="block text-[10px] font-mono font-bold text-[#00D4FF] uppercase tracking-[0.2em]">Tournament Registration</span>
                    
                    <form onSubmit={handleRegisterTeamSubmit} className="space-y-3">
                      <div className="space-y-1.5">
                        <select
                          value={selectedRegisterTeamId}
                          onChange={(e) => setSelectedRegisterTeamId(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-white/10 bg-black/40 rounded-xl text-xs font-mono outline-none focus:border-[#00D4FF] transition-colors text-white"
                        >
                          <option value="">-- Select Roster to Register --</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                          <option value="custom">-- Register as Solo / Temporary Squad --</option>
                        </select>
                      </div>

                      {selectedRegisterTeamId === 'custom' && (
                        <input
                          type="text"
                          required
                          value={customRegisterTeamName}
                          onChange={(e) => setCustomRegisterTeamName(e.target.value)}
                          placeholder="Enter Squad Name"
                          className="w-full px-4 py-3 border border-white/10 bg-black/40 rounded-xl text-xs font-mono outline-none focus:border-[#00D4FF] transition-colors text-white"
                        />
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {showRegSuccess && (
                          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Registered!</span>
                        )}
                        <button type="submit" className="w-full bg-[#00D4FF] text-black font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-white shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all">
                          Confirm Registration
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

                  {/* Right columns: Rules, Bracket, and Podiums */}
                  <div className="lg:col-span-2 space-y-10">
                
                {/* Completed Podium Results */}
                {activeTournament.status === 'completed' && activeTournament.results && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-600" /> Grand Finals Podium results
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Gold */}
                      <div className="p-4 border border-yellow-200 bg-yellow-50/50 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-2xl mb-1">🥇</span>
                        <span className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">1st Place Champion</span>
                        <h5 className="font-bold text-xs text-white mt-1">{activeTournament.results.firstPlaceTeamName}</h5>
                        <p className="text-[11px] text-yellow-700 font-bold mt-1">{activeTournament.results.firstPlacePrize}</p>
                        
                        {activeTournament.results.firstPlacePlayerName && (
                          <div className="mt-3 pt-2 border-t border-yellow-200 w-full text-[10px] text-gray-400">
                            <strong>MVP:</strong> {activeTournament.results.firstPlacePlayerName}
                          </div>
                        )}
                      </div>

                      {/* Silver */}
                      <div className="p-4 border border-slate-200 bg-slate-50/40 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-2xl mb-1">🥈</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">2nd Place Runner Up</span>
                        <h5 className="font-bold text-xs text-white mt-1">{activeTournament.results.secondPlaceTeamName}</h5>
                        <p className="text-[11px] text-slate-700 font-bold mt-1">{activeTournament.results.secondPlacePrize}</p>
                      </div>

                      {/* Bronze */}
                      <div className="p-4 border border-amber-200 bg-amber-50/30 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-2xl mb-1">🥉</span>
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">3rd Place Podium</span>
                        <h5 className="font-bold text-xs text-white mt-1">{activeTournament.results.thirdPlaceTeamName}</h5>
                        <p className="text-[11px] text-amber-700 font-bold mt-1">{activeTournament.results.thirdPlacePrize}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tournament Bracket */}
                <div>
                  <h4 className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wider mb-2.5">Live Tournament Bracket</h4>
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <VisualBracket tournamentId={activeTournament.id} isAdmin={isAdmin} />
                  </div>
                </div>

                {/* AI Match Predictions */}
                <div>
                  <h4 className="text-[11px] font-bold text-[#7B61FF] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#7B61FF]" /> AI Oracle Predictions
                  </h4>
                  <div className="bg-gradient-to-r from-[#121B2A] to-[#0A0A0A] border border-[#7B61FF]/30 p-5 rounded-2xl shadow-[0_0_20px_rgba(123,97,255,0.15)]">
                    <p className="text-xs text-gray-300 font-mono mb-4 leading-relaxed">
                      Our AI model has analyzed past performance, roster composition, and current meta to predict the grand final outcome.
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-display font-bold uppercase text-white">Team 1</div>
                      <div className="text-[10px] font-mono text-[#00D4FF] font-black tracking-widest">68% Win Probability</div>
                      <div className="font-display font-bold uppercase text-white">Team 5</div>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#00D4FF] w-[68%]"></div>
                      <div className="h-full bg-[#FF4444] w-[32%]"></div>
                    </div>
                    <div className="mt-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">
                      AI Confidence: High • Key Factor: Map Pool Advantage
                    </div>
                  </div>
                </div>

                {/* Tournament Rules */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Tournament Rules & Guidelines</h4>
                  <ul className="space-y-2 text-xs text-gray-300 bg-transparent/5 p-4 rounded-2xl border border-white/10">
                    {activeTournament.rules && activeTournament.rules.length > 0 ? (
                      activeTournament.rules.map((rule, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <CircleDot className="w-3.5 h-3.5 text-[#1A73E8] shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))
                    ) : (
                      <li>No custom rules logged. Standard fair play applies.</li>
                    )}
                  </ul>
                </div>

                {/* High Fidelity Bracket Mockup */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Tournament Elimination Bracket</h4>
                  
                  <div className="border border-white/10 rounded-2xl p-4 bg-gray-950 text-white font-sans overflow-x-auto shadow-inner">
                    <div className="flex gap-6 min-w-[500px]">
                      
                      {/* Round 1 Semis */}
                      <div className="flex-1 space-y-6 flex flex-col justify-around">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-1">Semifinals</div>
                        
                        <div className="space-y-2 border border-gray-800 bg-gray-900/50 p-2.5 rounded-lg">
                          <div className="flex justify-between items-center text-xs">
                            <span className="truncate font-medium text-gray-300">Team Thunder</span>
                            <span className="font-bold text-green-500">3</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-400">Free Agents XI</span>
                            <span className="font-bold text-gray-300">1</span>
                          </div>
                        </div>

                        <div className="space-y-2 border border-gray-800 bg-gray-900/50 p-2.5 rounded-lg">
                          <div className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-400">4Thrives</span>
                            <span className="font-bold text-gray-300">0</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="truncate font-medium text-gray-300">Karachi Kings</span>
                            <span className="font-bold text-green-500">3</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual link */}
                      <div className="w-4 shrink-0 flex flex-col justify-around py-8">
                        <div className="border-t-2 border-b-2 border-r-2 border-gray-800 h-24 w-full rounded-r"></div>
                      </div>

                      {/* Finals */}
                      <div className="flex-1 flex flex-col justify-center space-y-6">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-yellow-500 border-b border-gray-800 pb-1">Grand Finals</div>

                        <div className="space-y-2 border border-yellow-600/30 bg-gray-900 p-3 rounded-lg shadow-lg relative">
                          <div className="absolute -top-2.5 -right-2 bg-yellow-500 text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">Grand Finals</div>
                          
                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="truncate font-bold text-yellow-500">🥇 Team Thunder</span>
                            <span className="font-black text-yellow-500">3</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-1 border-t border-gray-800/50">
                            <span className="truncate font-semibold text-gray-400">🥈 Karachi Kings</span>
                            <span className="font-bold text-gray-400">2</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

            {/* Bottom danger zone */}
            {isAdmin && (
              <div className="px-6 py-4 bg-red-950/10 border-t border-red-500/10 flex justify-between items-center text-xs shrink-0">
                <span className="text-gray-400 font-mono">ID: {activeTournament.id}</span>
                {deletingId === activeTournament.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono font-bold">Permanently delete this tournament?</span>
                    <button
                      onClick={() => handleDeleteTournament(activeTournament.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-mono font-bold uppercase tracking-wider transition-all"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono font-bold uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(activeTournament.id)}
                    className="text-red-400 hover:text-white font-semibold flex items-center gap-1 px-3 py-1.5 hover:bg-red-600/30 border border-red-500/20 hover:border-red-500 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Tournament
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="premium-gaming-card w-full max-w-4xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00D4FF]/10 text-[#1A73E8] rounded-2xl animate-pulse">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {isEditing ? "Modify Tournament Details" : "Construct New Tournament"}
                  </h2>
                  <p className="text-[11px] text-gray-400">Host competitive leagues, specify hardware platforms, and issue grand prizes</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-gray-400 hover:text-gray-300 p-1.5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="overflow-y-auto p-6 space-y-7 flex-1 bg-[#121B2A]">
              
              {/* Core Details */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">1</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Event Specifications</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Tournament Name / Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                          formName.trim().length >= 4 
                            ? 'border-green-500 focus:ring-4 focus:ring-green-100' 
                            : formName.trim().length > 0 
                              ? 'border-amber-400 focus:ring-4 focus:ring-amber-100' 
                              : 'border-white/10 focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8]'
                        }`}
                        placeholder="E.g., Pakistan SF6 Showdown"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {formName.trim().length >= 4 ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : formName.trim().length > 0 ? (
                          <span className="text-[10px] text-amber-500 font-bold">Short</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Provide a grand competitive title for registration rosters.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Event Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      <option value="upcoming">Upcoming (Registration Open)</option>
                      <option value="ongoing">Ongoing (Matches in Progress)</option>
                      <option value="completed">Completed (Aggregated Results)</option>
                    </select>
                    <span className="text-[10px] text-gray-400 block">Controls user entry eligibility and brackets view.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Game Championship</label>
                    <select
                      value={formGameId}
                      onChange={(e) => setFormGameId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      {SUPPORTED_GAMES.map(g => (
                        <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 block">The target game matching rule settings.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Console / Platform</label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 block">Hardware device where players compete.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Prize Pool Description</label>
                    <input
                      type="text"
                      required
                      value={formPrize}
                      onChange={(e) => setFormPrize(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="E.g., Rs. 500,000"
                    />
                    <span className="text-[10px] text-gray-400 block">Describe cash rewards and hardware bonuses.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Entry Fee Requirement</label>
                    <input
                      type="text"
                      required
                      value={formEntryFee}
                      onChange={(e) => setFormEntryFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="E.g., Rs. 1,000 or Free"
                    />
                    <span className="text-[10px] text-gray-400 block">Cost for clubs to secure a roster slot.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Schedule / Timeline Dates</label>
                    <input
                      type="text"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="E.g., Oct 11 - Oct 14, 2026"
                    />
                    <span className="text-[10px] text-gray-400 block">Calendar schedule window for the event.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Maximum Cap Limits (Teams)</label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={128}
                      value={formMaxTeams}
                      onChange={(e) => setFormMaxTeams(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                    />
                    <span className="text-[10px] text-gray-400 block">Roster limit cap for brackets layout (e.g., 16, 32, 64).</span>
                  </div>
                </div>

                {formPrize && (
                  <div className="mt-3 bg-yellow-50/50 border border-yellow-100 p-3 rounded-xl flex items-center gap-2.5">
                    <div className="text-lg">🏆</div>
                    <div>
                      <span className="block text-[10px] font-bold text-yellow-800 uppercase tracking-wider">Cash reward banner preview</span>
                      <p className="text-[11px] font-bold text-white">
                        Winner receives the lion's share of <span className="text-blue-600 font-extrabold">{formPrize}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphic Assets */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">2</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Tournament Banner Assets</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        label="Upload Custom Banner / Graphic"
                        storagePath="tournaments/banners"
                        currentUrl={DEFAULT_TOURNAMENT_BANNERS.includes(formBannerUrl) ? '' : formBannerUrl}
                        onUploadComplete={(url) => { if (url) setFormBannerUrl(url); }}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Or Choose Cover Preset</span>
                    <div className="grid grid-cols-2 gap-3">
                      {DEFAULT_TOURNAMENT_BANNERS.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormBannerUrl(url)}
                          className={`h-16 rounded-xl cursor-pointer border-2 overflow-hidden relative group hover:scale-105 hover:shadow-md transition-all ${
                            formBannerUrl === url ? 'border-[#1A73E8] ring-4 ring-blue-50 shadow-md scale-105' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt="banner" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
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

              {/* Rules List */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">3</span>
                    <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Championship Guidelines & Rules</h3>
                  </div>
                  <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                    {formRulesText.split('\n').filter(Boolean).length} lines entered
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Enter rules with each guideline occupying a separate line:</label>
                  <textarea
                    rows={4}
                    required
                    value={formRulesText}
                    onChange={(e) => setFormRulesText(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none resize-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                    placeholder="E.g. players must be verified Pakistani citizens.&#10;Match starts exactly at 8:00 PM PST.&#10;Hacking, macros, or cheats result in instant lifetime bans."
                  />
                  <span className="text-[10px] text-gray-400 block">Enter at least 2 key fair-play guidelines to ensure high sporting standard.</span>
                </div>
              </div>

              {/* Completed Results Form Podium section (Only if completed) */}
              {formStatus === 'completed' && (
                <div className="border border-yellow-200 p-5 rounded-2xl bg-yellow-50/20 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 pb-2 border-b border-yellow-100">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold">4</span>
                    <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Log Grand Finals Podium Results</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* First Place */}
                    <div className="bg-[#121B2A] border border-yellow-100 p-4 rounded-xl space-y-3 shadow-sm">
                      <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider">🥇 1st Place Champion Team & Prize</label>
                      <select
                        value={resFirstTeam}
                        onChange={(e) => setResFirstTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg text-xs bg-[#121B2A] focus:ring-1 focus:ring-yellow-400 outline-none cursor-pointer"
                      >
                        <option value="none">-- Select Winning Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={resFirstPrize}
                        onChange={(e) => setResFirstPrize(e.target.value)}
                        className="w-full px-3 py-1.5 border border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-yellow-400"
                        placeholder="Prize money share (e.g. Rs. 250,000)"
                      />
                    </div>

                    {/* MVP Player */}
                    <div className="bg-[#121B2A] border border-yellow-100 p-4 rounded-xl space-y-3 shadow-sm">
                      <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider">⭐ Tournament MVP / Top Fragger</label>
                      <select
                        value={resFirstPlayer}
                        onChange={(e) => setResFirstPlayer(e.target.value)}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg text-xs bg-[#121B2A] focus:ring-1 focus:ring-yellow-400 outline-none cursor-pointer"
                      >
                        <option value="none">-- Select MVP Player --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400">Awarded for ultimate playmaking execution in the bracket finals.</p>
                    </div>

                    {/* Second Place */}
                    <div className="bg-[#121B2A] border border-white/10 p-4 rounded-xl space-y-3 shadow-sm">
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">🥈 2nd Place Team & Prize</label>
                      <select
                        value={resSecondTeam}
                        onChange={(e) => setResSecondTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg text-xs bg-[#121B2A] focus:ring-1 focus:ring-gray-300 outline-none cursor-pointer"
                      >
                        <option value="none">-- Select 2nd Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={resSecondPrize}
                        onChange={(e) => setResSecondPrize(e.target.value)}
                        className="w-full px-3 py-1.5 border border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gray-300"
                        placeholder="Prize share (e.g. Rs. 150,000)"
                      />
                    </div>

                    {/* Third Place */}
                    <div className="bg-[#121B2A] border border-white/10 p-4 rounded-xl space-y-3 shadow-sm">
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">🥉 3rd Place Team & Prize</label>
                      <select
                        value={resThirdTeam}
                        onChange={(e) => setResThirdTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg text-xs bg-[#121B2A] focus:ring-1 focus:ring-amber-300 outline-none cursor-pointer"
                      >
                        <option value="none">-- Select 3rd Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={resThirdPrize}
                        onChange={(e) => setResThirdPrize(e.target.value)}
                        className="w-full px-3 py-1.5 border border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-300"
                        placeholder="Prize share (e.g. Rs. 100,000)"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* Form Actions */}
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
                  <Check className="w-4 h-4" /> Save Tournament Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
