import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Vote, Award, ArrowRight, MessageSquare } from 'lucide-react';

interface HubCard {
  id: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

export const CommunityHub: React.FC = () => {
  const cards: HubCard[] = [
    {
      id: 'clips',
      title: 'Share Your Clips',
      description: 'Upload rank proofs, epic gameplay clutches, hilarious moments, and premium video highlights.',
      cta: 'Upload Now',
      link: '/community',
      icon: <Camera className="w-5 h-5 text-[#00D4FF]" />,
      color: 'from-[#00D4FF]/10 to-transparent',
      borderColor: 'border-[#00D4FF]/20 hover:border-[#00D4FF]'
    },
    {
      id: 'features',
      title: 'Suggest Features',
      description: 'Request new features, upvote community submissions, and discuss platform updates directly with admins.',
      cta: 'Suggest & Vote',
      link: '/community',
      icon: <Vote className="w-5 h-5 text-[#7B61FF]" />,
      color: 'from-[#7B61FF]/10 to-transparent',
      borderColor: 'border-[#7B61FF]/20 hover:border-[#7B61FF]'
    },
    {
      id: 'wins',
      title: 'Showcase Your Wins',
      description: 'Display your official podium finishes, active team stats, tournament trophies, and medals.',
      cta: 'Share Victories',
      link: '/community',
      icon: <Award className="w-5 h-5 text-[#FFD700]" />,
      color: 'from-[#FFD700]/10 to-transparent',
      borderColor: 'border-[#FFD700]/20 hover:border-[#FFD700]'
    }
  ];

  return (
    <section className="w-full py-20 relative z-10 border-b border-white/5 bg-[#070913]/20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="text-center md:text-left mb-12">
          <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
            <MessageSquare className="w-5 h-5 text-[#00D4FF]" />
            <span className="text-[10px] font-mono font-black text-[#A0A0AB] uppercase tracking-[0.3em]">COMMUNITY HUB</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white mb-2">
            Join the <span className="text-[#00D4FF]">Conversation</span>
          </h2>
          <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px] text-sm leading-relaxed">
            Connect with thousands of active Pakistani gamers. Share media highlights, voting polls, and platform suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`group bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-2xl p-6 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/10 -z-10"></div>

              <div>
                <div className="flex justify-between items-center mb-5">
                  <div className="w-10 h-10 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <span className="font-mono text-[8px] text-[#A0A0AB] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                    INTERACT
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg uppercase text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-body text-[#A0A0AB] group-hover:text-white/80 transition-colors leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase text-[#00D4FF] tracking-wider group-hover:text-white transition-colors"
                >
                  {card.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
