import React from 'react';
import { motion } from 'motion/react';
import { Shield, Cpu, Tag } from 'lucide-react';

export const BrandTrustBar: React.FC = () => {
  const games = ['Tekken', 'PUBG Mobile', 'Free Fire', 'COD', 'Dota 2', 'FIFAe'];
  const hardware = ['ASUS', 'MSI', 'Razer', 'HyperX', 'Sony', 'Logitech'];
  const sponsors = ['Zong', 'Jazz', 'TCL', 'realme'];

  return (
    <section className="w-full py-12 relative z-10 border-b border-white/5 bg-[#05070f]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="text-center mb-8">
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.3em] block mb-2">PROUDLY SUPPORTED BY</span>
          <div className="h-[1px] w-16 bg-[#00D4FF]/40 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Games Category */}
          <div className="bg-[#121B2A]/20 border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4 text-[#00D4FF]">
              <Shield className="w-4 h-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">OFFICIAL GAMES</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {games.map(game => (
                <span
                  key={game}
                  className="px-3 py-1.5 bg-white/5 text-[#A0A0AB] hover:text-white hover:bg-white/10 font-mono text-xs font-bold rounded transition-colors border border-white/5 cursor-default"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>

          {/* Hardware Category */}
          <div className="bg-[#121B2A]/20 border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4 text-[#7B61FF]">
              <Cpu className="w-4 h-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">HARDWARE PARTNERS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hardware.map(item => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-white/5 text-[#A0A0AB] hover:text-[#7B61FF] hover:bg-[#7B61FF]/10 font-mono text-xs font-bold rounded transition-colors border border-white/5 cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Sponsors Category */}
          <div className="bg-[#121B2A]/20 border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4 text-[#FFD700]">
              <Tag className="w-4 h-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">TELECOM & TECH SPONSORS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sponsors.map(sponsor => (
                <span
                  key={sponsor}
                  className="px-3 py-1.5 bg-white/5 text-[#A0A0AB] hover:text-[#FFD700] hover:bg-[#FFD700]/10 font-mono text-xs font-bold rounded transition-colors border border-white/5 cursor-default"
                >
                  {sponsor}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
