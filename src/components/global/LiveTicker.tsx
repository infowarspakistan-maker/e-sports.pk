import React from 'react';

export const LiveTicker = () => {
  const matches = [
    { team1: 'Thunder Esports', team2: 'Neon Syndicate', score: '2 - 1', status: 'LIVE', game: 'Valorant' },
    { team1: 'Karachi Kings', team2: 'Lahore Lions', score: '0 - 0', status: 'UPCOMING', game: 'Tekken 8' },
    { team1: 'Quetta Gladiators', team2: 'Islamabad United', score: '3 - 0', status: 'FINAL', game: 'CS2' },
    { team1: 'Peshawar Zalmi', team2: 'Multan Sultans', score: '1 - 1', status: 'LIVE', game: 'Dota 2' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-[#00D4FF] text-black overflow-hidden h-8 flex items-center z-[60]">
      <div className="absolute left-0 top-0 bottom-0 bg-black text-[#00D4FF] px-4 font-mono text-[10px] font-black uppercase tracking-widest flex items-center z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        Live Updates
      </div>
      
      <div className="flex whitespace-nowrap animate-marquee">
        {matches.map((match, i) => (
          <div key={i} className="inline-flex items-center mx-6 font-mono text-[10px] uppercase font-bold tracking-widest">
            <span className={`px-2 py-0.5 rounded mr-3 text-white ${match.status === 'LIVE' ? 'bg-red-500 animate-pulse' : match.status === 'FINAL' ? 'bg-black' : 'bg-gray-600'}`}>
              {match.status}
            </span>
            <span className="text-black">{match.team1}</span>
            <span className="mx-3 font-black text-white px-2 py-0.5 bg-black/20 rounded">{match.score}</span>
            <span className="text-black">{match.team2}</span>
            <span className="ml-3 text-black/50 text-[8px] border border-black/20 px-1 rounded">{match.game}</span>
          </div>
        ))}
        {matches.map((match, i) => (
          <div key={`clone-${i}`} className="inline-flex items-center mx-6 font-mono text-[10px] uppercase font-bold tracking-widest">
            <span className={`px-2 py-0.5 rounded mr-3 text-white ${match.status === 'LIVE' ? 'bg-red-500 animate-pulse' : match.status === 'FINAL' ? 'bg-black' : 'bg-gray-600'}`}>
              {match.status}
            </span>
            <span className="text-black">{match.team1}</span>
            <span className="mx-3 font-black text-white px-2 py-0.5 bg-black/20 rounded">{match.score}</span>
            <span className="text-black">{match.team2}</span>
            <span className="ml-3 text-black/50 text-[8px] border border-black/20 px-1 rounded">{match.game}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
