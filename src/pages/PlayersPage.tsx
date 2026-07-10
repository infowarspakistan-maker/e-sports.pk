import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Award, Shield, User, MapPin, Film, Link as LinkIcon, Edit2, Play, Trophy, Check, Trash2, Tag, Percent, Calendar } from 'lucide-react';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SUPPORTED_GAMES, PLATFORMS } from '../lib/constants';
import { useAuthContext } from '../components/global/AuthProvider';
import { ImageUpload } from '../components/shared/ImageUpload';
import { EsportsPlayerCard } from '../components/features/EsportsPlayerCard';

// Clean default presets for high fidelity graphics
const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
];

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
];

interface PlayerStats {
  gameId: string;
  gameName: string;
  rank: string;
  matchesPlayed: number;
  winRate: number;
  prizeWon: number;
}

interface Player {
  id: string;
  userId?: string;
  isApproved?: boolean;
  name: string;
  game: string; // Primary game name
  gameId: string; // Primary game ID
  platform: string;
  city: string;
  countryCode?: string;
  bio: string;
  availability: 'Lft' | 'Signed' | 'Open';
  avatarUrl: string;
  bannerUrl: string;
  youtubeUrl: string;
  color: string;
  teamId: string;
  teamName: string;
  sponsors: string[];
  achievements: string[];
  gamesList: PlayerStats[];
  rating?: number;
  skillStats?: {
    str: number;
    spd: number;
    pmk: number;
    phy: number;
    def: number;
    clu: number;
  };
}

export const PlayersPage = () => {
  const { user, claims } = useAuthContext();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Detail Modal
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeGameTab, setActiveGameTab] = useState<string>('');

  // Form Modal (Create or Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState('');

  // Player Form States
  const [formName, setFormName] = useState('');
  const [formPrimaryGame, setFormPrimaryGame] = useState(SUPPORTED_GAMES[0].id);
  const [formPlatform, setFormPlatform] = useState(PLATFORMS[0].id);
  const [formCity, setFormCity] = useState('Lahore');
  const [formBio, setFormBio] = useState('');
  const [formAvailability, setFormAvailability] = useState<'Lft' | 'Signed' | 'Open'>('Lft');
  const [formAvatarUrl, setFormAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [formBannerUrl, setFormBannerUrl] = useState(DEFAULT_BANNERS[0]);
  const [avatarUrlMode, setAvatarUrlMode] = useState(false);
  const [bannerUrlMode, setBannerUrlMode] = useState(false);
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formTeamId, setFormTeamId] = useState('none');
  const [formSponsorsText, setFormSponsorsText] = useState('');
  const [formAchievementsText, setFormAchievementsText] = useState('');
  const [formRating, setFormRating] = useState(85);
  const [formCountryCode, setFormCountryCode] = useState('pk');
  const [formSkillStats, setFormSkillStats] = useState({
    str: 80,
    spd: 80,
    pmk: 80,
    phy: 80,
    def: 80,
    clu: 80
  });

  // Player Comparison State
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleToggleCompare = (playerId: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 2) {
        return [prev[1], playerId];
      }
      return [...prev, playerId];
    });
  };

  const comparePlayersList = players.filter(p => selectedCompareIds.includes(p.id));

  // Extra multi-game stats state inside the form
  const [formGamesList, setFormGamesList] = useState<PlayerStats[]>([]);
  const [newStatGameId, setNewStatGameId] = useState(SUPPORTED_GAMES[0].id);
  const [newStatRank, setNewStatRank] = useState('');
  const [newStatMatches, setNewStatMatches] = useState(0);
  const [newStatWinRate, setNewStatWinRate] = useState(50);
  const [newStatPrize, setNewStatPrize] = useState(0);

  // Fetch all players, teams, tournaments to construct relationships
  const fetchData = async () => {
    try {
      // Fetch Teams
      const teamsSnap = await getDocs(collection(db, 'teams'));
      const teamsList: any[] = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);

      // Fetch Tournaments for automatic results affiliation
      const toursSnap = await getDocs(collection(db, 'tournaments'));
      const toursList = toursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(toursList);

      // Fetch Players
      const playersSnap = await getDocs(collection(db, 'players'));
      let playersList = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));

      if (playersList.length === 0) {
        // Seed default players if Firestore is empty
        const seeded = [
          {
            id: 'p_1',
            userId: 'system_seed',
            isApproved: true,
            name: 'Ahmad Khan',
            game: 'Tekken 8',
            gameId: 'tekken-8',
            platform: 'PlayStation 5',
            city: 'Lahore',
            bio: 'Elite Tekken 8 champion from Lahore. Known for supreme spacing and defensive control. Placed top 3 in multiple qualifiers.',
            availability: 'Lft' as const,
            avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            youtubeUrl: 'https://www.youtube.com/watch?v=kYor-e7Eezg',
            color: '#FF4444',
            teamId: 'none',
            teamName: 'None / Free Agent',
            sponsors: ['Asus ROG Pakistan', 'Logitech G'],
            achievements: ['1st Place National Tekken 8 Cup 2025', '2nd Place Lahore Esports Open'],
            rating: 94,
            countryCode: 'pk',
            skillStats: {
              str: 92,
              spd: 88,
              pmk: 75,
              phy: 85,
              def: 96,
              clu: 90
            },
            gamesList: [
              { gameId: 'tekken-8', gameName: 'Tekken 8', rank: 'God of Destruction', matchesPlayed: 342, winRate: 78, prizeWon: 12500 },
              { gameId: 'street-fighter-6', gameName: 'Street Fighter 6', rank: 'Grandmaster', matchesPlayed: 120, winRate: 65, prizeWon: 2000 }
            ]
          },
          {
            id: 'p_2',
            userId: 'system_seed',
            isApproved: true,
            name: 'Sara Malik',
            game: 'PUBG Mobile',
            gameId: 'pubg-mobile',
            platform: 'Mobile',
            city: 'Karachi',
            bio: 'Professional PUBG Mobile IGL. Highly strategic planner with 4+ years of competitive experience leading tier-1 team lobbies.',
            availability: 'Signed' as const,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
            youtubeUrl: 'https://www.youtube.com/watch?v=mD0E6a2y8Wc',
            color: '#FF9900',
            teamId: 't1', // Seed with standard Thunder association
            teamName: 'Team Thunder',
            sponsors: ['Red Bull Pakistan'],
            achievements: ['MVP PUBG Mobile Pakistan League', 'Top 8 PMGO Main Stage'],
            rating: 91,
            countryCode: 'pk',
            skillStats: {
              str: 82,
              spd: 95,
              pmk: 90,
              phy: 78,
              def: 85,
              clu: 94
            },
            gamesList: [
              { gameId: 'pubg-mobile', gameName: 'PUBG Mobile', rank: 'Conqueror (Top 100)', matchesPlayed: 1420, winRate: 81, prizeWon: 22000 }
            ]
          }
        ];
        
        // Write defaults to Firestore so they are live
        for (const player of seeded) {
          try {
            await setDoc(doc(db, 'players', player.id), player);
          } catch (writeErr) {
            console.warn("Players auto-seeding skipped due to restricted permissions (expected for non-admins):", writeErr);
          }
        }
        playersList = seeded as Player[];
      }

      // Populate actual team names in real-time
      const processedPlayers = playersList.map(player => {
        const matchingTeam = teamsList.find(t => t.id === player.teamId);
        return {
          ...player,
          teamName: matchingTeam ? matchingTeam.name : 'None / Free Agent'
        };
      });

      setPlayers(processedPlayers);
    } catch (err) {
      console.error("Failed to load players and directory details:", err);
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
    setFormPlatform(PLATFORMS[0].name);
    setFormCity('Lahore');
    setFormBio('');
    setFormAvailability('Lft');
    setFormAvatarUrl(DEFAULT_AVATARS[0]);
    setFormBannerUrl(DEFAULT_BANNERS[0]);
    setFormYoutubeUrl('');
    setFormTeamId('none');
    setFormSponsorsText('');
    setFormAchievementsText('');
    setFormGamesList([]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (player: Player) => {
    setIsEditing(true);
    setFormId(player.id);
    setFormName(player.name);
    setFormPrimaryGame(player.gameId || SUPPORTED_GAMES[0].id);
    setFormPlatform(player.platform || PLATFORMS[0].name);
    setFormCity(player.city || 'Lahore');
    setFormBio(player.bio || '');
    setFormAvailability(player.availability || 'Lft');
    setFormAvatarUrl(player.avatarUrl || DEFAULT_AVATARS[0]);
    setFormBannerUrl(player.bannerUrl || DEFAULT_BANNERS[0]);
    setFormYoutubeUrl(player.youtubeUrl || '');
    setFormTeamId(player.teamId || 'none');
    setFormSponsorsText(player.sponsors ? player.sponsors.join(', ') : '');
    setFormAchievementsText(player.achievements ? player.achievements.join(', ') : '');
    setFormRating(player.rating || 85);
    setFormCountryCode(player.countryCode || 'pk');
    setFormSkillStats(player.skillStats || {
      str: 80, spd: 80, pmk: 80, phy: 80, def: 80, clu: 80
    });
    setFormGamesList(player.gamesList || []);
    setShowFormModal(true);
  };

  const handleAddGameStat = () => {
    if (!newStatRank.trim()) return;
    const selectedGameObj = SUPPORTED_GAMES.find(g => g.id === newStatGameId);
    if (!selectedGameObj) return;

    // Check if game already has stats, if so replace or alert
    if (formGamesList.some(g => g.gameId === newStatGameId)) {
      alert("Game stats already added. Remove existing one first to replace.");
      return;
    }

    const newStat: PlayerStats = {
      gameId: newStatGameId,
      gameName: selectedGameObj.name,
      rank: newStatRank.trim(),
      matchesPlayed: Number(newStatMatches),
      winRate: Number(newStatWinRate),
      prizeWon: Number(newStatPrize)
    };

    setFormGamesList([...formGamesList, newStat]);
    setNewStatRank('');
    setNewStatMatches(0);
    setNewStatWinRate(50);
    setNewStatPrize(0);
  };

  const handleRemoveGameStat = (gameId: string) => {
    setFormGamesList(formGamesList.filter(g => g.gameId !== gameId));
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setLoading(true);
    const selectedPrimaryGame = SUPPORTED_GAMES.find(g => g.id === formPrimaryGame);
    const primaryGameName = selectedPrimaryGame ? selectedPrimaryGame.name : 'Unknown Game';
    const primaryGameColor = selectedPrimaryGame ? selectedPrimaryGame.color : '#1A73E8';

    const playerPayload = {
      name: formName.trim(),
      game: primaryGameName,
      gameId: formPrimaryGame,
      platform: formPlatform,
      city: formCity,
      bio: formBio.trim(),
      availability: formAvailability,
      avatarUrl: formAvatarUrl,
      bannerUrl: formBannerUrl,
      youtubeUrl: formYoutubeUrl.trim(),
      color: primaryGameColor,
      teamId: formTeamId,
      sponsors: formSponsorsText.split(',').map(s => s.trim()).filter(Boolean),
      achievements: formAchievementsText.split(',').map(a => a.trim()).filter(Boolean),
      rating: formRating,
      countryCode: formCountryCode,
      skillStats: formSkillStats,
      gamesList: formGamesList,
      updatedAt: new Date()
    };

    try {
      if (isEditing && formId) {
        await updateDoc(doc(db, 'players', formId), playerPayload);
      } else {
        const uniqueId = `p_${Date.now()}`;
        await setDoc(doc(db, 'players', uniqueId), {
          ...playerPayload,
          id: uniqueId,
          userId: user ? user.uid : 'anonymous',
          isApproved: claims?.role === 'admin' ? true : false,
          createdAt: new Date()
        });
      }
      setShowFormModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to save player details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'players', playerId));
      setShowDetailModal(false);
      setActivePlayer(null);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete player profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract clean Youtube Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleCardClick = (player: Player) => {
    setActivePlayer(player);
    if (player.gamesList && player.gamesList.length > 0) {
      setActiveGameTab(player.gamesList[0].gameId);
    } else {
      setActiveGameTab(player.gameId);
    }
    setShowDetailModal(true);
  };

  // Automatic results affiliation check: Find all podium finishes
  const getPlayerAchievementsAndWins = (player: Player) => {
    const finishes: Array<{ tournamentName: string; position: 1 | 2 | 3; prize: string; date: string }> = [];
    
    tournaments.forEach(tour => {
      if (tour.status === 'completed' && tour.results) {
        // Check 1st Place
        if (tour.results.firstPlacePlayerId === player.id || (tour.results.firstPlaceTeamId === player.teamId && player.teamId !== 'none')) {
          finishes.push({
            tournamentName: tour.name,
            position: 1,
            prize: tour.results.firstPlacePrize || tour.prize || 'Rs. 250,000',
            date: tour.date || 'Completed'
          });
        }
        // Check 2nd Place
        if (tour.results.secondPlacePlayerId === player.id || (tour.results.secondPlaceTeamId === player.teamId && player.teamId !== 'none')) {
          finishes.push({
            tournamentName: tour.name,
            position: 2,
            prize: tour.results.secondPlacePrize || 'Rs. 100,000',
            date: tour.date || 'Completed'
          });
        }
        // Check 3rd Place
        if (tour.results.thirdPlacePlayerId === player.id || (tour.results.thirdPlaceTeamId === player.teamId && player.teamId !== 'none')) {
          finishes.push({
            tournamentName: tour.name,
            position: 3,
            prize: tour.results.thirdPlacePrize || 'Rs. 50,000',
            date: tour.date || 'Completed'
          });
        }
      }
    });

    return finishes;
  };

  // Filters logic
  const filteredPlayers = players.filter(p => {
    const isApproved = p.isApproved === true;
    const isOwner = user && p.userId === user.uid;
    const isAdmin = claims?.role === 'admin';
    
    // Unapproved profiles are only visible to the owner or admins
    if (!isApproved && !isOwner && !isAdmin) {
      return false;
    }

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Check primary game or any listed game
    const matchesGame = selectedGame === 'all' || 
      p.gameId === selectedGame ||
      (p.gamesList && p.gamesList.some(g => g.gameId === selectedGame));

    const matchesPlatform = selectedPlatform === 'all' || 
      p.platform.toLowerCase().includes(selectedPlatform.toLowerCase()) ||
      (p.gamesList && p.gamesList.some(g => g.gameId.includes(selectedPlatform)));

    const matchesRegion = selectedRegion === 'all' || 
      (p.city && p.city.toLowerCase() === selectedRegion.toLowerCase());

    return matchesSearch && matchesGame && matchesPlatform && matchesRegion;
  });

  return (
    <div className="w-full bg-transparent min-h-screen pt-12 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
      
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">Talent Registry</span>
            <span className="text-[#A0A0AB] text-xs">///</span>
            <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">Pakistan's Esports Pathway</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tighter uppercase mb-2">Players & Pro Directory</h1>
          <p className="text-[#A0A0AB] font-body text-sm max-w-[600px]">
            Explore verified player ranks, review multiple game stats, and watch showcase highlights. Click any player profile card to access complete credentials.
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
              placeholder="Search talent..."
            />
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#121B2A] hover:bg-[#00D4FF] text-white hover:text-black border-none text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] cyber-button"
          >
            <Plus className="w-4 h-4" /> Create Profile
          </button>
        </div>
      </div>

      {/* Grid Filters */}
      <div className="flex flex-wrap gap-4 mb-10 bg-[#121B2A]/70 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)] p-4 rounded items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Filter Directory</span>
        </div>
        
        {/* Game filter */}
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

        {/* Platform filter */}
        <select 
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">🖥️ All Platforms</option>
          {PLATFORMS.map(platform => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>

        {/* Region filter */}
        <select 
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
        >
          <option value="all">📍 Any Region</option>
          <option value="lahore">Lahore</option>
          <option value="karachi">Karachi</option>
          <option value="islamabad">Islamabad</option>
          <option value="peshawar">Peshawar</option>
          <option value="quetta">Quetta</option>
        </select>

        {filteredPlayers.length > 0 && (
          <span className="text-xs text-gray-400 ml-auto font-medium">
            Showing {filteredPlayers.length} matches
          </span>
        )}
      </div>

      {/* Players Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-[#121B2A]/70 backdrop-blur-md h-72 rounded border border-white/5 shadow-lg"></div>
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-20 premium-gaming-card shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-[600px] mx-auto">
          <User className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
          <p className="font-display font-bold text-xl text-white">No Talent Found</p>
          <p className="text-sm text-[#A0A0AB] mt-2 max-w-sm mx-auto font-body">
            Try adjusting your search parameters or construct a customized profile card.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#121B2A]/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] text-xs font-mono font-bold uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
          >
            Create Profile Card &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredPlayers.map((player) => (
            <EsportsPlayerCard 
              key={player.id} 
              player={player} 
              onViewProfile={() => handleCardClick(player)}
              onCompareToggle={() => handleToggleCompare(player.id)}
              isCompareSelected={selectedCompareIds.includes(player.id)}
            />
          ))}
        </div>
      )}

      {/* DETAIL MODAL PANEL */}
      {showDetailModal && activePlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
          <div className="premium-gaming-card w-full max-w-6xl h-auto max-h-[95vh] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300 flex flex-col">
            
            {/* Header banner */}
            <div className="h-44 relative bg-white/10">
              <img
                src={activePlayer.bannerUrl || DEFAULT_BANNERS[0]}
                alt={activePlayer.name}
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
                <div className="w-24 h-24 rounded-2xl bg-[#121B2A] p-1 overflow-hidden shadow-md">
                  <img
                    src={activePlayer.avatarUrl || DEFAULT_AVATARS[0]}
                    alt={activePlayer.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activePlayer.name}</h2>
                  <p className="text-white/80 text-xs font-semibold flex items-center gap-1 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    Roster Affiliation: {activePlayer.teamName || 'None / Free Agent'}
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenEditModal(activePlayer);
                }}
                className="absolute bottom-4 right-6 bg-[#1A73E8] hover:bg-[#1967D2] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            {/* Content Tabs area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                
                {/* Left Column: Card & Quick Stats */}
                <div className="lg:col-span-1 space-y-8 flex flex-col items-center lg:items-start lg:border-r lg:border-white/10 lg:pr-12">
                  <div className="w-full max-w-[300px] transform hover:scale-105 transition-transform duration-500">
                    <EsportsPlayerCard player={activePlayer} />
                  </div>
                  
                  <div className="w-full">
                    <h4 className="text-[11px] font-bold text-[#FF00FF] uppercase tracking-[0.2em] mb-4 font-mono">Ecosystem Credentials</h4>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Availability</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activePlayer.availability === 'Lft' ? 'bg-red-100 text-red-700' :
                        activePlayer.availability === 'Open' ? 'bg-[#FEF7E0] text-[#B06000]' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activePlayer.availability === 'Lft' ? 'Free Agent' :
                         activePlayer.availability === 'Open' ? 'Open Offer' : 'Contracted'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Region</span>
                      <span className="font-semibold text-white flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {activePlayer.city}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Primary Console</span>
                      <span className="font-semibold text-white">{activePlayer.platform}</span>
                    </div>
                  </div>
                </div>

                {/* Sponsors section */}
                {activePlayer.sponsors && activePlayer.sponsors.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Sponsors & Partners</h4>
                    <div className="flex flex-wrap gap-2">
                      {activePlayer.sponsors.map((sponsor, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#E8F0FE] text-[#1A73E8] text-xs font-semibold rounded-lg border border-blue-50 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#1A73E8]" />
                          {sponsor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements text list */}
                {activePlayer.achievements && activePlayer.achievements.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Career Milestones</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {activePlayer.achievements.map((ach, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-transparent/5 p-2.5 rounded-lg border border-white/10">
                          <span className="text-xs">🏆</span>
                          <span className="font-medium">{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

                {/* Right Columns: Multi-Game Stats and Videos */}
                <div className="lg:col-span-2 space-y-10">
                
                {/* About Bio */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Player Biography</h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-transparent p-4 rounded-2xl border border-white/10">
                    {activePlayer.bio || 'No custom player bio provided.'}
                  </p>
                </div>

                {/* Dynamic podium finishes derived from live Tournaments */}
                {getPlayerAchievementsAndWins(activePlayer).length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Ecosystem Podium Finishes</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getPlayerAchievementsAndWins(activePlayer).map((finish, idx) => (
                        <div key={idx} className="p-3 border border-yellow-200 bg-yellow-50/50 rounded-2xl flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                            finish.position === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                            finish.position === 2 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                            'bg-amber-100 text-amber-700 border border-amber-300'
                          }`}>
                            {finish.position}
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-white line-clamp-1">{finish.tournamentName}</h5>
                            <p className="text-[10px] text-gray-400">{finish.date}</p>
                            <p className="text-[11px] font-bold text-yellow-700 mt-0.5">{finish.prize}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-Game Stats Tabs */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Supported Games & Ranks</h4>
                  
                  {activePlayer.gamesList && activePlayer.gamesList.length > 0 ? (
                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#121B2A] shadow-sm">
                      <div className="flex bg-transparent border-b border-white/10">
                        {activePlayer.gamesList.map((g) => (
                          <button
                            key={g.gameId}
                            onClick={() => setActiveGameTab(g.gameId)}
                            className={`px-4 py-2.5 text-xs font-semibold transition-all border-r border-white/10 ${
                              activeGameTab === g.gameId ? 'bg-[#121B2A] text-[#1A73E8]' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {g.gameName}
                          </button>
                        ))}
                      </div>

                      {/* Active Game Stat Info */}
                      {activePlayer.gamesList.map((g) => {
                        if (g.gameId !== activeGameTab) return null;
                        return (
                          <div key={g.gameId} className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-200">
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Competitive Rank</span>
                              <p className="text-sm font-bold text-white flex items-center gap-1">
                                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                                {g.rank}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Matches</span>
                              <p className="text-sm font-bold text-white">{g.matchesPlayed} games</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Win Rate</span>
                              <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                                <Percent className="w-3.5 h-3.5 text-green-600" />
                                {g.winRate}%
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Earnings</span>
                              <p className="text-sm font-bold text-blue-600">Rs. {g.prizeWon.toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-transparent/5 border border-white/10 p-4 rounded-xl text-center text-xs text-gray-400">
                      Primary Game: <strong>{activePlayer.game}</strong> • Platform: <strong>{activePlayer.platform}</strong>
                    </div>
                  )}
                </div>

                {/* Youtube Showcase Highlight Video */}
                {activePlayer.youtubeUrl && (
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <Film className="w-4 h-4 text-red-500" /> Youtube Showcase Clip
                    </h4>
                    
                    {getEmbedUrl(activePlayer.youtubeUrl) ? (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-black">
                        <iframe
                          src={getEmbedUrl(activePlayer.youtubeUrl) || ''}
                          title={`${activePlayer.name} video showcase`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <a
                        href={activePlayer.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-2xl flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Play className="w-8 h-8 text-red-600 fill-current shrink-0" />
                          <div>
                            <span className="font-semibold text-xs text-white">Watch Highlight Video Clip</span>
                            <p className="text-[10px] text-gray-400 truncate max-w-sm">{activePlayer.youtubeUrl}</p>
                          </div>
                        </div>
                        <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Delete Profile panel at very bottom (Danger Zone) */}
            <div className="px-6 py-4 bg-transparent/5 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-gray-400">ID: {activePlayer.id}</span>
              <button
                onClick={() => handleDeletePlayer(activePlayer.id)}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Profile
              </button>
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
                You must be signed in to E-Sports Pakistan to register or modify a professional player profile.
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
            
            {/* Modal Title */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00D4FF]/10 text-[#1A73E8] rounded-2xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {isEditing ? "Modify Professional Player Profile" : "Register Professional Player Profile"}
                  </h2>
                  <p className="text-[11px] text-gray-400">Form your identity, games, and metrics to catch sponsor focus</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-gray-400 hover:text-gray-300 p-1.5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="overflow-y-auto p-6 space-y-7 flex-1 bg-[#121B2A]">
              
              {/* Basic Details Section */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">1</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Display Name / Handle</label>
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
                        placeholder="E.g., Ahmad K."
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {formName.trim().length >= 3 ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : formName.trim().length > 0 ? (
                          <span className="text-[10px] text-amber-500 font-bold">Short</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Min 3 characters. This is your public esports alias.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Region / City</label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all cursor-pointer"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                    <span className="text-[10px] text-gray-400 block">Where you are located in Pakistan.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Availability Status</label>
                    <select
                      value={formAvailability}
                      onChange={(e: any) => setFormAvailability(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all cursor-pointer"
                    >
                      <option value="Lft">Looking for Team (LFT)</option>
                      <option value="Open">Open to Offers</option>
                      <option value="Signed">Signed with Team</option>
                    </select>
                    <span className="text-[10px] text-gray-400 block">Informs teams if you are recruit-ready.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Team Affiliation</label>
                    <select
                      value={formTeamId}
                      onChange={(e) => setFormTeamId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all cursor-pointer"
                    >
                      <option value="none">None / Free Agent</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 block">Connects your stats and results with a club.</span>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Profile Bio / Description</label>
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
                      placeholder="Tell sponsors or teams about yourself, achievements, training routine, and esports goals..."
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Provide deep details of your gaming career.</span>
                      {formBio.length < 40 && formBio.length > 0 ? (
                        <span className="text-amber-500 font-medium">Bio is short (aim for at least 40 chars)</span>
                      ) : formBio.length >= 40 ? (
                        <span className="text-green-600 font-medium flex items-center gap-0.5"><Check className="w-3 h-3" /> Excellent bio size</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Skill Stats Section */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-[#FF00FF]/20 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF00FF]/10 text-[#FF00FF] text-[10px] font-bold border border-[#FF00FF]/30">3</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Pro Collective Card Stats</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#A0A0AB] uppercase tracking-wider mb-2">Overall Performance Rating (0-99)</label>
                      <input 
                        type="number" 
                        min="0" max="99" 
                        value={formRating} 
                        onChange={(e) => setFormRating(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-[#00D4FF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#A0A0AB] uppercase tracking-wider mb-2">Country Code (e.g. pk, us, gb)</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        value={formCountryCode} 
                        onChange={(e) => setFormCountryCode(e.target.value.toLowerCase())}
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-[#00D4FF] focus:outline-none"
                        placeholder="pk"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#A0A0AB] uppercase tracking-wider mb-3">Individual Skill Breakdown</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(formSkillStats).map((stat) => (
                        <div key={stat} className="flex items-center gap-2">
                          <label className="w-10 text-[10px] font-mono font-bold text-gray-400 uppercase">{stat}</label>
                          <input 
                            type="number" 
                            min="0" max="99" 
                            value={formSkillStats[stat as keyof typeof formSkillStats]} 
                            onChange={(e) => setFormSkillStats({...formSkillStats, [stat]: Number(e.target.value)})}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-white focus:border-[#FF00FF] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphic Asset Section */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">2</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Graphic Assets & Media Showcase</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Avatar Graphic</span>
                        <button
                          type="button"
                          onClick={() => setAvatarUrlMode(!avatarUrlMode)}
                          className="text-xs text-[#1A73E8] hover:underline"
                        >
                          {avatarUrlMode ? "Upload Image instead" : "Paste Image URL instead"}
                        </button>
                      </div>
                      {avatarUrlMode ? (
                        <input
                          type="text"
                          value={formAvatarUrl}
                          onChange={(e) => setFormAvatarUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-[#121B2A] text-white"
                          placeholder="https://images.unsplash.com/... or paste image URL"
                        />
                      ) : (
                        <ImageUpload
                          label="Upload Custom Avatar"
                          storagePath="players/avatars"
                          currentUrl={DEFAULT_AVATARS.includes(formAvatarUrl) ? '' : formAvatarUrl}
                          onUploadComplete={(url) => { if (url) setFormAvatarUrl(url); }}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Or Choose Avatar Preset</span>
                      <div className="flex flex-wrap gap-3">
                        {DEFAULT_AVATARS.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFormAvatarUrl(url)}
                            className={`w-14 h-14 rounded-2xl cursor-pointer border-2 overflow-hidden transition-all relative group hover:scale-105 hover:shadow-md ${
                              formAvatarUrl === url ? 'border-[#1A73E8] ring-4 ring-blue-50 shadow-md scale-105' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt="preset avatar" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                            {formAvatarUrl === url && (
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
                          label="Upload Custom Banner"
                          storagePath="players/banners"
                          currentUrl={DEFAULT_BANNERS.includes(formBannerUrl) ? '' : formBannerUrl}
                          onUploadComplete={(url) => { if (url) setFormBannerUrl(url); }}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Or Choose Banner Preset</span>
                      <div className="grid grid-cols-3 gap-3">
                        {DEFAULT_BANNERS.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFormBannerUrl(url)}
                            className={`h-16 rounded-xl cursor-pointer border-2 overflow-hidden relative group hover:scale-105 hover:shadow-md transition-all ${
                              formBannerUrl === url ? 'border-[#1A73E8] ring-4 ring-blue-50 shadow-md scale-105' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt="preset banner" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
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

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">YouTube Showcase Clip URL (Optional)</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formYoutubeUrl}
                        onChange={(e) => setFormYoutubeUrl(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                          formYoutubeUrl 
                            ? (getEmbedUrl(formYoutubeUrl) ? 'border-green-500 focus:ring-green-100 focus:ring-4' : 'border-amber-400 focus:ring-amber-100 focus:ring-4') 
                            : 'border-white/10 focus:ring-blue-100 focus:ring-4 focus:border-[#1A73E8]'
                        }`}
                        placeholder="E.g., https://www.youtube.com/watch?v=..."
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {formYoutubeUrl ? (
                          getEmbedUrl(formYoutubeUrl) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-[10px] text-amber-500 font-bold">Watch Link Only</span>
                          )
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Provide a full watch link. Valid YouTube links display an interactive player on your public card.</span>
                    {formYoutubeUrl && getEmbedUrl(formYoutubeUrl) && (
                      <div className="mt-3.5 p-4 bg-transparent/5 border border-white/10 rounded-2xl max-w-md">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Film className="w-3.5 h-3.5 text-blue-500" /> Live Highlight clip Embed Preview
                        </span>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner">
                          <iframe
                            src={getEmbedUrl(formYoutubeUrl) || ''}
                            title="YouTube Preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Association Details & Multiple Stats */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">3</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Game Associations & Multi-Game Stats</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Primary Game Championship</label>
                      <select
                        value={formPrimaryGame}
                        onChange={(e) => setFormPrimaryGame(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                      >
                        {SUPPORTED_GAMES.map(game => (
                          <option key={game.id} value={game.id}>{game.icon} {game.name}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-gray-400 block">Your primary featured game on the platform.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Primary Console / Platform</label>
                      <select
                        value={formPlatform}
                        onChange={(e) => setFormPlatform(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none bg-[#121B2A] focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] cursor-pointer transition-all"
                      >
                        {PLATFORMS.map(platform => (
                          <option key={platform.id} value={platform.name}>{platform.name}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-gray-400 block">The hardware you play this game on.</span>
                    </div>
                  </div>

                  {/* Multigame stats section */}
                  <div className="border border-white/10 p-5 rounded-2xl bg-[#121B2A] shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Multi-Game Statistics Engine</span>
                      </div>
                      <span className="text-[10px] bg-[#00D4FF]/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">Agnostic Support</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Select Game</label>
                        <select
                          value={newStatGameId}
                          onChange={(e) => setNewStatGameId(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 bg-transparent/5 rounded-lg text-xs outline-none cursor-pointer"
                        >
                          {SUPPORTED_GAMES.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Rank / Tier</label>
                        <input
                          type="text"
                          value={newStatRank}
                          onChange={(e) => setNewStatRank(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-transparent/5"
                          placeholder="E.g., God / Conqueror"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Matches Played</label>
                        <input
                          type="number"
                          value={newStatMatches}
                          onChange={(e) => setNewStatMatches(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-transparent/5"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Win Rate %</label>
                        <input
                          type="number"
                          max={100}
                          min={0}
                          value={newStatWinRate}
                          onChange={(e) => setNewStatWinRate(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-transparent/5"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Prize Earnings (Rs)</label>
                        <input
                          type="number"
                          value={newStatPrize}
                          onChange={(e) => setNewStatPrize(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-transparent/5"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddGameStat}
                      className="px-4 py-2 bg-[#00D4FF]/10 hover:bg-blue-100 text-[#1A73E8] border border-blue-200/50 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Append Game Statistics
                    </button>

                    {/* Listed game stats */}
                    {formGamesList.length > 0 ? (
                      <div className="mt-3 border border-white/10 bg-transparent/5 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {formGamesList.map((g) => (
                          <div key={g.gameId} className="px-4 py-3 flex justify-between items-center text-xs hover:bg-white/10/50 transition-colors">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white bg-[#121B2A] px-2.5 py-1 rounded-lg border border-white/10">{g.gameName}</span>
                              <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">{g.rank}</span>
                              <span className="text-gray-400 font-semibold">{g.matchesPlayed} Matches</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-green-600 font-bold">{g.winRate}% Win Rate</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-blue-600 font-bold">Rs. {g.prizeWon.toLocaleString()} Earned</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveGameStat(g.gameId)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all active:scale-90"
                              title="Delete statistics"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-center py-4 bg-transparent/5 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs text-gray-400">No game stats listed. Add stats for games you play to showcase performance.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sponsors & Milestones Section */}
              <div className="bg-transparent/60 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">4</span>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Sponsors & Career Milestones</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Sponsors (Comma-separated list)</label>
                    <input
                      type="text"
                      value={formSponsorsText}
                      onChange={(e) => setFormSponsorsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="Asus ROG, Red Bull, Zong 4G, Razer"
                    />
                    <span className="text-[10px] text-gray-400 block">List brands backing your esports career currently.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wide">Career Milestones / Placements (Comma-separated list)</label>
                    <input
                      type="text"
                      value={formAchievementsText}
                      onChange={(e) => setFormAchievementsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1A73E8] transition-all"
                      placeholder="1st Place National Tekken Championship 2025, Top 8 PMCO PK 2024"
                    />
                    <span className="text-[10px] text-gray-400 block">Outstanding tournament finishes or gaming achievements.</span>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
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
                  <Check className="w-4 h-4" /> Save Professional Profile
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      )}
      </div>
      {/* FLOATING COMPARISON BAR */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border border-[#00D4FF]/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,212,255,0.25)] flex flex-wrap items-center gap-4 max-w-[95%] sm:max-w-[600px] animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {comparePlayersList.map(p => (
                <img 
                  key={p.id}
                  src={p.avatarUrl} 
                  alt={p.name} 
                  className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] object-cover"
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-white font-bold">Player Comparison Stack</p>
              <p className="text-[10px] text-gray-400 font-mono">
                {selectedCompareIds.length === 1 
                  ? "Select 1 more player to compare" 
                  : "2 players selected"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-mono text-gray-300 transition-colors"
            >
              Reset
            </button>
            <button
              disabled={selectedCompareIds.length < 2}
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-1.5 rounded-lg bg-[#00D4FF] hover:bg-white disabled:bg-white/10 disabled:text-white/30 text-black font-bold font-mono text-[10px] uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.3)] disabled:shadow-none"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* PLAYER COMPARISON MODAL */}
      {showCompareModal && comparePlayersList.length === 2 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="premium-gaming-card w-full max-w-4xl border border-[#00D4FF]/30 bg-[#0A0A0F] rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,212,255,0.15)] relative overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            
            {/* Cyber background aesthetics */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7B61FF]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-display font-black tracking-wider text-white uppercase italic">
                  Side-By-Side Arena Comparison
                </h3>
                <p className="text-xs font-mono text-[#00D4FF] uppercase tracking-widest mt-1">
                  Tactical Attributes & Career Statistics
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Profile Headers Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-8 border-b border-white/5 pb-6">
                {comparePlayersList.map((p, idx) => {
                  const r = p.rating || 85;
                  return (
                    <div key={p.id} className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] rounded-full blur-sm opacity-50"></div>
                        <img 
                          src={p.avatarUrl} 
                          alt={p.name} 
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/10 object-cover relative z-10"
                        />
                      </div>
                      <h4 className="text-base md:text-lg font-display font-bold text-white uppercase tracking-tight truncate max-w-full">
                        {p.name}
                      </h4>
                      <p className="text-xs font-mono text-[#00D4FF] font-bold mt-1 uppercase tracking-wide">
                        {p.teamName || 'Free Agent'}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">
                        {p.game}
                      </p>

                      {/* Large OVR Rating Badge */}
                      <div className="mt-4 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border border-white/10 bg-white/5 font-mono">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">OVR Rating:</span>
                        <span className={`text-base font-black ${
                          idx === 0 
                            ? (p.rating || 85) >= (comparePlayersList[1].rating || 85) ? 'text-[#00E676]' : 'text-white'
                            : (p.rating || 85) >= (comparePlayersList[0].rating || 85) ? 'text-[#00E676]' : 'text-white'
                        }`}>{r}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combat / Tactical Skill Bar Comparisons */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono text-gray-400 uppercase font-black tracking-widest text-center">
                  Core Tactical Performance Ratings
                </h4>

                {[
                  { label: 'SPD • REFLEX & SPEED', key: 'spd' },
                  { label: 'PMK • TACTICS & PLAYMAKING', key: 'pmk' },
                  { label: 'STR • STRENGTH & MECHANICS', key: 'str' },
                  { label: 'PHY • RAW PHYSICALITY', key: 'phy' },
                  { label: 'DEF • DEFENSIVE POSITIONING', key: 'def' },
                  { label: 'CLU • CLUTCH CAPABILITY', key: 'clu' }
                ].map((statDef) => {
                  const statKey = statDef.key as keyof Player['skillStats'];
                  const valA = comparePlayersList[0].skillStats?.[statKey] || 80;
                  const valB = comparePlayersList[1].skillStats?.[statKey] || 80;

                  return (
                    <div key={statDef.key} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-400">
                        <span className={valA >= valB ? 'text-[#00E676]' : ''}>{valA}</span>
                        <span>{statDef.label}</span>
                        <span className={valB >= valA ? 'text-[#00E676]' : ''}>{valB}</span>
                      </div>
                      
                      {/* Comparison visual slider bars */}
                      <div className="grid grid-cols-2 gap-2 h-2.5">
                        {/* Player A bar (right aligned) */}
                        <div className="bg-white/5 rounded-l-full overflow-hidden flex justify-end">
                          <div 
                            className={`h-full rounded-l-full transition-all duration-1000 ${
                              valA >= valB 
                                ? 'bg-gradient-to-l from-[#00D4FF] to-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.5)]' 
                                : 'bg-white/20'
                            }`}
                            style={{ width: `${valA}%` }}
                          ></div>
                        </div>

                        {/* Player B bar (left aligned) */}
                        <div className="bg-white/5 rounded-r-full overflow-hidden">
                          <div 
                            className={`h-full rounded-r-full transition-all duration-1000 ${
                              valB >= valA 
                                ? 'bg-gradient-to-r from-[#00D4FF] to-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.5)]' 
                                : 'bg-white/20'
                            }`}
                            style={{ width: `${valB}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Match / Career Statistics */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 space-y-4">
                <h4 className="text-xs font-mono text-gray-400 uppercase font-black tracking-widest text-center">
                  Career Match Statistics
                </h4>

                {[
                  { label: 'Primary Game Win Rate', format: (p: Player) => `${p.gamesList?.[0]?.winRate || 55}%`, compare: (p1: Player, p2: Player) => (p1.gamesList?.[0]?.winRate || 55) - (p2.gamesList?.[0]?.winRate || 55) },
                  { label: 'Competitive Matches Played', format: (p: Player) => `${p.gamesList?.[0]?.matchesPlayed || 120}`, compare: (p1: Player, p2: Player) => (p1.gamesList?.[0]?.matchesPlayed || 120) - (p2.gamesList?.[0]?.matchesPlayed || 120) },
                  { label: 'Esports Prize Winnings', format: (p: Player) => `₨ ${(p.gamesList?.[0]?.prizeWon || 25000).toLocaleString()}`, compare: (p1: Player, p2: Player) => (p1.gamesList?.[0]?.prizeWon || 25000) - (p2.gamesList?.[0]?.prizeWon || 25000) }
                ].map((rowDef, idx) => {
                  const valAStr = rowDef.format(comparePlayersList[0]);
                  const valBStr = rowDef.format(comparePlayersList[1]);
                  const delta = rowDef.compare(comparePlayersList[0], comparePlayersList[1]);

                  return (
                    <div key={idx} className="grid grid-cols-3 gap-2 py-2 border-b border-white/5 items-center text-xs font-mono text-center">
                      <span className={`font-bold ${delta >= 0 ? 'text-[#00E676]' : 'text-gray-300'}`}>
                        {valAStr}
                      </span>
                      <span className="text-gray-500 text-[10px] uppercase">
                        {rowDef.label}
                      </span>
                      <span className={`font-bold ${delta <= 0 ? 'text-[#00E676]' : 'text-gray-300'}`}>
                        {valBStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arena Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors"
              >
                Close Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
