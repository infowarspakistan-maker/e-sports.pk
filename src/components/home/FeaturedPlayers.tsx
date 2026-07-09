import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Users, ChevronRight, Award } from 'lucide-react';
import { EsportsPlayerCard } from '../features/EsportsPlayerCard';

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
  name: string;
  game: string;
  gameId: string;
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

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'p_1',
    name: 'Ahmad Khan',
    game: 'Tekken 8',
    gameId: 'tekken-8',
    platform: 'PlayStation 5',
    city: 'Lahore',
    bio: 'Elite Tekken 8 champion from Lahore. Known for supreme spacing and defensive control. Placed top 3 in multiple qualifiers.',
    availability: 'Lft',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=kYor-e7Eezg',
    color: '#FF4444',
    teamId: 'none',
    teamName: 'Free Agent',
    sponsors: ['Asus ROG Pakistan', 'Logitech G'],
    achievements: ['1st Place National Tekken 8 Cup 2025', '2nd Place Lahore Esports Open'],
    rating: 94,
    countryCode: 'pk',
    skillStats: { str: 92, spd: 88, pmk: 75, phy: 85, def: 96, clu: 90 },
    gamesList: []
  },
  {
    id: 'p_2',
    name: 'Sara Malik',
    game: 'PUBG Mobile',
    gameId: 'pubg-mobile',
    platform: 'Mobile',
    city: 'Karachi',
    bio: 'Professional PUBG Mobile IGL. Highly strategic planner with 4+ years of competitive experience leading tier-1 team lobbies.',
    availability: 'Signed',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=mD0E6a2y8Wc',
    color: '#FF9900',
    teamId: 't1',
    teamName: 'Team Thunder',
    sponsors: ['Red Bull Pakistan'],
    achievements: ['MVP PUBG Mobile Pakistan League', 'Top 8 PMGO Main Stage'],
    rating: 91,
    countryCode: 'pk',
    skillStats: { str: 82, spd: 95, pmk: 90, phy: 78, def: 85, clu: 94 },
    gamesList: []
  },
  {
    id: 'p_3',
    name: 'Zain Rizvi',
    game: 'Free Fire',
    gameId: 'free-fire',
    platform: 'Mobile',
    city: 'Islamabad',
    bio: 'High-speed rusher and fragger. Unmatched accuracy in intense close range fights. Part of multiple international tournament brackets.',
    availability: 'Open',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    youtubeUrl: '',
    color: '#FF2E93',
    teamId: 'none',
    teamName: 'None / Free Agent',
    sponsors: [],
    achievements: ['1st Place National Free Fire Cup', 'Top Fragger Pakistan Series 2025'],
    rating: 88,
    countryCode: 'pk',
    skillStats: { str: 90, spd: 91, pmk: 80, phy: 80, def: 82, clu: 88 },
    gamesList: []
  },
  {
    id: 'p_4',
    name: 'Fatima Naqvi',
    game: 'COD Warzone',
    gameId: 'cod-warzone',
    platform: 'PC / Console',
    city: 'Peshawar',
    bio: 'Stealth marksman and sniper specialist. Holds the record for the highest clutch ratio on current regional custom tournaments.',
    availability: 'Lft',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    youtubeUrl: '',
    color: '#00D4FF',
    teamId: 'none',
    teamName: 'None / Free Agent',
    sponsors: [],
    achievements: ['3rd Place Asia Open Division', 'National Sniping Champion'],
    rating: 86,
    countryCode: 'pk',
    skillStats: { str: 84, spd: 83, pmk: 88, phy: 85, def: 88, clu: 92 },
    gamesList: []
  }
];

export const FeaturedPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const q = query(collection(db, 'players'), limit(4));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
          setPlayers(list);
        }
      } catch (e) {
        console.warn("Failed to load featured players from db, using high fidelity default seed list.", e);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  return (
    <section className="w-full py-20 relative z-10 border-b border-white/5 bg-[#0A0D1A]/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[#FFD700]" />
              <span className="text-[10px] font-mono font-black text-[#A0A0AB] uppercase tracking-[0.3em]">PROFILES SPOTLIGHT</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white mb-2">
              Pakistan's <span className="text-[#00D4FF]">Top Talent</span>
            </h2>
            <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px]">
              Meet the elite competitors representing Pakistan's esports future. Review verified sponsorship indices, combat stats, and gaming records.
            </p>
          </div>
          <Link to="/players" className="flex items-center gap-2 text-[#00D4FF] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors shrink-0">
            View All Players <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[1/1.48] bg-white/5 border border-white/10 rounded-[24px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 justify-items-center">
            {players.map((player) => (
              <Link to="/players" key={player.id} className="w-full block">
                <EsportsPlayerCard player={{
                  ...player,
                  teamName: player.teamName || 'Free Agent'
                }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
