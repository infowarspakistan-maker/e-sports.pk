import React from 'react';
import { Users } from 'lucide-react';

interface TeamCardProps {
  name: string;
  logo: string;
  game: string;
  isRecruiting: boolean;
}

export const TeamCard = ({ name, logo, game, isRecruiting }: TeamCardProps) => (
  <div className="bg-[#1A1A2E] border border-[#2A2A40] rounded-xl p-6 flex flex-col items-center text-center hover:border-[#7B61FF] transition-all duration-300">
    <img src={logo} alt={name} className="w-20 h-20 rounded-lg object-cover mb-4 border border-[#2A2A40]" />
    <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
    <p className="text-[#A0A0B8] text-sm mb-4">{game}</p>
    {isRecruiting && (
      <span className="bg-[#FF6B35]/20 text-[#FF6B35] text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-[#FF6B35]/50">
        Recruiting
      </span>
    )}
  </div>
);
