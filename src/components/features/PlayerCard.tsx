import React from 'react';
import { Trophy, Award } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  game: string;
  rank: string;
  avatar: string;
  prizeWon: number;
}

export const PlayerCard = ({ name, game, rank, avatar, prizeWon }: PlayerCardProps) => (
  <div className="bg-[#1A1A2E] border border-[#2A2A40] rounded-xl overflow-hidden hover:border-[#00D4FF] transition-all duration-300 group">
    <div className="p-6 flex items-center gap-4">
      <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-[#2A2A40]" />
      <div>
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-[#A0A0B8] text-sm">{game} • {rank}</p>
      </div>
    </div>
    <div className="px-6 py-4 bg-[#0A0A0F] border-t border-[#2A2A40] flex justify-between items-center">
      <div className="flex items-center gap-2 text-[#00D4FF]">
        <Trophy className="w-4 h-4" />
        <span className="font-mono font-bold">₨ {prizeWon.toLocaleString()}</span>
      </div>
      <button className="text-xs font-bold uppercase tracking-widest text-[#A0A0B8] hover:text-white transition-colors">
        View Profile
      </button>
    </div>
  </div>
);
