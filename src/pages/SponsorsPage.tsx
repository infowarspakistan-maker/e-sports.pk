import React, { useState } from 'react';
import { Briefcase, Search, Filter } from 'lucide-react';
import { SUPPORTED_GAMES } from '../lib/constants';

export const SponsorsPage = () => {
  const [selectedGame, setSelectedGame] = useState('all');

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
        <div>
          <h1 className="text-[22px] font-medium text-white tracking-tight">Sponsor Marketplace</h1>
          <p className="text-gray-300 mt-1">Discover brands actively looking to sponsor esports talent.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-full text-sm outline-none transition-all"
            placeholder="Search sponsors by industry or game..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Filters:</span>
        </div>
        <select 
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
        >
          <option value="all">Target Game: All</option>
          {SUPPORTED_GAMES.map(game => (
            <option key={game.id} value={game.id}>{game.icon} {game.name}</option>
          ))}
        </select>
        <select className="bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#1A73E8]">
          <option value="all">Any Budget</option>
          <option value="100k">₨100,000+</option>
          <option value="500k">₨500,000+</option>
          <option value="1m">₨1,000,000+</option>
        </select>
        <select className="bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#1A73E8]">
          <option value="all">Any Platform</option>
          <option value="pc">PC</option>
          <option value="mobile">Mobile</option>
          <option value="console">Console</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 1, name: 'Republic of Gamers', industry: 'Hardware', targetGames: ['Valorant', 'CS2', 'Dota 2'], budget: '₨500K/mo' },
          { id: 2, name: 'Zong 4G', industry: 'Telecommunications', targetGames: ['PUBG Mobile', 'Free Fire'], budget: '₨1M/mo' },
          { id: 3, name: 'Red Bull Pakistan', industry: 'Energy Drink', targetGames: ['Tekken 8', 'Street Fighter 6'], budget: '₨300K/mo' },
          { id: 4, name: 'Logitech G', industry: 'Peripherals', targetGames: ['All PC Games'], budget: '₨400K/mo' },
        ].map((s) => (
          <div key={s.id} className="bg-transparent border border-white/10 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-transparent border border-white/10 rounded-xl flex items-center justify-center font-bold text-[#1A73E8] text-xl">
                 {s.name.charAt(0)}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2] text-[11px] font-medium uppercase tracking-wide">
                Active Campaigns
              </span>
            </div>
            
            <h3 className="text-[18px] font-medium text-white mb-1">{s.name}</h3>
            <p className="text-[14px] text-gray-400 mb-4">{s.industry}</p>
            
            <p className="text-[14px] text-gray-300 mb-6 line-clamp-2">
              Looking to sponsor top-tier talent. Budget: {s.budget}. Apply now if your Sponsorship Score is &gt; 75.
            </p>
            
            <div className="mt-auto">
               <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Games</h4>
               <div className="flex flex-wrap gap-2 mb-6">
                 {s.targetGames.map(game => (
                    <span key={game} className="px-2 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">{game}</span>
                 ))}
               </div>
               
               <button className="w-full bg-[#1A73E8] hover:bg-[#1967D2] text-white text-sm font-medium py-2 rounded-full transition-colors shadow-sm">
                  Apply for Sponsorship
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
