import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';

interface TournamentCardProps {
  name: string;
  game: string;
  prizePool: number;
  date: string;
  banner: string;
}

export const TournamentCard = ({ name, game, prizePool, date, banner }: TournamentCardProps) => (
  <div className="bg-[#1A1A2E] border border-[#2A2A40] rounded-xl overflow-hidden hover:border-[#00D4FF] transition-all duration-300">
    <img src={banner} alt={name} className="w-full h-40 object-cover" />
    <div className="p-5">
      <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
      <p className="text-[#A0A0B8] text-sm mb-4">{game}</p>
      
      <div className="flex justify-between items-center text-sm text-[#A0A0B8]">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span className="font-mono">{date}</span>
        </div>
        <div className="flex items-center gap-1 text-[#00E676]">
          <DollarSign className="w-4 h-4" />
          <span className="font-mono font-bold">₨ {prizePool.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
);
