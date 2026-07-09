import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Sparkles, Sword, Play, Smartphone, Gamepad, Award } from 'lucide-react';

interface GameGenre {
  id: string;
  category: string;
  emoji: string;
  icon: React.ReactNode;
  bgImage: string;
  color: string;
  games: string[];
  platforms: string[];
  description: string;
}

export const GameShowcase: React.FC = () => {
  const [activeGenre, setActiveGenre] = useState<string>('fighting');

  const genres: GameGenre[] = [
    {
      id: 'fighting',
      category: 'Fighting',
      emoji: '🥊',
      icon: <Sword className="w-5 h-5 text-[#FF4444]" />,
      bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800',
      color: '#FF4444',
      games: ['Tekken 8', 'KOF XV', 'SF6', 'MK1'],
      platforms: ['PS5', 'PS4', 'Xbox', 'PC'],
      description: 'Test your reflexes, spacing, and match knowledge. Join Pakistan\'s legendary fighting game champions.'
    },
    {
      id: 'battle-royale',
      category: 'Battle Royale',
      emoji: '🪂',
      icon: <Shield className="w-5 h-5 text-[#FF9900]" />,
      bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
      color: '#FF9900',
      games: ['PUBG', 'PUBG Mobile', 'Free Fire', 'Apex'],
      platforms: ['PC', 'Mobile', 'PS5', 'Xbox'],
      description: 'Drop, loot, survive. Dominate the battleground alongside tactical squads and master high-speed rotations.'
    },
    {
      id: 'fps',
      category: 'FPS / Tactical',
      emoji: '🔫',
      icon: <Sparkles className="w-5 h-5 text-[#00D4FF]" />,
      bgImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800',
      color: '#00D4FF',
      games: ['COD: Warzone', 'Valorant', 'CS:GO', 'Overwatch'],
      platforms: ['PC', 'PS5', 'Xbox'],
      description: 'Precision aiming and team cohesion. Execute strategies, plant devices, and clutch round wins.'
    },
    {
      id: 'moba',
      category: 'MOBA',
      emoji: '⚔️',
      icon: <Sword className="w-5 h-5 text-[#7B61FF]" />,
      bgImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800',
      color: '#7B61FF',
      games: ['Dota 2', 'League of Legends'],
      platforms: ['PC', 'Mobile'],
      description: 'Macro strategic depth. Build lane dominance, contest objectives, and shatter the enemy core.'
    },
    {
      id: 'sports',
      category: 'Sports',
      emoji: '⚽',
      icon: <Award className="w-5 h-5 text-[#00E676]" />,
      bgImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800',
      color: '#00E676',
      games: ['FIFAe', 'eFootball', 'NBA 2K'],
      platforms: ['PS5', 'Xbox', 'PC', 'Mobile'],
      description: 'Simulated competitive field play. Control team formations and score historic tournament victories.'
    },
    {
      id: 'mobile',
      category: 'Mobile Exclusive',
      emoji: '📱',
      icon: <Smartphone className="w-5 h-5 text-[#FF2E93]" />,
      bgImage: 'https://images.unsplash.com/photo-1511649475106-3ab3d03d604e?q=80&w=800',
      color: '#FF2E93',
      games: ['PUBG Mobile', 'Free Fire', 'COD Mobile'],
      platforms: ['Android', 'iOS'],
      description: 'High-density, highly accessible competitive lobbies. Compete anytime, anywhere across active servers.'
    }
  ];

  return (
    <section className="w-full py-20 relative z-10 border-b border-white/5 bg-[#080B16]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">Esports Arena</span>
              <span className="text-[#A0A0AB] text-xs">///</span>
              <span className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest">Global Standards</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white mb-2">
              Game Ecosystem <span className="text-[#7B61FF]">Showcase</span>
            </h2>
            <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px]">
              Play on any game. Any platform. Discover localized tournaments, leaderboard ranks, and active professional rosters.
            </p>
          </div>

          {/* Quick tab filters for desktop */}
          <div className="flex flex-wrap gap-2 lg:bg-black/20 p-1.5 border border-white/5 rounded-xl">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all duration-300 ${
                  activeGenre === genre.id
                    ? 'bg-[#7B61FF] text-white shadow-[0_0_15px_rgba(123,97,255,0.4)] font-bold'
                    : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'
                }`}
              >
                {genre.emoji} {genre.category.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left panel: Selected Genre Card */}
          {(() => {
            const selected = genres.find(g => g.id === activeGenre) || genres[0];
            return (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-7 relative h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] group"
              >
                <img
                  src={selected.bgImage}
                  alt={selected.category}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }}></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg">
                      {selected.icon}
                      <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                        {selected.category}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {selected.platforms.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-white/5 text-[#A0A0AB] text-[9px] font-mono font-bold rounded uppercase tracking-wide">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-3">
                      {selected.category} <span className="text-[#00D4FF]">LEAGUES</span>
                    </h3>
                    <p className="text-sm font-body text-[#A0A0AB] mb-6 leading-relaxed w-full max-w-[600px] md:max-w-[800px]">
                      {selected.description}
                    </p>

                    <div className="flex flex-wrap gap-2.5 mb-8">
                      {selected.games.map(game => (
                        <span
                          key={game}
                          className="px-3 py-1.5 bg-[#7B61FF]/10 text-white font-mono text-[11px] uppercase tracking-wider rounded-lg border border-[#7B61FF]/30 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF]"></span>
                          {game}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/players?game=${selected.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B61FF] hover:bg-[#00D4FF] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-widest transition-all rounded shadow-[0_0_15px_rgba(123,97,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
                    >
                      Browse {selected.category} Players &rarr;
                    </Link>
                  </div>
                </div>

                {/* Corner futuristic decorations */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#7B61FF]/40 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#7B61FF]/40 rounded-bl-xl pointer-events-none"></div>
              </motion.div>
            );
          })()}

          {/* Right panel: Static Grid cards list of other genres */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
            {genres.map(genre => (
              <div
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  activeGenre === genre.id
                    ? 'bg-[#7B61FF]/10 border-[#7B61FF] shadow-[0_0_15px_rgba(123,97,255,0.2)]'
                    : 'bg-[#121B2A]/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl mb-3">{genre.emoji}</div>
                  <h4 className="font-display font-bold text-sm uppercase text-white tracking-tight group-hover:text-[#7B61FF] transition-colors">
                    {genre.category}
                  </h4>
                  <p className="text-[10px] font-mono text-[#A0A0AB] mt-1 truncate">
                    {genre.games.join(', ')}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[9px] font-mono text-gray-500">
                  <span>{genre.platforms.slice(0, 3).join('/')}</span>
                  <span className={`w-2 h-2 rounded-full ${activeGenre === genre.id ? 'bg-[#7B61FF] animate-pulse' : 'bg-transparent'}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
