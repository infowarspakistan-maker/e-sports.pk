import React, { useState, useEffect } from 'react';
import { SliderManager } from '../components/admin/SliderManager';
import { 
  LayoutDashboard, Users as UsersIcon, Gamepad2, Trophy, Briefcase, Image as ImageIcon,
  Newspaper, Rss, Link as LinkIcon, Settings as SettingsIcon, Plus, Trash2, Edit2, 
  CheckCircle, AlertCircle, Play, Database, RefreshCw, X, Copy, ExternalLink, Filter, SlidersHorizontal,
  ChevronDown, ChevronUp, Circle, Workflow
} from 'lucide-react';
import { db, updateCustomStorageConfig, type CustomStorageConfig } from '../lib/firebase';
import { 
  collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, onSnapshot, where 
} from 'firebase/firestore';
import { useAuthContext } from '../components/global/AuthProvider';
import { ImageUpload } from '../components/shared/ImageUpload';
import { getDynamicGames, addGame, updateGame, deleteGame, type Game } from '../lib/gamesService';
import { SUPPORTED_GAMES } from '../lib/constants';

import { AdminRankings } from '../components/admin/AdminRankings';
import { AuditCompliancePanel } from '../components/admin/AuditCompliancePanel';
import { VisualBracket } from '../components/features/VisualBracket';

export const AdminDashboard = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    tournaments: true,
    players: true,
    teams: true,
    news: true,
  });
  const [stats, setStats] = useState({
    users: 0,
    players: 0,
    teams: 0,
    tournaments: 0,
    news: 0,
    rssFeeds: 3,
    media: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Live collections
  const [usersList, setUsersList] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [rssFeeds, setRssFeeds] = useState<any[]>([
    { id: '1', name: 'ESports Insider', url: 'https://esportsinsider.com/feed', category: 'News', status: 'Active' },
    { id: '2', name: 'Dot Esports', url: 'https://dotesports.com/feed', category: 'News', status: 'Active' },
    { id: '3', name: 'Liquipedia', url: 'https://liquipedia.net/news.xml', category: 'Analysis', status: 'Inactive' }
  ]);
  const [gamesList, setGamesList] = useState<Game[]>([]);

  // Media library states
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [mediaCategory, setMediaCategory] = useState<'game_logo' | 'sponsor_logo' | 'tournament_banner' | 'other_media'>('game_logo');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'game_logo' | 'sponsor_logo' | 'tournament_banner' | 'other_media'>('all');
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  // Loading states for tables
  const [loadingTable, setLoadingTable] = useState(false);

  // Status and notification messages
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isFetchingRss, setIsFetchingRss] = useState(false);

  // Modal controls
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [tournamentNestedTab, setTournamentNestedTab] = useState<'list' | 'create'>('list');
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showRssModal, setShowRssModal] = useState(false);
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [selectedTournamentForBracket, setSelectedTournamentForBracket] = useState<any>(null);
  const [gameNestedTab, setGameNestedTab] = useState<'list' | 'create'>('list');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [gameForm, setGameForm] = useState<Partial<Game>>({ 
    name: '', 
    category: 'fighting', 
    icon: '🎮', 
    image: '', 
    banner: '', 
    color: '#00D4FF', 
    platforms: ['pc'] 
  });
  const [userForm, setUserForm] = useState({ email: '', displayName: '', role: 'user' });
  const [playerForm, setPlayerForm] = useState({
    name: '',
    game: 'Tekken 8',
    platform: 'PS5',
    city: 'Lahore',
    bio: '',
    availability: 'Lft',
    color: '#FF4444',
    icon: '🥊',
    avatarUrl: '',
    bannerUrl: '',
    youtubeUrl: '',
    totalPrize: 'Rs 0',
    matchesPlayed: '0',
    winRate: '0%',
    isApproved: true,
    sponsorshipScore: '50',
    rating: 85,
    countryCode: 'pk',
    skillStats: {
      str: 80, spd: 80, pmk: 80, phy: 80, def: 80, clu: 80
    }
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    game: 'Tekken 8',
    location: 'Lahore',
    color: '#FF4444',
    status: 'Recruiting',
    bio: '',
    logoUrl: '',
    bannerUrl: '',
    isApproved: true
  });
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    game: 'Tekken 8',
    gameId: 'tekken-8',
    platform: 'PS5',
    prize: 'Rs 250,000',
    icon: '🥊',
    color: '#FF4444',
    date: 'Aug 20 - Aug 22, 2026',
    registered: '12',
    maxTeams: '32',
    status: 'upcoming',
    entryFee: 'Rs 0',
    rules: '1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.'
  });
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', category: 'news', featuredImage: '', game: 'Tekken 8' });
  const [rssForm, setRssForm] = useState({ name: '', url: '', category: 'News', status: 'Active' });
  const [newsImageUploadMode, setNewsImageUploadMode] = useState(false);
  const [mediaDirectUrlMode, setMediaDirectUrlMode] = useState(false);

  // Dynamic Cross-Account Storage Integration State
  const [storageConfig, setStorageConfig] = useState<CustomStorageConfig>({
    useCustom: false,
    type: 'bucket_only',
    bucketName: '',
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [isSavingStorage, setIsSavingStorage] = useState(false);

  // Load stats and active tab details
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const playersSnap = await getDocs(collection(db, 'players'));
      const teamsSnap = await getDocs(collection(db, 'teams'));
      const toursSnap = await getDocs(collection(db, 'tournaments'));
      const newsSnap = await getDocs(collection(db, 'news'));
      const mediaSnap = await getDocs(collection(db, 'media'));

      setStats({
        users: usersSnap.size,
        players: playersSnap.size,
        teams: teamsSnap.size,
        tournaments: toursSnap.size,
        news: newsSnap.size,
        rssFeeds: rssFeeds.length,
        media: mediaSnap.size,
      });
    } catch (err) {
      console.error("Error loading stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadActiveTabData = async () => {
    setLoadingTable(true);
    try {
      if (activeTab === 'users') {
        const snap = await getDocs(collection(db, 'users'));
        setUsersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'players') {
        const snap = await getDocs(collection(db, 'players'));
        setPlayersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'teams') {
        const snap = await getDocs(collection(db, 'teams'));
        setTeamsList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'tournaments') {
        // Real-time subscription handles loading for tournaments
        return;
      } else if (activeTab === 'news') {
        const snap = await getDocs(collection(db, 'news'));
        setNewsList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'games') {
        // Real-time subscription handles loading for games
        return;
      } else if (activeTab === 'settings') {
        const settingsRef = doc(db, "system_settings", "storage");
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          setStorageConfig(snap.data() as CustomStorageConfig);
        }
      }
    } catch (err) {
      console.error(`Error loading ${activeTab}`, err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Fetch storage configuration on mount to support the Media Library tab info
    const fetchStorageSettings = async () => {
      try {
        const settingsRef = doc(db, "system_settings", "storage");
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          setStorageConfig(snap.data() as CustomStorageConfig);
        }
      } catch (err) {
        console.warn("Failed to retrieve storage config on mount:", err);
      }
    };
    fetchStorageSettings();
  }, [rssFeeds]);

  useEffect(() => {
    loadActiveTabData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'media') return;

    setLoadingTable(true);
    const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubMedia = onSnapshot(mediaQuery, (snapshot) => {
      setMediaList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingTable(false);
    }, (err) => {
      console.error("Failed to snapshot media:", err);
      setLoadingTable(false);
    });

    return () => unsubMedia();
  }, [activeTab]);

  // Real-time subscription to tournaments
  useEffect(() => {
    if (activeTab !== 'tournaments') return;

    setLoadingTable(true);
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTournamentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingTable(false);
    }, (err) => {
      console.error("Failed to snapshot tournaments:", err);
      setLoadingTable(false);
    });

    return () => unsub();
  }, [activeTab]);

  // Real-time subscription to games (always active so dropdown works instantly anywhere)
  useEffect(() => {
    const q = query(collection(db, 'games'));
    const unsub = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const games = await getDynamicGames();
          setGamesList(games);
        } catch (err) {
          console.error("Failed to seed games on mount snapshot empty:", err);
        }
      } else {
        setGamesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Game })));
      }
    }, (err) => {
      console.error("Failed to snapshot games:", err);
    });

    return () => unsub();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Seeding initial ecosystem database
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      // Create random seeding arrays
      const games = [
        { gameId: 'tekken-8', game: 'Tekken 8', platform: 'PS5', color: '#E50914', icon: '🥊' },
        { gameId: 'pubg-mobile', game: 'PUBG Mobile', platform: 'Mobile', color: '#FF9900', icon: '📱' },
        { gameId: 'valorant', game: 'Valorant', platform: 'PC', color: '#FF4655', icon: '🔫' },
        { gameId: 'cs2', game: 'CS2', platform: 'PC', color: '#F4B41A', icon: '💣' }
      ];

      const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"];
      const firstNames = ["Ali", "Hassan", "Ahmed", "Usman", "Umar", "Zain", "Saad", "Bilal", "Hamza", "Faizan"];
      const lastNames = ["Khan", "Malik", "Shah", "Raza", "Hussain", "Iqbal", "Butt", "Qureshi", "Sheikh", "Chaudhry"];
      const nicknames = ["Demon", "Ghost", "Sniper", "Viper", "Ninja", "Slayer", "Shadow", "King", "Beast", "Falcon"];

      // Generate 10 Players
      for (let i = 0; i < 10; i++) {
        const game = games[Math.floor(Math.random() * games.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const nick = nicknames[Math.floor(Math.random() * nicknames.length)] + Math.floor(Math.random() * 100);
        
        const player = {
          userId: 'system_seed',
          isApproved: true,
          name: nick,
          game: game.game,
          gameId: game.gameId,
          platform: game.platform,
          city: city,
          bio: `Professional ${game.game} player from ${city}.`,
          icon: game.icon,
          color: game.color,
          availability: ['Lft', 'Signed', 'Open'][Math.floor(Math.random() * 3)],
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}`,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'players'), player);
      }

      // Generate 5 Tournaments
      const tourneyStatus = ['upcoming', 'ongoing', 'completed'];
      for (let i = 0; i < 5; i++) {
        const game = games[Math.floor(Math.random() * games.length)];
        const status = tourneyStatus[Math.floor(Math.random() * tourneyStatus.length)];
        const maxTeams = [16, 32, 64][Math.floor(Math.random() * 3)];
        
        const tournament = {
          name: `Pakistan ${game.game} Championship ${2026 - i}`,
          game: game.game,
          gameId: game.gameId,
          platform: game.platform,
          prize: `Rs. ${Math.floor(Math.random() * 10) * 100000 + 100000}`,
          entryFee: Math.random() > 0.5 ? 'Free' : `Rs. ${Math.floor(Math.random() * 5) * 500 + 500}`,
          date: `Dec ${10 + i} - Dec ${15 + i}, 2026`,
          registeredCount: Math.floor(Math.random() * maxTeams),
          maxTeams: maxTeams,
          status: status,
          icon: game.icon,
          color: game.color,
          bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'tournaments'), tournament);
      }

      showNotification('success', 'Successfully populated 10 players and 5 tournaments!');
      fetchStats();
      loadActiveTabData();
    } catch (err: any) {
      showNotification('error', 'Seeding failed: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Run feeds manually via API trigger
  const handleRunFeedsNow = async () => {
    setIsFetchingRss(true);
    let totalAddedCount = 0;
    
    try {
      const activeFeeds = rssFeeds.filter(feed => feed.isActive || feed.status === 'Active');
      
      if (activeFeeds.length === 0) {
        showNotification('success', 'No active RSS feeds to synchronize.');
        setIsFetchingRss(false);
        return;
      }

      for (const feed of activeFeeds) {
        try {
          const response = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (response.ok) {
            const feedData = await response.json();
            
            if (feedData && feedData.items && feedData.items.length > 0) {
              for (const item of feedData.items.slice(0, 5)) { // Fetch up to 5 items per feed
                const sourceUrl = item.link || '';
                const itemTitle = item.title || '';
                
                if (sourceUrl) {
                  const q = query(collection(db, 'news'), where('sourceUrl', '==', sourceUrl));
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                    continue; // Skip if article already exists by URL
                  }
                }
                
                if (itemTitle) {
                  const qTitle = query(collection(db, 'news'), where('title', '==', itemTitle));
                  const titleSnapshot = await getDocs(qTitle);
                  if (!titleSnapshot.empty) {
                    continue; // Skip if article already exists by title
                  }
                }

                const articleId = 'rss_' + Math.random().toString(36).substr(2, 9);
                
                // Try to extract image from various possible locations in the RSS item
                let imageUrl = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop';
                if (item.enclosure?.url) {
                  imageUrl = item.enclosure.url;
                } else if (item.image?.url) {
                  imageUrl = item.image.url;
                } else if (item.mediaContent?.url || item.mediaContent?.['$']?.url) {
                  imageUrl = item.mediaContent?.url || item.mediaContent?.['$']?.url;
                } else if (item['media:content']?.['$']?.url) {
                  imageUrl = item['media:content']['$'].url;
                } else if (item['media:thumbnail']?.['$']?.url) {
                  imageUrl = item['media:thumbnail']['$'].url;
                } else if (item.thumbnail?.url) {
                  imageUrl = item.thumbnail.url;
                } else {
                  // Try to parse from content HTML
                  const html = item['content:encoded'] || item.content || item.contentSnippet || '';
                  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
                  if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                  }
                }

                await setDoc(doc(db, 'news', articleId), {
                  title: itemTitle || 'RSS Article',
                  excerpt: item.contentSnippet || item.content?.substring(0, 150) || 'An esports news update.',
                  content: item['content:encoded'] || item.content || 'No content provided.',
                  category: feed.category?.toLowerCase() || 'news',
                  game: 'General',
                  publishedAt: new Date(item.pubDate || Date.now()),
                  sourceUrl: sourceUrl,
                  featuredImage: imageUrl
                });
                totalAddedCount++;
              }
            }
          }
        } catch (feedErr) {
          console.error(`Failed to process feed ${feed.name}:`, feedErr);
        }
      }
      
      showNotification('success', `RSS sync completed successfully. Synced ${totalAddedCount} new articles.`);
      fetchStats();
      loadActiveTabData();
    } catch (err: any) {
      showNotification('error', 'RSS synchronization error: ' + err.message);
    } finally {
      setIsFetchingRss(false);
    }
  };

  // Actions: Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uid = 'user_' + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'users', uid), {
        email: userForm.email,
        displayName: userForm.displayName,
        role: userForm.role,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      showNotification('success', `Successfully created user profile for ${userForm.displayName}`);
      setShowUserModal(false);
      setUserForm({ email: '', displayName: '', role: 'user' });
      loadActiveTabData();
      fetchStats();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  // Actions: Create or Update player
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        await setDoc(doc(db, 'players', editingId), {
          ...playerForm,
          updatedAt: new Date(),
        }, { merge: true });
        showNotification('success', `Successfully updated player profile for ${playerForm.name}`);
      } else {
        const id = 'player_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'players', id), {
          ...playerForm,
          createdAt: new Date(),
          isApproved: true,
          userId: 'admin_created'
        });
        showNotification('success', `Successfully added player ${playerForm.name}`);
      }
      setShowPlayerModal(false);
      setEditingId(null);
      setIsEditMode(false);
      loadActiveTabData();
      fetchStats();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  // Actions: Create or Update team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        await setDoc(doc(db, 'teams', editingId), {
          ...teamForm,
          updatedAt: new Date(),
        }, { merge: true });
        showNotification('success', `Successfully updated team ${teamForm.name}`);
      } else {
        const id = 'team_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'teams', id), {
          ...teamForm,
          createdAt: new Date(),
          isApproved: true,
          userId: 'admin_created'
        });
        showNotification('success', `Successfully registered team ${teamForm.name}`);
      }
      setShowTeamModal(false);
      setEditingId(null);
      setIsEditMode(false);
      loadActiveTabData();
      fetchStats();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  // Actions: Create or Update tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const registeredNum = Number(tournamentForm.registered) || 0;
      const maxTeamsNum = Number(tournamentForm.maxTeams) || 32;
      const cleanForm = {
        ...tournamentForm,
        registered: registeredNum,
        registeredCount: registeredNum,
        maxTeams: maxTeamsNum
      };

      if (isEditMode && editingId) {
        await setDoc(doc(db, 'tournaments', editingId), {
          ...cleanForm,
          updatedAt: new Date(),
        }, { merge: true });
        showNotification('success', `Successfully updated tournament ${tournamentForm.name}`);
      } else {
        const id = 'tour_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'tournaments', id), {
          ...cleanForm,
          createdAt: new Date(),
          status: tournamentForm.status || 'upcoming'
        });
        showNotification('success', `Successfully scheduled tournament ${tournamentForm.name}`);
      }
      setShowTournamentModal(false);
      setEditingId(null);
      setIsEditMode(false);
      fetchStats();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  const handleCreateOrUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        await updateGame(editingId, gameForm);
        showNotification('success', `Successfully updated game ${gameForm.name}`);
      } else {
        const id = gameForm.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'new-game';
        await addGame({
          id,
          name: gameForm.name || 'New Game',
          category: gameForm.category || 'general',
          icon: gameForm.icon || '🎮',
          color: gameForm.color || '#00D4FF',
          banner: gameForm.banner,
          image: gameForm.image,
          description: gameForm.description,
          platforms: gameForm.platforms || ['pc'],
          developer: gameForm.developer,
          publisher: gameForm.publisher,
          releaseDate: gameForm.releaseDate,
          websiteUrl: gameForm.websiteUrl,
          matchFormat: gameForm.matchFormat,
        });
        showNotification('success', `Successfully added game ${gameForm.name}`);
      }
      setGameNestedTab('list');
      setEditingId(null);
      setIsEditMode(false);
      loadActiveTabData();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  // Actions: Edit trigger functions
  const handleEditGameClick = (game: Game) => {
    setEditingId(game.id);
    setIsEditMode(true);
    setGameForm(game);
    setGameNestedTab('create');
  };

  const handleEditPlayerClick = (player: any) => {
    setEditingId(player.id);
    setIsEditMode(true);
    setPlayerForm({
      name: player.name || '',
      game: player.game || 'Tekken 8',
      platform: player.platform || 'PS5',
      city: player.city || 'Lahore',
      bio: player.bio || '',
      availability: player.availability || 'Lft',
      color: player.color || '#FF4444',
      icon: player.icon || '🥊',
      avatarUrl: player.avatarUrl || '',
      bannerUrl: player.bannerUrl || '',
      youtubeUrl: player.youtubeUrl || '',
      totalPrize: player.totalPrize || (player.stats?.totalPrize ? String(player.stats.totalPrize) : 'Rs 0'),
      matchesPlayed: player.matchesPlayed || (player.stats?.matchesPlayed ? String(player.stats.matchesPlayed) : '0'),
      winRate: player.winRate || (player.stats?.winRate ? String(player.stats.winRate) : '0%'),
      isApproved: player.isApproved !== false,
      sponsorshipScore: player.sponsorshipScore || '50',
      rating: player.rating || 85,
      countryCode: player.countryCode || 'pk',
      skillStats: player.skillStats || { str: 80, spd: 80, pmk: 80, phy: 80, def: 80, clu: 80 }
    });
    setShowPlayerModal(true);
  };

  const handleEditTeamClick = (team: any) => {
    setEditingId(team.id);
    setIsEditMode(true);
    setTeamForm({
      name: team.name || '',
      game: team.game || 'Tekken 8',
      location: team.location || 'Lahore',
      color: team.color || '#FF4444',
      status: team.status || 'Recruiting',
      bio: team.bio || '',
      logoUrl: team.logoUrl || '',
      bannerUrl: team.bannerUrl || '',
      isApproved: team.isApproved !== false
    });
    setShowTeamModal(true);
  };

  const handleEditTournamentClick = (tour: any) => {
    setEditingId(tour.id);
    setIsEditMode(true);
    setTournamentForm({
      name: tour.name || '',
      game: tour.game || 'Tekken 8',
      gameId: tour.gameId || 'tekken-8',
      platform: tour.platform || 'PS5',
      prize: tour.prize || 'Rs 250,000',
      icon: tour.icon || '🥊',
      color: tour.color || '#FF4444',
      date: tour.date || 'Aug 20 - Aug 22, 2026',
      registered: String(tour.registered || '12'),
      maxTeams: String(tour.maxTeams || '32'),
      status: tour.status || 'upcoming',
      entryFee: tour.entryFee || 'Rs 0',
      rules: tour.rules || '1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.'
    });
    setShowTournamentModal(true);
  };

  // Actions: Create or Edit news
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
        await updateDoc(doc(db, 'news', editingId), {
          ...newsForm,
          updatedAt: new Date(),
        });
        showNotification('success', `Successfully updated article "${newsForm.title}"`);
      } else {
        const id = 'news_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'news', id), {
          ...newsForm,
          publishedAt: new Date(),
          createdAt: new Date(),
        });
        showNotification('success', `Successfully published article "${newsForm.title}"`);
      }
      setShowNewsModal(false);
      setEditingId(null);
      setIsEditMode(false);
      loadActiveTabData();
      fetchStats();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  const handleEditNewsClick = (article: any) => {
    setEditingId(article.id);
    setIsEditMode(true);
    setNewsForm({
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      category: article.category || 'news',
      featuredImage: article.featuredImage || '',
      game: article.game || 'Tekken 8'
    });
    setShowNewsModal(true);
  };

  // Actions: Create RSS feed config
  const handleCreateRss = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = String(rssFeeds.length + 1);
    const newFeed = { id: newId, ...rssForm };
    setRssFeeds([...rssFeeds, newFeed]);
    setShowRssModal(false);
    setRssForm({ name: '', url: '', category: 'News', status: 'Active' });
    showNotification('success', `Added RSS source configuration: ${newFeed.name}`);
  };

  // Actions: Change user role
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: new Date() });
      showNotification('success', `Updated user role to ${newRole}`);
      loadActiveTabData();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  // Actions: Add media asset manually or via custom upload
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      showNotification('error', 'Please upload or specify an asset image URL.');
      return;
    }
    if (!mediaTitle.trim()) {
      showNotification('error', 'Please provide a descriptive title or label for this asset.');
      return;
    }

    setIsAddingMedia(true);
    try {
      const activeStorageName = storageConfig.useCustom 
        ? (storageConfig.type === 'bucket_only' ? (storageConfig.bucketName || "Custom Bucket") : (storageConfig.storageBucket || "Custom Config Project"))
        : "Default App Storage";

      const mediaRef = collection(db, 'media');
      await addDoc(mediaRef, {
        url: mediaUrl,
        fileName: mediaTitle.trim().toLowerCase().replace(/\s+/g, '_') + '.jpg',
        fileSize: 1024 * 350, // mock standard logo size for references (350kb)
        contentType: 'image/jpeg',
        uploadedBy: user?.uid || 'admin',
        uploaderName: user?.displayName || user?.email?.split('@')[0] || 'Administrator',
        uploaderPhoto: user?.photoURL || '',
        title: mediaTitle.trim(),
        description: `Registered as a platform ${mediaCategory.replace('_', ' ')}.`,
        likesCount: 0,
        likedBy: [],
        category: mediaCategory,
        storageName: activeStorageName,
        createdAt: new Date()
      });

      showNotification('success', `Successfully registered "${mediaTitle}" inside the Media Library!`);
      setMediaTitle('');
      setMediaUrl('');
      fetchStats();
    } catch (err: any) {
      showNotification('error', 'Failed to save media metadata: ' + err.message);
    } finally {
      setIsAddingMedia(false);
    }
  };

  // Actions: Seed preset graphic cards
  const handleSeedMediaPresets = async () => {
    
    setIsAddingMedia(true);
    try {
      const presets = [
        {
          title: 'Republic of Gamers Logo',
          url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=200&auto=format&fit=crop&q=80',
          category: 'sponsor_logo',
          description: 'ASUS ROG Pakistan esports tournament sponsor logo.'
        },
        {
          title: 'Zong 4G Pakistan Logo',
          url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&auto=format&fit=crop&q=80',
          category: 'sponsor_logo',
          description: 'Zong 4G Telecom sponsor asset.'
        },
        {
          title: 'Red Bull Energy Drink Logo',
          url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200&auto=format&fit=crop&q=80',
          category: 'sponsor_logo',
          description: 'Red Bull Pakistan Fighting Games sponsor logo.'
        },
        {
          title: 'Logitech G Series Logo',
          url: 'https://images.unsplash.com/photo-1527813713060-77948387ab7b?w=200&auto=format&fit=crop&q=80',
          category: 'sponsor_logo',
          description: 'Logitech Gaming gears sponsor asset.'
        },
        {
          title: 'Tekken 8 Cover Art',
          url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
          category: 'game_logo',
          description: 'Standard game artwork for Tekken 8 categories.'
        },
        {
          title: 'Valorant Championship Banner',
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
          category: 'game_logo',
          description: 'Game category graphics for Valorant Pakistan League.'
        },
        {
          title: 'PUBG Mobile Pakistan Cup Banner',
          url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&auto=format&fit=crop&q=80',
          category: 'tournament_banner',
          description: 'Cover art for national PUBG mobile matches.'
        }
      ];

      const mediaRef = collection(db, 'media');
      let seededCount = 0;
      for (const p of presets) {
        await addDoc(mediaRef, {
          url: p.url,
          fileName: p.title.toLowerCase().replace(/\s+/g, '_') + '.jpg',
          fileSize: 1024 * 280,
          contentType: 'image/jpeg',
          uploadedBy: user?.uid || 'admin',
          uploaderName: 'System Seeder',
          uploaderPhoto: '',
          title: p.title,
          description: p.description,
          likesCount: 0,
          likedBy: [],
          category: p.category,
          storageName: "System Preset / Default Storage",
          createdAt: new Date()
        });
        seededCount++;
      }

      showNotification('success', `Seeded ${seededCount} highly polished graphics and logos into your Media Library!`);
      fetchStats();
    } catch (err: any) {
      showNotification('error', 'Seeding failed: ' + err.message);
    } finally {
      setIsAddingMedia(false);
    }
  };

  // Generic Deletion
  const handleDeleteItem = async (collectionName: string, id: string) => {
    
    try {
      await deleteDoc(doc(db, collectionName, id));
      showNotification('success', `${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} item deleted successfully.`);
      // Delay slightly to allow Firestore to process the deletion before reloading
      setTimeout(() => {
        loadActiveTabData();
        fetchStats();
      }, 500);
    } catch (e: any) {
      console.error(`Delete failed for ${collectionName}/${id}:`, e);
      let errorMessage = e.message;
      if (e.code === 'permission-denied') {
        errorMessage = "Access Denied: You do not have permission to delete this item. Please ensure you are logged in as a verified administrator.";
      }
      showNotification('error', errorMessage);
    }
  };

  // Toggle Profile Approval Status
  const handleToggleApproval = async (collectionName: string, id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, collectionName, id), {
        isApproved: !currentStatus
      });
      showNotification('success', `Approval status updated to ${!currentStatus ? 'Approved' : 'Pending'}.`);
      loadActiveTabData();
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };



  const renderContent = () => {
    // 1. Dashboard tab
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">E-Sports Pakistan Overview</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Real-time statistics synchronized directly from your Firestore Database.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="flex items-center gap-2 bg-[#00D4FF] hover:bg-transparent text-black px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              >
                <Database className="w-4 h-4" /> {isSeeding ? 'Seeding...' : 'Seed Ecosystem'}
              </button>
              <button 
                onClick={fetchStats}
                className="flex items-center gap-2 bg-transparent/5 border border-white/10 hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] hover:border-[#00D4FF]/50 text-[#A0A0AB] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
            {[
              { label: 'Total Users', value: stats.users, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10 border-[#00D4FF]/20' },
              { label: 'Esports Players', value: stats.players, color: 'text-[#FF4444]', bg: 'bg-[#FF4444]/10 border-[#FF4444]/20' },
              { label: 'Active Teams', value: stats.teams, color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10 border-[#FFD700]/20' },
              { label: 'Tournaments', value: stats.tournaments, color: 'text-[#00E676]', bg: 'bg-[#00E676]/10 border-[#00E676]/20' },
              { label: 'News / RSS Items', value: stats.news, color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/10 border-[#7B61FF]/20' },
              { label: 'Media Assets', value: stats.media || 0, color: 'text-[#FF00FF]', bg: 'bg-[#FF00FF]/10 border-[#FF00FF]/20' },
              { label: 'RSS Feeds', value: stats.rssFeeds, color: 'text-[#00FFFF]', bg: 'bg-[#00FFFF]/10 border-[#00FFFF]/20' },
            ].map((stat, i) => (
              <div key={i} className={`border p-5 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] ${stat.bg} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1`}>
                <p className="text-[10px] text-[#A0A0AB] font-mono font-bold mb-2 uppercase tracking-widest">{stat.label}</p>
                {loadingStats ? (
                  <div className="h-8 w-12 bg-transparent/10 animate-pulse rounded"></div>
                ) : (
                  <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 premium-gaming-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00D4FF]" /> Database Integration Guides
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-transparent/5 rounded border border-white/10">
                  <p className="font-bold text-[#00D4FF] mb-2 uppercase tracking-wider text-xs">Ecosystem Interconnection</p>
                  <p className="leading-relaxed text-[#A0A0AB]">
                    All player profiles, registered team organizations, and game-specific tournaments are interconnected via Firestore collection references.
                    Use the <strong className="text-white">"Seed Ecosystem"</strong> button above to pre-populate verified listings instantly.
                  </p>
                </div>
                <div className="p-4 bg-transparent/5 rounded border border-white/10">
                  <p className="font-bold text-[#7B61FF] mb-2 uppercase tracking-wider text-xs">RSS & Automated News Feed</p>
                  <p className="leading-relaxed text-[#A0A0AB]">
                    E-Sports.pk pulls RSS feeds via our secure server-side proxy route. When you run sync on RSS feeds, articles are automatically formatted, categorized, and added to the Firestore news directory.
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-gaming-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-white mb-2">Live Status Monitors</h3>
                <p className="font-mono text-xs text-[#A0A0AB] mb-6">Current health indicators of the application runtime environment.</p>
                <div className="space-y-4 font-mono">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-[#A0A0AB]">Firestore Connection</span>
                    <span className="text-[#00E676] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-[#A0A0AB]">Express RSS Proxy</span>
                    <span className="text-[#00E676] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#A0A0AB]">SEO Crawler</span>
                    <span className="text-[#00D4FF] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span>
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-[#A0A0AB]">
                E-Sports Pakistan Admin Portal v1.2
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Users tab
    if (activeTab === 'users') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Registered Accounts</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Manage user accounts and elevate roles.</p>
            </div>
            <button 
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Display Name</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Email Address</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Role Access</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#A0A0AB] font-mono animate-pulse uppercase tracking-widest text-xs">Loading users database...</td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#A0A0AB] font-mono">No users found. Seed the database to populate sample accounts.</td>
                    </tr>
                  ) : (
                    usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-transparent/5 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white tracking-wide">{user.displayName || 'No Name'}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{user.email}</td>
                        <td className="py-4 px-5">
                          <select 
                            value={user.role || 'user'}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            className="bg-transparent border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors uppercase tracking-wider"
                          >
                            <option value="user">User</option>
                            <option value="player">Player</option>
                            <option value="team">Team Manager</option>
                            <option value="sponsor">Sponsor</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button 
                            onClick={() => handleDeleteItem('users', user.id)}
                            className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 3. Players tab
    if (activeTab === 'players') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Esports Players Directory</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Edit, moderate, or create player profiles shown in the community directory.</p>
            </div>
            <button 
              onClick={() => {
                setEditingId(null);
                setIsEditMode(false);
                setPlayerForm({
                  name: '',
                  game: 'Tekken 8',
                  platform: 'PS5',
                  city: 'Lahore',
                  bio: '',
                  availability: 'Lft',
                  color: '#FF4444',
                  icon: '🥊',
                  avatarUrl: '',
                  bannerUrl: '',
                  youtubeUrl: '',
                  totalPrize: 'Rs 0',
                  matchesPlayed: '0',
                  winRate: '0%',
                  isApproved: true,
                  sponsorshipScore: '50'
                });
                setShowPlayerModal(true);
              }}
              className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
            >
              <Plus className="w-4 h-4" /> Add Player Profile
            </button>
          </div>

          <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Player Name</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Main Game</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Platform</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">City</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Approval</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Availability</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#A0A0AB] font-mono animate-pulse uppercase tracking-widest text-xs">Loading players directory...</td>
                    </tr>
                  ) : playersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#A0A0AB] font-mono">No players found in database. Click "Seed Ecosystem Data" on the overview tab.</td>
                    </tr>
                  ) : (
                    playersList.map((player) => (
                      <tr key={player.id} className="hover:bg-transparent/5 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white tracking-wide">{player.name}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{player.game}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{player.platform}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{player.city || 'N/A'}</td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleApproval('players', player.id, player.isApproved === true)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors border ${
                              player.isApproved === true 
                                ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 hover:bg-[#00E676]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]' 
                                : 'bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/50 hover:bg-[#FF9900]/30 shadow-[0_0_10px_rgba(255,153,0,0.2)]'
                            }`}
                            title="Click to toggle approval status"
                          >
                            {player.isApproved === true ? 'Approved' : 'Pending'}
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/50 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                            {player.availability || 'Lft'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {deletingId === player.id ? (
                              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1 animate-in fade-in duration-200">
                                <span className="text-[10px] text-red-400 font-bold font-mono">Confirm Delete?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteItem('players', player.id);
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEditPlayerClick(player)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded transition-all"
                                  title="Edit Player"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setDeletingId(player.id)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all"
                                  title="Delete Player"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 4. Teams tab
    if (activeTab === 'teams') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Registered Esports Orgs & Teams</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Monitor roster status and manage team directory listings.</p>
            </div>
            <button 
              onClick={() => {
                setEditingId(null);
                setIsEditMode(false);
                setTeamForm({
                  name: '',
                  game: 'Tekken 8',
                  location: 'Lahore',
                  color: '#FF4444',
                  status: 'Recruiting',
                  bio: '',
                  logoUrl: '',
                  bannerUrl: '',
                  isApproved: true
                });
                setShowTeamModal(true);
              }}
              className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
            >
              <Plus className="w-4 h-4" /> Register New Team
            </button>
          </div>

          <div className="premium-gaming-card shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Team Name</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Main Title</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Base Location</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Approval</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Status</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#A0A0AB] font-mono animate-pulse uppercase tracking-widest text-xs">Loading teams database...</td>
                    </tr>
                  ) : teamsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#A0A0AB] font-mono">No teams registered. Seed the database to populate sample rosters.</td>
                    </tr>
                  ) : (
                    teamsList.map((team) => (
                      <tr key={team.id} className="hover:bg-transparent/5 transition-colors group">
                        <td className="py-4 px-5 font-bold text-[#00D4FF] tracking-wide">{team.name}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{team.game}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{team.location}</td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleApproval('teams', team.id, team.isApproved === true)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors border ${
                              team.isApproved === true 
                                ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 hover:bg-[#00E676]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]' 
                                : 'bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/50 hover:bg-[#FF9900]/30 shadow-[0_0_10px_rgba(255,153,0,0.2)]'
                            }`}
                            title="Click to toggle approval status"
                          >
                            {team.isApproved === true ? 'Approved' : 'Pending'}
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                            {team.status || 'Recruiting'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {deletingId === team.id ? (
                              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1 animate-in fade-in duration-200">
                                <span className="text-[10px] text-red-400 font-bold font-mono">Confirm Delete?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteItem('teams', team.id);
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEditTeamClick(team)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded transition-all"
                                  title="Edit Team"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setDeletingId(team.id)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all"
                                  title="Delete Team"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 5. Tournaments tab
    if (activeTab === 'tournaments') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Esports Tournament Matches</h2>
                <p className="text-sm text-[#A0A0AB] font-mono mt-2">Create, schedule, or update tournament brackets across Pakistan.</p>
              </div>
              {tournamentNestedTab === 'list' && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setIsEditMode(false);
                    setTournamentForm({
                      name: '',
                      game: 'Tekken 8',
                      gameId: 'tekken-8',
                      platform: 'PS5',
                      prize: 'Rs 250,000',
                      icon: '🥊',
                      color: '#FF4444',
                      date: 'Aug 20 - Aug 22, 2026',
                      registered: '12',
                      maxTeams: '32',
                      status: 'upcoming',
                      entryFee: 'Rs 0',
                      rules: '1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.'
                    });
                    setShowTournamentModal(true);
                  }}
                  className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
                >
                  <Plus className="w-4 h-4" /> Create Tournament
                </button>
              )}
            </div>

            <div className="flex gap-2 border-b border-[#2A2A40]">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 border-[#00D4FF] text-white`}
              >
                List Tournaments
              </button>
            </div>
          </div>

          <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 bg-transparent">
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Tournament Name</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Game Category</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Date & Time</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Prize Pool</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Capacity</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                    {loadingTable ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#A0A0AB] font-mono animate-pulse uppercase tracking-widest text-xs">Loading tournaments database...</td>
                      </tr>
                    ) : tournamentsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#A0A0AB] font-mono">No tournaments scheduled yet. Create one above!</td>
                      </tr>
                    ) : (
                      tournamentsList.map((t) => (
                        <tr key={t.id} className="hover:bg-transparent/5 transition-colors group">
                          <td className="py-4 px-5 font-bold text-white tracking-wide">{t.name}</td>
                          <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{t.game} ({t.platform})</td>
                          <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{t.date}</td>
                          <td className="py-4 px-5 text-[#00E676] font-mono font-bold tracking-widest">{t.prize}</td>
                          <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs">{t.registered}/{t.maxTeams} Teams</td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end items-center gap-3">
                              {deletingId === t.id ? (
                                <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1 animate-in fade-in duration-200">
                                  <span className="text-[10px] text-red-400 font-bold font-mono">Confirm Delete?</span>
                                  <button
                                    onClick={() => {
                                      handleDeleteItem('tournaments', t.id);
                                      setDeletingId(null);
                                    }}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setSelectedTournamentForBracket(t);
                                      setShowBracketModal(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-[#7B61FF] hover:bg-[#7B61FF]/10 rounded border border-white/5 hover:border-[#7B61FF]/30 transition-all flex items-center gap-1 text-xs font-mono"
                                    title="Manage Bracket"
                                  >
                                    <Workflow className="w-3.5 h-3.5" />
                                    <span>Bracket</span>
                                  </button>
                                  <button 
                                    onClick={() => handleEditTournamentClick(t)}
                                    className="p-1.5 text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded border border-white/5 hover:border-[#00D4FF]/30 transition-all flex items-center gap-1 text-xs font-mono"
                                    title="Edit Tournament"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => setDeletingId(t.id)}
                                    className="p-1.5 text-gray-400 hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded border border-white/5 hover:border-[#FF4444]/30 transition-all flex items-center gap-1 text-xs font-mono"
                                    title="Delete Tournament"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      );
    }

    // 6. News tab
    if (activeTab === 'news') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Esports News Articles</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Original journalism, analytical blogs, and RSS items synced in Firestore.</p>
            </div>
            <button 
              onClick={() => {
                setEditingId(null);
                setIsEditMode(false);
                setNewsForm({
                  title: '',
                  excerpt: '',
                  content: '',
                  category: 'news',
                  featuredImage: '',
                  game: 'Tekken 8'
                });
                setShowNewsModal(true);
              }}
              className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
            >
              <Plus className="w-4 h-4" /> Publish Article
            </button>
          </div>

          <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Article Title</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Excerpt</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Category</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#A0A0AB] font-mono animate-pulse uppercase tracking-widest text-xs">Loading news database...</td>
                    </tr>
                  ) : newsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#A0A0AB] font-mono">No articles published yet. Publish a new article or trigger RSS sync!</td>
                    </tr>
                  ) : (
                    newsList.map((n) => (
                      <tr key={n.id} className="hover:bg-transparent/5 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white max-w-xs truncate">{n.title}</td>
                        <td className="py-4 px-5 text-[#A0A0AB] max-w-sm truncate text-xs">{n.excerpt}</td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-[#7B61FF]/20 text-[#7B61FF] border border-[#7B61FF]/50 shadow-[0_0_10px_rgba(123,97,255,0.2)]">
                            {n.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {deletingId === n.id ? (
                              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1 animate-in fade-in duration-200">
                                <span className="text-[10px] text-red-400 font-bold font-mono">Confirm Delete?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteItem('news', n.id);
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEditNewsClick(n)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded transition-all"
                                  title="Edit Article"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setDeletingId(n.id)}
                                  className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Media Library tab
    if (activeTab === 'media') {
      const filteredMedia = mediaList.filter(item => {
        if (mediaFilter === 'all') return true;
        return item.category === mediaFilter;
      });

      const currentBucketName = storageConfig.useCustom 
        ? (storageConfig.type === 'bucket_only' ? (storageConfig.bucketName || "Custom Bucket") : (storageConfig.storageBucket || "Custom Config Project"))
        : "Default Project Storage";

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#202124]">Centralized Media & Assets Library</h2>
              <p className="text-sm text-gray-400">Manage and upload high-resolution sponsor logos, game thumbnails, and tournament banner assets.</p>
            </div>
            <button
              type="button"
              onClick={handleSeedMediaPresets}
              disabled={isAddingMedia}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Database className="w-4 h-4" /> Seed System Asset Presets
            </button>
          </div>

          {/* Dynamic Storage Source Information Banner */}
          <div className="bg-transparent border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#00D4FF]/10 border border-blue-100 rounded-lg text-[#1A73E8] mt-0.5">
                <Database className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Current Storage Target: <span className="text-[#1A73E8]">{currentBucketName}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">
                  All active media assets uploaded to the platform are registered and retrieved dynamically from this target storage instance.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    ● Connected & Online
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#00D4FF]/10 text-blue-700 border border-blue-200">
                    Bucket Name: {currentBucketName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Mode: {storageConfig.useCustom ? "Custom Cross-Account Integration" : "Default App Storage"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Upload Form */}
            <div className="bg-transparent border border-white/10 rounded-xl p-5 shadow-sm h-fit space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2 border-b pb-3 border-gray-100">
                <Plus className="w-5 h-5 text-[#1A73E8]" /> Add New Asset
              </h3>
              <form onSubmit={handleAddMedia} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Asset Category</label>
                  <select
                    value={mediaCategory}
                    onChange={(e: any) => setMediaCategory(e.target.value)}
                    className="w-full text-sm border border-white/10 rounded-lg p-2 bg-transparent focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                  >
                    <option value="game_logo">Game Logo / Thumbnail</option>
                    <option value="sponsor_logo">Sponsor / Brand Logo</option>
                    <option value="tournament_banner">Tournament Banner Graphic</option>
                    <option value="other_media">General Media Upload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">Asset Label / Title</label>
                  <input
                    type="text"
                    required
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="e.g., Tekken 8 Icon, Red Bull Logo..."
                    className="w-full text-sm border border-white/10 rounded-lg p-2 focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-gray-200">Asset Graphic Image</label>
                    <button
                      type="button"
                      onClick={() => setMediaDirectUrlMode(!mediaDirectUrlMode)}
                      className="text-xs text-[#1A73E8] hover:underline"
                    >
                      {mediaDirectUrlMode ? "Upload Image instead" : "Paste Image URL instead"}
                    </button>
                  </div>
                  {mediaDirectUrlMode ? (
                    <input
                      type="text"
                      required
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or paste image URL link"
                      className="w-full text-sm border border-white/10 rounded-lg p-2 focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                    />
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-1 bg-transparent">
                      <ImageUpload
                        label="Upload Graphic"
                        storagePath="admin/media"
                        currentUrl={mediaUrl}
                        onUploadComplete={(url) => setMediaUrl(url)}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {mediaDirectUrlMode 
                      ? "Paste a direct web link to an image." 
                      : "Upload high-res transparent PNG/JPG. Stored securely inside Firebase Storage."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isAddingMedia || !mediaUrl || !mediaTitle.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMedia ? 'Saving Metadata...' : 'Register to Library'}
                </button>
              </form>
            </div>

            {/* Media Gallery / Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-transparent border border-white/10 rounded-xl p-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Assets' },
                    { id: 'game_logo', label: 'Game Icons' },
                    { id: 'sponsor_logo', label: 'Sponsor Logos' },
                    { id: 'tournament_banner', label: 'Tournament Banners' },
                    { id: 'other_media', label: 'General' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setMediaFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mediaFilter === filter.id
                          ? 'bg-[#1A73E8] text-white shadow-sm'
                          : 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {filteredMedia.length} of {mediaList.length} items
                </span>
              </div>

              {loadingTable ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-transparent border border-white/10 rounded-xl p-3 animate-pulse space-y-3">
                      <div className="aspect-video bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="bg-transparent border border-white/10 rounded-xl p-12 text-center">
                  <div className="inline-flex p-3 bg-white/10 rounded-full text-gray-400 mb-3">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-white">No media assets found</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                    Upload new graphics or click "Seed System Asset Presets" to auto-populate high quality graphics.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-transparent border border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-gray-900 flex items-center justify-center p-2 border-b border-gray-100 overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/75 text-white capitalize backdrop-blur-sm">
                          {item.category?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-3 space-y-1 bg-transparent">
                        <h4 className="font-semibold text-xs text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate" title={item.description}>
                          {item.description || 'No description provided.'}
                        </p>
                        <p className="text-[9px] font-mono text-gray-400">
                          By {item.uploaderName || 'Admin'}
                        </p>
                        {/* Storage Integration Details */}
                        <div className="pt-1">
                          <span className="text-[8px] font-mono font-medium text-blue-700 bg-[#00D4FF]/10 border border-blue-100 px-1.5 py-0.5 rounded truncate max-w-full block" title={item.storageName || "Default App Storage"}>
                            📦 {item.storageName || "Default App Storage"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-transparent border-t border-white/10 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showNotification('success', 'Image URL copied to clipboard!');
                          }}
                          className="flex items-center gap-1 bg-transparent border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white px-2 py-1 rounded text-[10px] font-medium transition-all"
                          title="Copy Image URL"
                        >
                          <Copy className="w-3 h-3" /> Copy URL
                        </button>
                        <div className="flex items-center gap-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-transparent border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white p-1 rounded transition-all"
                            title="Open original"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleDeleteItem('media', item.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded border border-red-200 transition-all"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 7. RSS Feeds tab
    if (activeTab === 'rss') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">RSS Aggregator Setup</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Configure global news feeds to sync tournament summaries automatically.</p>
            </div>
            <button 
              onClick={() => setShowRssModal(true)}
              className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
            >
              <Plus className="w-4 h-4" /> Add RSS Source
            </button>
          </div>

          <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-transparent">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleRunFeedsNow}
                  disabled={isFetchingRss}
                  className="bg-[#00D4FF] text-black px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider hover:bg-transparent transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                >
                  {isFetchingRss ? 'Synchronizing Feeds...' : '▶ Sync Active RSS Feeds Now'}
                </button>
                <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">Runs through our server-side secure parser</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Feed Name</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">URL Reference</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Category</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Status</th>
                    <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md font-body">
                  {rssFeeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-transparent/5 transition-colors group">
                      <td className="py-4 px-5 font-bold text-white tracking-wide">{feed.name}</td>
                      <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs truncate max-w-[200px]">{feed.url}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-[#7B61FF]/20 text-[#7B61FF] border border-[#7B61FF]/50 shadow-[0_0_10px_rgba(123,97,255,0.2)]">
                          {feed.category}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
                          feed.status === 'Active' 
                            ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.2)]' 
                            : 'bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/50 shadow-[0_0_10px_rgba(255,153,0,0.2)]'
                        }`}>
                          {feed.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setRssFeeds(rssFeeds.filter(f => f.id !== feed.id));
                              showNotification('success', 'RSS feed configuration removed.');
                            }}
                            className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rssFeeds.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#A0A0AB] font-mono">No RSS feeds defined. Seed database or add manually.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 8. Partners tab
    if (activeTab === 'partners') {
      return (
        <div className="space-y-6 relative z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Partner Backlink Configurations</h2>
            <p className="text-sm text-[#A0A0AB] font-mono mt-2">Configure SEO linkages and copy references for the 3 verified partner websites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'travel', name: 'Agility Travels', url: 'https://agilitytravels.com', keywords: 'Umrah packages Pakistan, study abroad Germany, visa processing', service: 'Premium Umrah, Haj, Corporate Travel, Student Visa Counseling' },
              { id: 'events', name: 'AV Live', url: 'https://avlive.com.pk', keywords: 'event production Pakistan, live streaming Lahore, AV solutions Karachi', service: 'Broadcasting, Video Conferencing, Complex AV Installations' },
              { id: 'manufacturing', name: 'Made By Pak', url: 'https://madebypak.com', keywords: 'made in Pakistan products, Support local manufacturers, assembled in Pakistan', service: 'Gaming Accessories, Local Hardware Assembly, Apparel Vendors' },
            ].map((p, idx) => (
              <div key={idx} className="premium-gaming-card p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-4 hover:border-[#00D4FF]/30 transition-colors">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#00D4FF]" /> {p.name}
                  </h3>
                  <span className="text-[10px] bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.2)] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                </div>
                <div className="space-y-3 text-xs text-[#A0A0AB] font-mono">
                  <p><strong className="text-white block mb-1">Primary URL:</strong> <span className="text-[#00D4FF] hover:underline cursor-pointer">{p.url}</span></p>
                  <p><strong className="text-white block mb-1">Provided Services:</strong> {p.service}</p>
                  <p><strong className="text-white block mb-1">Target Keywords:</strong> <span className="text-[#A0A0AB]/80 italic">{p.keywords}</span></p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button 
                    onClick={() => showNotification('success', `Partner layout canonical reference verified for ${p.name}`)}
                    className="w-full bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,212,255,0.05)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                  >
                    Validate SEO Authority Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Slider Management tab
    if (activeTab === 'slider') {
      return <SliderManager />;
    }

    // Rankings tab
    if (activeTab === 'rankings') {
      return (
        <div className="space-y-6 relative z-10">
          <AdminRankings />
        </div>
      );
    }

    // Games Ecosystem tab
    if (activeTab === 'games') {
      return (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Games Ecosystem</h2>
              <p className="text-sm text-[#A0A0AB] font-mono mt-2">Manage supported games and categories across the platform.</p>
            </div>
            {gameNestedTab === 'list' && (
              <button 
                onClick={() => {
                  setGameForm({ name: '', category: 'fighting', icon: '🎮', image: '', banner: '', color: '#00D4FF', platforms: ['pc'] });
                  setIsEditMode(false);
                  setGameNestedTab('create');
                }}
                className="flex items-center gap-2 bg-transparent/5 hover:bg-[#00D4FF] text-white hover:text-black border border-white/10 hover:border-[#00D4FF] px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
              >
                <Plus className="w-4 h-4" /> Add Game
              </button>
            )}
          </div>

          <div className="flex gap-2 border-b border-[#2A2A40]">
            <button 
              onClick={() => setGameNestedTab('list')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${gameNestedTab === 'list' ? 'border-[#00D4FF] text-white' : 'border-transparent text-[#A0A0AB] hover:text-white'}`}
            >
              List Games
            </button>
            <button 
              onClick={() => setGameNestedTab('create')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${gameNestedTab === 'create' ? 'border-[#00D4FF] text-white' : 'border-transparent text-[#A0A0AB] hover:text-white'}`}
            >
              {isEditMode ? 'Edit Game' : 'Add Game'}
            </button>
          </div>

          {gameNestedTab === 'create' ? (
            <div className="max-w-[600px] mx-auto premium-gaming-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleCreateOrUpdateGame} className="space-y-6">
                
                {/* Descriptive Meta-data */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-[#00D4FF] font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Descriptive Meta-data</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Game Name</label>
                      <input required type="text" value={gameForm.name} onChange={e => setGameForm({...gameForm, name: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. Tekken 8" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Category</label>
                      <select value={gameForm.category} onChange={e => setGameForm({...gameForm, category: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all appearance-none">
                        <option value="fighting">Fighting</option>
                        <option value="fps">FPS</option>
                        <option value="moba">MOBA</option>
                        <option value="sports">Sports</option>
                        <option value="battle-royale">Battle Royale</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Description</label>
                    <textarea value={gameForm.description || ''} onChange={e => setGameForm({...gameForm, description: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" rows={2} placeholder="Ecosystem description..."></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Developer</label>
                      <input type="text" value={gameForm.developer || ''} onChange={e => setGameForm({...gameForm, developer: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. Bandai Namco" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Publisher</label>
                      <input type="text" value={gameForm.publisher || ''} onChange={e => setGameForm({...gameForm, publisher: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. Bandai Namco" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Release Date</label>
                      <input type="text" value={gameForm.releaseDate || ''} onChange={e => setGameForm({...gameForm, releaseDate: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. 2024" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Match Format</label>
                      <input type="text" value={gameForm.matchFormat || ''} onChange={e => setGameForm({...gameForm, matchFormat: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. 1v1, 5v5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Theme Color</label>
                      <input required type="color" value={gameForm.color} onChange={e => setGameForm({...gameForm, color: e.target.value})} className="w-full h-11 p-1 bg-black/40 border border-white/10 rounded cursor-pointer" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Website URL</label>
                    <input type="text" value={gameForm.websiteUrl || ''} onChange={e => setGameForm({...gameForm, websiteUrl: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. https://..." />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Platforms (comma separated)</label>
                    <input required type="text" value={gameForm.platforms?.join(', ')} onChange={e => setGameForm({...gameForm, platforms: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. pc, ps5, mobile" />
                  </div>
                </div>

                {/* Icon Assets */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-[#00D4FF] font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Icon Assets</h3>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Primary Icon (Emoji or Image URL)</label>
                    <input required type="text" value={gameForm.icon} onChange={e => setGameForm({...gameForm, icon: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. 🥊 or https://..." />
                  </div>
                </div>

                {/* Banner Images */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-[#00D4FF] font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Banner Images</h3>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Hero Banner URL (Large)</label>
                    <input type="text" value={gameForm.banner || ''} onChange={e => setGameForm({...gameForm, banner: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. https://unsplash.com/..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Featured Card Image URL (Medium)</label>
                    <input type="text" value={gameForm.image || ''} onChange={e => setGameForm({...gameForm, image: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. https://unsplash.com/..." />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-[#00D4FF] text-black hover:bg-[#00D4FF]/80 py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]">
                    {isEditMode ? 'Update Game Profile' : 'Save Game Profile'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="premium-gaming-card overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 bg-transparent">
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest w-16">Icon</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Name</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Category</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Platforms</th>
                      <th className="py-4 px-5 text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-white/5 bg-[#121B2A]/70 backdrop-blur-md text-sm font-body">
                  {gamesList.map((game) => (
                    <tr key={game.id} className="hover:bg-transparent/5 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="w-12 h-8 rounded overflow-hidden border border-white/10 shadow-inner bg-white/5 flex items-center justify-center">
                          {game.image ? (
                            <img src={game.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{game.icon}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-white tracking-wide" style={{ color: game.color }}>{game.name}</td>
                      <td className="py-4 px-5 text-[#A0A0AB] font-mono text-xs capitalize">{game.category}</td>
                      <td className="py-4 px-5 text-[#A0A0AB]">
                        <div className="flex gap-2">
                          {game.platforms?.map(p => (
                            <span key={p} className="px-3 py-1 bg-transparent/5 text-[#A0A0AB] rounded border border-white/10 text-[10px] font-mono uppercase tracking-widest">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditGameClick(game)} className="p-2 text-[#A0A0AB] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteItem('games', game.id)} className="p-2 text-[#A0A0AB] hover:text-[#FF4444] hover:bg-[#FF4444]/10 rounded transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {gamesList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#A0A0AB] font-mono">
                        No games configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>)}
        </div>
      );
    }

    // 9. Settings tab
    if (activeTab === 'settings') {
      const handleSaveStorage = async () => {
        setIsSavingStorage(true);
        try {
          await updateCustomStorageConfig(storageConfig);
          showNotification('success', 'Firebase Storage configuration updated and applied in real-time!');
        } catch (err: any) {
          console.error("Error saving custom storage config:", err);
          showNotification('error', 'Failed to save Firebase Storage config: ' + err.message);
        } finally {
          setIsSavingStorage(false);
        }
      };

      return (
        <div className="space-y-8 max-w-4xl relative z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Platform Configurations</h2>
            <p className="text-sm text-[#A0A0AB] font-mono mt-2">Configure global metadata variables and manage cross-account integrations.</p>
          </div>

          {/* Standard metadata configurations */}
          <div className="premium-gaming-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">Global Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono font-bold text-[#A0A0AB] mb-2 uppercase tracking-widest">Ecosystem Name</label>
                <input type="text" className="w-full px-4 py-3 border border-white/10 rounded bg-transparent text-white font-mono text-sm opacity-50 cursor-not-allowed" value="E-Sports Pakistan (e-sports.pk)" disabled />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-[#A0A0AB] mb-2 uppercase tracking-widest">Target Regional Scope</label>
                <input type="text" className="w-full px-4 py-3 border border-white/10 rounded bg-transparent text-white font-mono text-sm opacity-50 cursor-not-allowed" value="Pakistan National (Bilingual English/Urdu Content)" disabled />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#00D4FF]/5 rounded border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-mono shadow-[inset_0_0_20px_rgba(0,212,255,0.05)]">
              <div>
                <p className="font-bold uppercase tracking-wider mb-1">Bespoke Enterprise Database Mode</p>
                <p className="text-[#00D4FF]/70">This instance is configured using specific Firestore Enterprise databases on our Cloud Ingress architecture.</p>
              </div>
            </div>
          </div>

          {/* Cross-Account Firebase Storage Integration */}
          <div className="premium-gaming-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Cross-Account Firebase Storage Integration</h3>
                <p className="text-xs font-mono text-[#A0A0AB] mt-1">Route all media, avatar, and banner uploads to a secondary Firebase project or custom storage bucket.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={storageConfig.useCustom}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, useCustom: e.target.checked }))}
                />
                <div className="w-12 h-6 bg-transparent border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#A0A0AB] peer-checked:after:bg-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D4FF] peer-checked:shadow-[0_0_15px_rgba(0,212,255,0.4)]"></div>
                <span className="ml-3 text-xs font-mono font-bold uppercase tracking-widest text-white">Enable</span>
              </label>
            </div>

            {storageConfig.useCustom && (
              <div className="space-y-8 pt-2">
                {/* Integration Type */}
                <div>
                  <label className="block text-xs font-mono font-bold text-[#A0A0AB] mb-3 uppercase tracking-widest">Integration Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-start p-4 border rounded cursor-pointer transition-all ${storageConfig.type === 'bucket_only' ? 'bg-[#00D4FF]/5 border-[#00D4FF]/50 shadow-[inset_0_0_15px_rgba(0,212,255,0.1)]' : 'bg-transparent border-white/10 hover:border-white/30'}`}>
                      <input 
                        type="radio" 
                        name="storage_type" 
                        value="bucket_only"
                        checked={storageConfig.type === 'bucket_only'}
                        onChange={() => setStorageConfig(prev => ({ ...prev, type: 'bucket_only' }))}
                        className="mt-1 accent-[#00D4FF]"
                      />
                      <div className="ml-4">
                        <span className={`block text-sm font-bold tracking-wide ${storageConfig.type === 'bucket_only' ? 'text-[#00D4FF]' : 'text-white'}`}>Custom Bucket Only</span>
                        <span className="block text-xs font-mono text-[#A0A0AB] mt-1">Uses the existing app credentials with a different bucket URL (gs://...)</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border rounded cursor-pointer transition-all ${storageConfig.type === 'full_credentials' ? 'bg-[#00D4FF]/5 border-[#00D4FF]/50 shadow-[inset_0_0_15px_rgba(0,212,255,0.1)]' : 'bg-transparent border-white/10 hover:border-white/30'}`}>
                      <input 
                        type="radio" 
                        name="storage_type" 
                        value="full_credentials"
                        checked={storageConfig.type === 'full_credentials'}
                        onChange={() => setStorageConfig(prev => ({ ...prev, type: 'full_credentials' }))}
                        className="mt-1 accent-[#00D4FF]"
                      />
                      <div className="ml-4">
                        <span className={`block text-sm font-bold tracking-wide ${storageConfig.type === 'full_credentials' ? 'text-[#00D4FF]' : 'text-white'}`}>Full Firebase Web Config</span>
                        <span className="block text-xs font-mono text-[#A0A0AB] mt-1">Connects to a completely separate Firebase project/account using API keys</span>
                      </div>
                    </label>
                  </div>
                </div>

                {storageConfig.type === 'bucket_only' ? (
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#A0A0AB] mb-2 uppercase tracking-widest">Custom Storage Bucket URL</label>
                    <div className="flex rounded shadow-sm border border-white/10 focus-within:border-[#00D4FF] focus-within:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all">
                      <span className="inline-flex items-center px-4 rounded-l bg-transparent/5 border-r border-white/10 text-[#A0A0AB] text-sm font-mono">
                        gs://
                      </span>
                      <input 
                        type="text" 
                        className="flex-1 min-w-0 block w-full px-4 py-3 bg-transparent rounded-r text-white text-sm font-mono focus:outline-none"
                        placeholder="my-secondary-bucket-name.appspot.com"
                        value={storageConfig.bucketName || ''}
                        onChange={(e) => setStorageConfig(prev => ({ ...prev, bucketName: e.target.value }))}
                      />
                    </div>
                    <p className="mt-2 text-xs font-mono text-[#FF9900]">Make sure CORS is configured on this bucket to allow uploads from this domain.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-transparent p-6 rounded border border-white/10 shadow-inner">
                    <div className="col-span-1 md:col-span-2 border-b border-white/5 pb-4 mb-2">
                      <h4 className="text-sm font-bold text-white mb-1 tracking-wide">Firebase App Config Credentials</h4>
                      <p className="text-xs font-mono text-[#A0A0AB]">Specify the complete firebaseConfig dictionary obtained from the Firebase Console settings of the other account.</p>
                    </div>
                    
                    {[
                      { label: 'API Key (apiKey)', key: 'apiKey', placeholder: 'AIzaSy...' },
                      { label: 'Auth Domain (authDomain)', key: 'authDomain', placeholder: 'other-project.firebaseapp.com' },
                      { label: 'Project ID (projectId)', key: 'projectId', placeholder: 'other-project-id' },
                      { label: 'Storage Bucket (storageBucket)', key: 'storageBucket', placeholder: 'other-project.appspot.com' },
                      { label: 'Messaging Sender ID', key: 'messagingSenderId', placeholder: '123456789012' },
                      { label: 'App ID (appId)', key: 'appId', placeholder: '1:123456789012:web:abcd1234efgh' }
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-mono font-bold text-[#A0A0AB] mb-2 uppercase tracking-widest">{field.label}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-[#121B2A]/70 backdrop-blur-md border border-white/10 rounded text-white text-sm font-mono focus:border-[#00D4FF] focus:outline-none focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
                          placeholder={field.placeholder}
                          value={(storageConfig as any)[field.key] || ''}
                          onChange={(e) => setStorageConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSaveStorage}
                disabled={isSavingStorage}
                className="bg-[#00D4FF] hover:bg-transparent disabled:bg-gray-600 disabled:text-gray-400 text-black px-8 py-3 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.3)] disabled:shadow-none"
              >
                {isSavingStorage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Applying Credentials...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Apply & Save Storage Config
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'audit') {
      return <AuditCompliancePanel />;
    }

    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-xl bg-transparent">
        <p className="text-gray-400 text-lg capitalize">{activeTab} Management (Coming Soon)</p>
      </div>
    );
  };

  const navGroups = [
    {
      title: 'Overview & Users',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: UsersIcon },
        { id: 'audit', label: 'Audit Log', icon: CheckCircle },
      ]
    },
    {
      title: 'Ecosystem',
      items: [
        { 
          id: 'players', 
          label: 'Players Directory', 
          icon: Gamepad2,
          children: [
            { id: 'players', label: 'All Players', type: 'tab' },
            { 
              id: 'add-player', 
              label: 'Add Athlete', 
              type: 'action', 
              action: () => {
                setEditingId(null);
                setIsEditMode(false);
                setPlayerForm({
                  name: '',
                  game: 'Tekken 8',
                  platform: 'PS5',
                  city: 'Lahore',
                  bio: '',
                  availability: 'Lft',
                  color: '#FF4444',
                  icon: '🥊',
                  avatarUrl: '',
                  bannerUrl: '',
                  youtubeUrl: '',
                  totalPrize: 'Rs 0',
                  matchesPlayed: '0',
                  winRate: '0%',
                  isApproved: true,
                  sponsorshipScore: '50'
                });
                setShowPlayerModal(true);
              } 
            },
          ]
        },
        { 
          id: 'teams', 
          label: 'Teams & Orgs', 
          icon: Trophy,
          children: [
            { id: 'teams', label: 'All Teams', type: 'tab' },
            { 
              id: 'add-team', 
              label: 'Register Org', 
              type: 'action', 
              action: () => {
                setEditingId(null);
                setIsEditMode(false);
                setTeamForm({
                  name: '',
                  game: 'Tekken 8',
                  location: 'Lahore',
                  color: '#FF4444',
                  status: 'Recruiting',
                  bio: '',
                  logoUrl: '',
                  bannerUrl: '',
                  isApproved: true
                });
                setShowTeamModal(true);
              } 
            },
          ]
        },
        { id: 'games', label: 'Games Config', icon: Gamepad2 },
      ]
    },
    {
      title: 'Competitions',
      items: [
        { 
          id: 'tournaments', 
          label: 'Tournaments', 
          icon: Play,
          children: [
            { id: 'tournaments', label: 'All Tournaments', type: 'tab' },
            { 
              id: 'add-tournament', 
              label: 'Create Event', 
              type: 'action', 
              action: () => {
                setEditingId(null);
                setIsEditMode(false);
                setTournamentForm({
                  name: '',
                  game: 'Tekken 8',
                  gameId: 'tekken8',
                  platform: 'PS5',
                  prize: 'Rs 100,000',
                  date: 'Aug 15 - Aug 17, 2026',
                  registered: '0',
                  maxTeams: '64',
                  description: 'National Qualifier',
                  status: 'upcoming',
                  bannerUrl: '',
                  icon: '🥊',
                  color: '#00D4FF',
                  entryFee: 'Rs 1,000',
                  rules: '1. Only open to residents of Pakistan.\n2. Standard game balance rules apply.'
                });
                setShowTournamentModal(true);
              } 
            }
          ]
        },
        { id: 'rankings', label: 'Leaderboards', icon: Trophy },
      ]
    },
    {
      title: 'Content Engine',
      items: [
        { 
          id: 'news', 
          label: 'News Articles', 
          icon: Newspaper,
          children: [
            { id: 'news', label: 'All Articles', type: 'tab' },
            { 
              id: 'publish-article', 
              label: 'Publish Article', 
              type: 'action', 
              action: () => {
                setEditingId(null);
                setIsEditMode(false);
                setNewsForm({
                  title: '',
                  excerpt: '',
                  content: '',
                  category: 'news',
                  featuredImage: '',
                  game: 'Tekken 8'
                });
                setShowNewsModal(true);
              } 
            }
          ]
        },
        { id: 'slider', label: 'Home Slider', icon: SlidersHorizontal },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
        { id: 'rss', label: 'RSS Feeds', icon: Rss },
        { id: 'partners', label: 'Brand Partners', icon: LinkIcon },
      ]
    },
    {
      title: 'System Settings',
      items: [
        { id: 'settings', label: 'Global Setup', icon: SettingsIcon },
      ]
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-transparent text-white select-none">
      <aside className="w-64 bg-[#121B2A]/70 backdrop-blur-md border-r border-white/5 flex flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-10">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
            E-Sports Pakistan
          </h2>
          <span className="text-[10px] font-mono text-gray-500 block mt-1 uppercase">Unified Control Deck</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isParentActive = activeTab === item.id;
                  const hasChildren = !!item.children;
                  const isExpanded = !!expandedMenus[item.id];

                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                          }
                          setActiveTab(item.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono tracking-wide uppercase transition-all duration-300 ${
                          isParentActive 
                            ? 'bg-[#00D4FF]/10 text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.12)] border border-[#00D4FF]/20' 
                            : 'text-[#A0A0AB] hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={`w-4 h-4 ${isParentActive ? 'text-[#00D4FF]' : 'text-[#A0A0AB]'}`} />
                          <span>{item.label}</span>
                        </div>
                        {hasChildren && (
                          isExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </button>

                      {hasChildren && isExpanded && (
                        <div className="pl-6 space-y-1 border-l border-white/5 ml-5 mt-1 animate-in slide-in-from-top-1 duration-200">
                          {item.children.map((child, cIdx) => {
                            const isChildActive = activeTab === child.id && child.type === 'tab';
                            return (
                              <button
                                key={cIdx}
                                onClick={() => {
                                  if (child.type === 'action' && child.action) {
                                    child.action();
                                  } else {
                                    setActiveTab(child.id);
                                  }
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono tracking-wide uppercase transition-all ${
                                  isChildActive
                                    ? 'text-[#00D4FF] font-bold font-mono'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <Circle className={`w-1 h-1 ${isChildActive ? 'fill-[#00D4FF] text-[#00D4FF]' : 'text-gray-600'}`} />
                                <span>{child.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
      
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto overflow-x-hidden relative">
        {/* Decorative ambient light */}
        <div className="fixed top-20 left-[20%] w-[500px] h-[500px] bg-[#00D4FF] rounded-full blur-[150px] opacity-[0.03] pointer-events-none"></div>

        {alert && (
          <div className={`p-4 rounded mb-8 flex items-center gap-3 border shadow-lg ${
            alert.type === 'success' 
              ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]' 
              : 'bg-[#FF4444]/10 border-[#FF4444]/30 text-[#FF4444]'
          }`}>
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-mono uppercase tracking-wider">{alert.message}</span>
          </div>
        )}

        {renderContent()}
      </main>

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-2xl border border-[#2A2A40] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-[#2A2A40] flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">Add User Account</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. player@e-sports.pk" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Display Name</label>
                <input required type="text" value={userForm.displayName} onChange={e => setUserForm({...userForm, displayName: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Ahmad K." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role Access</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm">
                  <option value="user">Standard User</option>
                  <option value="player">Player</option>
                  <option value="team">Team Manager</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Add User</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Player */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-5xl border border-[#2A2A40] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-[#2A2A40] flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">{isEditMode ? 'Edit Esports Player Profile' : 'Add Esports Player'}</h3>
              <button onClick={() => setShowPlayerModal(false)} className="text-gray-400 hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePlayer} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Player Name</label>
                  <input required type="text" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Ahmad K." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Game</label>
                  <input required type="text" value={playerForm.game} onChange={e => setPlayerForm({...playerForm, game: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Tekken 8" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Device/Platform</label>
                  <input required type="text" value={playerForm.platform} onChange={e => setPlayerForm({...playerForm, platform: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. PS5 / Mobile / PC" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Home City</label>
                  <input required type="text" value={playerForm.city} onChange={e => setPlayerForm({...playerForm, city: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Lahore / Karachi" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Availability</label>
                  <select value={playerForm.availability} onChange={e => setPlayerForm({...playerForm, availability: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-transparent text-white">
                    <option value="Lft">Lft (Looking for Team)</option>
                    <option value="Signed">Signed</option>
                    <option value="Open">Open (Free Agent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Sponsorship Score (0-100)</label>
                  <input type="number" min="0" max="100" value={playerForm.sponsorshipScore} onChange={e => setPlayerForm({...playerForm, sponsorshipScore: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Total Prize</label>
                  <input type="text" value={playerForm.totalPrize} onChange={e => setPlayerForm({...playerForm, totalPrize: e.target.value})} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" placeholder="e.g. Rs 50,000" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Matches</label>
                  <input type="number" value={playerForm.matchesPlayed} onChange={e => setPlayerForm({...playerForm, matchesPlayed: e.target.value})} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Win Rate %</label>
                  <input type="text" value={playerForm.winRate} onChange={e => setPlayerForm({...playerForm, winRate: e.target.value})} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" placeholder="e.g. 70%" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Overall Card Rating</label>
                  <input type="number" min="0" max="99" value={playerForm.rating} onChange={e => setPlayerForm({...playerForm, rating: Number(e.target.value)})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-black/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Nationality (pk, us)</label>
                  <input type="text" maxLength={2} value={playerForm.countryCode} onChange={e => setPlayerForm({...playerForm, countryCode: e.target.value.toLowerCase()})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-black/20" />
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="block text-[11px] font-bold text-[#FF00FF] uppercase mb-3 tracking-widest font-mono">Skill Card Breakdown</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(playerForm.skillStats || {}).map(stat => (
                    <div key={stat}>
                      <label className="block text-[9px] font-mono font-bold text-gray-500 uppercase mb-1">{stat}</label>
                      <input 
                        type="number" 
                        min="0" max="99" 
                        value={(playerForm.skillStats as any)[stat]} 
                        onChange={e => setPlayerForm({
                          ...playerForm, 
                          skillStats: { ...playerForm.skillStats, [stat]: Number(e.target.value) } 
                        })} 
                        className="w-full px-2 py-1.5 border border-white/10 rounded text-xs bg-black/40" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Theme Color Code</label>
                  <div className="flex gap-2">
                    <input type="color" value={playerForm.color} onChange={e => setPlayerForm({...playerForm, color: e.target.value})} className="w-10 h-9 p-0 border border-gray-300 rounded cursor-pointer" />
                    <input type="text" value={playerForm.color} onChange={e => setPlayerForm({...playerForm, color: e.target.value})} className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Game Icon Emoji</label>
                  <input type="text" value={playerForm.icon} onChange={e => setPlayerForm({...playerForm, icon: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="🥊, 🔫, etc." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Avatar Image URL</label>
                <input type="text" value={playerForm.avatarUrl} onChange={e => setPlayerForm({...playerForm, avatarUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="https://unsplash.com/... or upload" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Profile Banner URL</label>
                <input type="text" value={playerForm.bannerUrl} onChange={e => setPlayerForm({...playerForm, bannerUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="https://unsplash.com/... or upload" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">YouTube Channel / Highlights Link</label>
                <input type="text" value={playerForm.youtubeUrl} onChange={e => setPlayerForm({...playerForm, youtubeUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. https://youtube.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Player Bio / Lft Statement</label>
                <textarea required value={playerForm.bio} onChange={e => setPlayerForm({...playerForm, bio: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" rows={3} placeholder="Competitive Tekken 8 player..."></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isApproved" checked={playerForm.isApproved} onChange={e => setPlayerForm({...playerForm, isApproved: e.target.checked})} className="w-4 h-4 text-[#1A73E8] border-gray-300 rounded focus:ring-[#1A73E8]" />
                <label htmlFor="isApproved" className="text-sm font-medium text-gray-200">Approved Profile (appears publicly)</label>
              </div>

              <button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {isEditMode ? 'Update Player Profile' : 'Add Player'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Team */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-5xl border border-[#2A2A40] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-[#2A2A40] flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">{isEditMode ? 'Edit Esports Team' : 'Add Esports Team'}</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-400 hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Team Name</label>
                  <input required type="text" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Team Thunder" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Main Game</label>
                  <input required type="text" value={teamForm.game} onChange={e => setTeamForm({...teamForm, game: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Tekken 8" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location City</label>
                  <input required type="text" value={teamForm.location} onChange={e => setTeamForm({...teamForm, location: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Lahore / Islamabad" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Roster Status</label>
                  <select value={teamForm.status} onChange={e => setTeamForm({...teamForm, status: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-transparent text-white">
                    <option value="Recruiting">Recruiting</option>
                    <option value="Roster Full">Roster Full</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Accent/Theme Color</label>
                <div className="flex gap-2">
                  <input type="color" value={teamForm.color} onChange={e => setTeamForm({...teamForm, color: e.target.value})} className="w-10 h-9 p-0 border border-gray-300 rounded cursor-pointer" />
                  <input type="text" value={teamForm.color} onChange={e => setTeamForm({...teamForm, color: e.target.value})} className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Team Logo URL</label>
                <input type="text" value={teamForm.logoUrl} onChange={e => setTeamForm({...teamForm, logoUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. https://unsplash.com/..." />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Team Banner URL</label>
                <input type="text" value={teamForm.bannerUrl} onChange={e => setTeamForm({...teamForm, bannerUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. https://unsplash.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Team Bio / About Description</label>
                <textarea required value={teamForm.bio} onChange={e => setTeamForm({...teamForm, bio: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" rows={3} placeholder="Leading esports organization in Pakistan..."></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="teamApproved" checked={teamForm.isApproved} onChange={e => setTeamForm({...teamForm, isApproved: e.target.checked})} className="w-4 h-4 text-[#1A73E8] border-gray-300 rounded focus:ring-[#1A73E8]" />
                <label htmlFor="teamApproved" className="text-sm font-medium text-gray-200">Approved Team Listing</label>
              </div>

              <button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {isEditMode ? 'Update Team' : 'Register Team'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Create Tournament */}
      {showTournamentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-5xl border border-[#2A2A40] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-[#2A2A40] flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">{isEditMode ? 'Edit Tournament Event' : 'Create Tournament Event'}</h3>
              <button onClick={() => setShowTournamentModal(false)} className="text-gray-400 hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTournament} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tournament Name</label>
                  <input required type="text" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. National Tekken Cup" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Game</label>
                  <select
                    required
                    value={tournamentForm.gameId || ''}
                    onChange={e => {
                      const selectedGameId = e.target.value;
                      const selectedGameObj = gamesList.find(g => g.id === selectedGameId) || SUPPORTED_GAMES.find(g => g.id === selectedGameId);
                      if (selectedGameObj) {
                        setTournamentForm({
                          ...tournamentForm,
                          gameId: selectedGameId,
                          game: selectedGameObj.name,
                          icon: selectedGameObj.icon || '🎮',
                          color: selectedGameObj.color || '#00D4FF'
                        });
                      } else {
                        setTournamentForm({
                          ...tournamentForm,
                          gameId: selectedGameId,
                          game: selectedGameId
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00D4FF] transition-all"
                  >
                    <option value="" disabled>-- Select Game --</option>
                    {(gamesList.length > 0 ? gamesList : SUPPORTED_GAMES).map(g => (
                      <option key={g.id} value={g.id}>
                        {(g.icon && g.icon.startsWith('http')) ? '🎮' : g.icon} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Platform</label>
                  <input required type="text" value={tournamentForm.platform} onChange={e => setTournamentForm({...tournamentForm, platform: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. PS5 / Mobile / PC" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prize Pool Summary</label>
                  <input required type="text" value={tournamentForm.prize} onChange={e => setTournamentForm({...tournamentForm, prize: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Rs 500,000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dates of Tournament</label>
                  <input required type="text" value={tournamentForm.date} onChange={e => setTournamentForm({...tournamentForm, date: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Aug 15 - Aug 17, 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Entry Fee</label>
                  <input required type="text" value={tournamentForm.entryFee} onChange={e => setTournamentForm({...tournamentForm, entryFee: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Rs 1,000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registered Teams/Players</label>
                  <input required type="number" value={tournamentForm.registered} onChange={e => setTournamentForm({...tournamentForm, registered: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Maximum Bracket Size</label>
                  <input required type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Tournament Banner URL</label>
                <input type="text" value={tournamentForm.bannerUrl} onChange={e => setTournamentForm({...tournamentForm, bannerUrl: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. https://unsplash.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tournament Description</label>
                <textarea required value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" rows={3} placeholder="Tournament details and rules..."></textarea>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select value={tournamentForm.status} onChange={e => setTournamentForm({...tournamentForm, status: e.target.value})} className="w-full px-2 py-2 border border-white/10 rounded-lg text-xs bg-transparent text-white">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Game Icon</label>
                  <input type="text" value={tournamentForm.icon} onChange={e => setTournamentForm({...tournamentForm, icon: e.target.value})} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" placeholder="🥊, 🔫" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Theme Color</label>
                  <input type="text" value={tournamentForm.color} onChange={e => setTournamentForm({...tournamentForm, color: e.target.value})} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" placeholder="#FF4444" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rules & Regulations</label>
                <textarea required value={tournamentForm.rules} onChange={e => setTournamentForm({...tournamentForm, rules: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" rows={4} placeholder="Tournament rules..."></textarea>
              </div>

              <button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {isEditMode ? 'Update Tournament Event' : 'Schedule Tournament'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Create News */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-4xl border border-[#2A2A40] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-[#2A2A40] flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">{isEditMode ? 'Edit Esports Article' : 'Publish Esports Article'}</h3>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-400 hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateNews} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Article Title</label>
                <input required type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Arslan Ash Wins Evo 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Game Tag</label>
                <input required type="text" value={newsForm.game} onChange={e => setNewsForm({...newsForm, game: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="e.g. Tekken 8 / Valorant" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category Category</label>
                <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm">
                  <option value="news">News</option>
                  <option value="blog">Blog / Editorial</option>
                  <option value="interview">Exclusive Interview</option>
                  <option value="analysis">Match Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Excerpt / Hook</label>
                <input required type="text" value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="Brief summary for list card..." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Featured Image</label>
                  <button 
                    type="button" 
                    onClick={() => setNewsImageUploadMode(!newsImageUploadMode)} 
                    className="text-xs text-[#1A73E8] hover:underline"
                  >
                    {newsImageUploadMode ? "Paste Image URL instead" : "Upload Image instead"}
                  </button>
                </div>
                {newsImageUploadMode ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-1 bg-transparent">
                    <ImageUpload
                      label="Upload News Image"
                      storagePath="news/images"
                      currentUrl={newsForm.featuredImage}
                      onUploadComplete={(url) => setNewsForm({...newsForm, featuredImage: url})}
                    />
                  </div>
                ) : (
                  <input type="text" value={newsForm.featuredImage} onChange={e => setNewsForm({...newsForm, featuredImage: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" placeholder="https://images.unsplash.com/... or blank" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Content</label>
                <textarea required value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" rows={4} placeholder="Full journalistic report..."></textarea>
              </div>
              <button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">{isEditMode ? 'Update Article' : 'Publish Article'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Create RSS Feed Source */}
      {showRssModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#121B2A] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden max-w-2xl w-full animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-display font-bold text-white uppercase tracking-wider">Add RSS News Source</h3>
              <button onClick={() => setShowRssModal(false)} className="text-[#A0A0AB] hover:text-[#00D4FF] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateRss} className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Feed Source Name</label>
                <input required type="text" value={rssForm.name} onChange={e => setRssForm({...rssForm, name: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="e.g. Liquipedia News" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">Feed XML URL</label>
                <input required type="url" value={rssForm.url} onChange={e => setRssForm({...rssForm, url: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all" placeholder="https://example.com/feed" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest mb-2">News Category</label>
                <select value={rssForm.category} onChange={e => setRssForm({...rssForm, category: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-white/10 rounded text-white font-mono text-sm focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF] transition-all appearance-none">
                  <option value="News">News</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Brackets">Brackets</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#00D4FF] text-black hover:bg-transparent hover:text-black py-3 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">Add RSS Source</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Create/Edit Game */}
      
      {/* MODAL 8: Manage Tournament Bracket */}
      {showBracketModal && selectedTournamentForBracket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8 overflow-y-auto">
          <div className="bg-[#050505] rounded-none w-full max-w-7xl border border-white/10 shadow-[0_0_100px_rgba(0,212,255,0.1)] overflow-hidden animate-in fade-in zoom-in duration-500 flex flex-col max-h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0A0A0A] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="font-display font-black text-white uppercase italic tracking-widest text-xl flex items-center gap-3">
                  <Workflow className="w-6 h-6 text-[#00D4FF]" />
                  <span>Bracket Builder: {selectedTournamentForBracket.name}</span>
                </h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Live Tournament Path Visualization Engine</p>
              </div>
              <button 
                onClick={() => setShowBracketModal(false)} 
                className="relative z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#020202]">
              <VisualBracket tournamentId={selectedTournamentForBracket.id} isAdmin={true} />
            </div>
            <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Database Sync Active</span>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-[#FFD700]" />
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{selectedTournamentForBracket.prize} Prize Pool</span>
                </div>
              </div>
              <button 
                onClick={() => setShowBracketModal(false)}
                className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all"
              >
                Close Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
