import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Gamepad2, Trophy, Briefcase, Newspaper, ArrowRight } from 'lucide-react';

interface NavCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  link: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
}

export const EcosystemNav: React.FC = () => {
  const cards: NavCard[] = [
    {
      id: 'players',
      title: 'For Players',
      subtitle: 'PLAYERS',
      description: 'Build your profile, track stats, upload highlights, and get discovered by major organizations.',
      cta: 'Join Now',
      link: '/register',
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'from-[#00D4FF]/10 to-transparent',
      borderColor: 'border-[#00D4FF]/30 hover:border-[#00D4FF]',
      glowColor: 'shadow-[#00D4FF]/20',
    },
    {
      id: 'teams',
      title: 'For Teams',
      subtitle: 'TEAMS',
      description: 'Find top tier talent, manage your roster, review tournament analytics, and recruit the next champion.',
      cta: 'Start Recruiting',
      link: '/recruitment',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-[#7B61FF]/10 to-transparent',
      borderColor: 'border-[#7B61FF]/30 hover:border-[#7B61FF]',
      glowColor: 'shadow-[#7B61FF]/20',
    },
    {
      id: 'sponsors',
      title: 'For Sponsors',
      subtitle: 'SPONSOR',
      description: 'Discover Pakistan\'s elite talent pools, sponsor premier tournaments, and measure true esports ROI.',
      cta: 'Become a Sponsor',
      link: '/sponsors',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-[#FFD700]/10 to-transparent',
      borderColor: 'border-[#FFD700]/30 hover:border-[#FFD700]',
      glowColor: 'shadow-[#FFD700]/20',
    },
    {
      id: 'news',
      title: 'News & Updates',
      subtitle: 'NEWS',
      description: 'Stay ahead of the game with breaking news, transfer intel, schedules, and national tournament coverage.',
      cta: 'Read More',
      link: '/news',
      icon: <Newspaper className="w-6 h-6" />,
      color: 'from-[#FF4444]/10 to-transparent',
      borderColor: 'border-[#FF4444]/30 hover:border-[#FF4444]',
      glowColor: 'shadow-[#FF4444]/20',
    }
  ];

  return (
    <section className="w-full py-16 relative z-10 bg-[#060913]/30 border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
            <span className="text-[10px] font-mono font-black text-[#A0A0AB] uppercase tracking-[0.3em]">Choose Your Pathway</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
            Role-Based <span className="text-[#00D4FF]">Gateway</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden bg-gradient-to-b ${card.color} border ${card.borderColor} rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:${card.glowColor} hover:shadow-[0_0_25px_currentColor]`}
            >
              {/* Scanline pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-20 pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[#00D4FF] group-hover:text-white transition-colors duration-300">
                    {card.icon}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-[#A0A0AB] uppercase tracking-[0.3em] bg-white/5 px-2.5 py-1 rounded">
                    {card.subtitle}
                  </span>
                </div>

                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white mb-2 group-hover:text-[#00D4FF] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm font-body text-[#A0A0AB] group-hover:text-white/95 transition-all leading-relaxed line-clamp-3">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-[#00D4FF] group-hover:text-white transition-all"
                >
                  {card.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
