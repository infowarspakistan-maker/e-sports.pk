import React, { useEffect, useState } from 'react';
import { Trophy, Tv, Calendar, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import { SUPPORTED_GAMES } from '../../lib/constants';

export const LiveMatchTicker = () => {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const q = query(
          collection(db, 'tournaments'),
          where('status', 'in', ['Upcoming', 'Registration Open', 'Ongoing']),
          limit(5)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length === 0) {
          // Fallback static matches for layout demo
          setMatches([
            { id: '1', title: 'National PUBG Championship', gameId: 'pubg-mobile', status: 'Ongoing', date: 'LIVE' },
            { id: '2', title: 'Tekken 8 Clash', gameId: 'tekken-8', status: 'Registration Open', date: 'Tomorrow' },
            { id: '3', title: 'CS2 Regional Finals', gameId: 'csgo', status: 'Upcoming', date: 'In 3 Days' }
          ]);
        } else {
          setMatches(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUpcoming();
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="w-full bg-[#0A0A0A] border-y border-white/10 flex items-center relative overflow-hidden z-20 h-12">
      <div className="bg-[#7B61FF] text-white px-4 md:px-6 py-3 font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 absolute left-0 z-10 h-full shadow-[10px_0_20px_rgba(10,10,10,0.9)]">
        <AlertCircle className="w-4 h-4 animate-pulse" />
        <span>Live & Upcoming</span>
      </div>
      
      {/* Marquee Animation */}
      <div className="flex-1 overflow-hidden ml-40 md:ml-48 h-full flex items-center">
        <div className="flex items-center gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[...matches, ...matches, ...matches, ...matches].map((m, i) => {
             const game = SUPPORTED_GAMES.find(g => g.id === m.gameId || m.game) || SUPPORTED_GAMES[0];
             const isLive = m.status === 'Ongoing' || m.date === 'LIVE';
             return (
               <Link key={i} to={`/tournaments`} className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-widest ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-300'}`}>
                   {isLive ? 'LIVE' : (m.date || m.status)}
                 </span>
                 <span className="text-white font-display text-sm font-bold flex items-center gap-2">
                   <span style={{color: game.color}}>{game.icon}</span> {m.title || m.name}
                 </span>
                 <span className="text-white/20 ml-2">•</span>
               </Link>
             );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
