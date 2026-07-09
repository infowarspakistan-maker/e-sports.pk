import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, ChevronRight, Gamepad2, ArrowUpRight } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  winRate: string;
  color: string;
  tier: string;
}

export const RankingsSneakPeek: React.FC = () => {
  const entries: LeaderboardEntry[] = [
    { rank: 1, name: 'Ahmad Khan', points: 2847, winRate: '79.3%', color: 'from-[#FFD700]/20 to-transparent', tier: 'GOD_OF_DESTRUCTION' },
    { rank: 2, name: 'Sara Malik', points: 2643, winRate: '76.1%', color: 'from-[#C0C0C0]/10 to-transparent', tier: 'TEKKEN_KING' },
    { rank: 3, name: 'Zain Ali', points: 2412, winRate: '72.8%', color: 'from-[#CD7F32]/10 to-transparent', tier: 'BUSHIN' },
    { rank: 4, name: 'Usman Raza', points: 2198, winRate: '68.5%', color: 'from-white/5 to-transparent', tier: 'KISHIN' },
    { rank: 5, name: 'Fatima Noor', points: 1954, winRate: '65.2%', color: 'from-white/5 to-transparent', tier: 'FUJIN' },
  ];

  return (
    <section className="w-full py-20 relative z-10 border-b border-white/5 bg-[#080B14]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Description Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#FFD700]" />
              <span className="text-[10px] font-mono font-black text-[#A0A0AB] uppercase tracking-[0.3em]">LADDER RANKINGS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white mb-4">
              Rankings <span className="text-[#00D4FF]">Sneak Peek</span>
            </h2>
            <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px] text-sm leading-relaxed mb-6">
              Track the leading esports athletes competing on local servers. Our automated ladder counts verified match wins, bracket point structures, and round survival rates.
            </p>

            <div className="bg-[#121B2A]/50 border border-white/5 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-5 h-5 text-[#00D4FF]" />
                <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">Most Active Game: Tekken 8</span>
              </div>
              <p className="text-xs text-[#A0A0AB]">
                Pakistan boasts the world's most competitive Tekken offline and online networks, backed by historical EVO victories.
              </p>
            </div>

            <Link
              to="/rankings"
              className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors"
            >
              View Full Leaderboards <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right Leaderboards Table Column */}
          <div className="lg:col-span-7">
            <div className="premium-gaming-card cyber-angled-border border border-white/10 bg-[#0B111F]/90 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/5 to-transparent pointer-events-none"></div>

              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span> Top Tekken 8 Players
                </h3>
                <span className="font-mono text-[9px] text-[#A0A0AB] tracking-widest bg-white/5 px-2 py-0.5 rounded">
                  UPDATED 2H AGO
                </span>
              </div>

              {/* Table Body */}
              <div className="space-y-3">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.rank}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className={`relative p-3.5 rounded-xl border border-white/5 bg-gradient-to-r ${entry.color} flex items-center justify-between transition-colors hover:border-[#00D4FF]/30 group`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Indicator */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border ${
                        entry.rank === 1 ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/10' :
                        entry.rank === 2 ? 'border-[#C0C0C0] text-[#C0C0C0] bg-[#C0C0C0]/10' :
                        entry.rank === 3 ? 'border-[#CD7F32] text-[#CD7F32] bg-[#CD7F32]/10' :
                        'border-white/10 text-[#A0A0AB] bg-black/30'
                      }`}>
                        {entry.rank}
                      </div>

                      <div>
                        <span className="font-display font-bold text-sm text-white group-hover:text-[#00D4FF] transition-colors">
                          {entry.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span className="text-[9px] font-mono font-black text-[#A0A0AB] uppercase tracking-tighter">
                            {entry.tier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <span className="text-[9px] font-mono text-[#A0A0AB] uppercase tracking-widest block">Points</span>
                        <span className="font-mono text-sm font-black text-white">{entry.points.toLocaleString()}</span>
                      </div>
                      <div className="w-20">
                        <span className="text-[9px] font-mono text-[#A0A0AB] uppercase tracking-widest block">Win Rate</span>
                        <span className="font-mono text-sm font-black text-green-400">{entry.winRate}</span>
                      </div>
                      <div className="text-gray-600 group-hover:text-[#00D4FF] transition-colors pl-2">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
