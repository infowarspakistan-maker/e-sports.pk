import React, { useState } from 'react';
import { Search as SearchIcon, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const SearchPage = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-6 uppercase tracking-tight">
          Universal <span className="text-[#00D4FF]">Search</span>
        </h1>
        <div className="relative max-w-3xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for players, teams, tournaments, or news..." 
            className="w-full bg-[#121B2A]/70 backdrop-blur-md border border-[#2A2A35] rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:outline-none focus:border-[#00D4FF] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-gaming-card p-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#A0A0AB] mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            <div className="space-y-3">
              {['All Results', 'Players', 'Teams', 'Tournaments', 'News'].map((filter) => (
                <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#2A2A35] bg-transparent text-[#00D4FF] focus:ring-[#00D4FF]" defaultChecked={filter === 'All Results'} />
                  <span className="text-sm text-[#A0A0AB] group-hover:text-white transition-colors">{filter}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {query ? (
            <div className="space-y-4">
              <p className="text-[#A0A0AB] font-mono text-sm uppercase tracking-widest">Results for "{query}"</p>
              <div className="p-12 border border-dashed border-[#2A2A35] rounded-xl text-center">
                <p className="text-[#A0A0AB]">No results found matching your search criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="premium-gaming-card p-8 flex flex-col justify-between group cursor-pointer hover:border-[#00D4FF] transition-all">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">Trending Players</h3>
                  <p className="text-sm text-[#A0A0AB]">Discover top-rated talent from Pakistan's esports scene.</p>
                </div>
                <div className="mt-6 flex items-center text-[#00D4FF] font-mono text-xs uppercase tracking-widest gap-2">
                  View Directory <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="premium-gaming-card p-8 flex flex-col justify-between group cursor-pointer hover:border-[#7B61FF] transition-all">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tight">Active Tournaments</h3>
                  <p className="text-sm text-[#A0A0AB]">Register now for upcoming qualifiers and championships.</p>
                </div>
                <div className="mt-6 flex items-center text-[#7B61FF] font-mono text-xs uppercase tracking-widest gap-2">
                  View Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
