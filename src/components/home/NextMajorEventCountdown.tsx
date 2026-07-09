import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trophy, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NextMajorEventCountdown = () => {
  const [event, setEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const q = query(
          collection(db, 'tournaments'),
          where('status', 'in', ['Upcoming', 'Registration Open']),
          orderBy('startDate', 'asc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setEvent({ id: doc.id, ...doc.data() });
        } else {
          // Fallback if no real events
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 14);
          futureDate.setHours(18, 0, 0, 0);
          setEvent({
            id: 'fallback-1',
            title: 'Pakistan National Championship 2026',
            prizePool: '1,000,000 PKR',
            startDate: futureDate.toISOString()
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvent();
  }, []);

  useEffect(() => {
    if (!event || !event.startDate) return;

    const target = new Date(event.startDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  return (
    <section className="w-full py-16 bg-black relative border-y border-white/5 overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#7B61FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-6 md:px-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        
        <div className="flex-1 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
             <Trophy className="w-4 h-4 text-[#FFD700]" />
             <span className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-widest">Next Major Event</span>
           </div>
           <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic mb-4">
             {event.title || event.name}
           </h2>
           {event.prizePool && (
             <p className="text-xl text-[#00D4FF] font-mono font-bold">Prize Pool: {event.prizePool}</p>
           )}
        </div>

        <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#121B2A] border border-[#7B61FF]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.2)]">
                <span className="text-3xl md:text-4xl font-display font-black text-white">{timeLeft.days}</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-2">Days</span>
            </div>
            <div className="text-2xl font-bold text-white/30 pt-4 md:pt-5">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#121B2A] border border-[#7B61FF]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.2)]">
                <span className="text-3xl md:text-4xl font-display font-black text-white">{timeLeft.hours}</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-2">Hours</span>
            </div>
            <div className="text-2xl font-bold text-white/30 pt-4 md:pt-5">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#121B2A] border border-[#7B61FF]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.2)]">
                <span className="text-3xl md:text-4xl font-display font-black text-white">{timeLeft.minutes}</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-2">Mins</span>
            </div>
            <div className="text-2xl font-bold text-white/30 pt-4 md:pt-5">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#121B2A] border border-[#7B61FF]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.2)]">
                <span className="text-3xl md:text-4xl font-display font-black text-[#00D4FF]">{timeLeft.seconds}</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-2">Secs</span>
            </div>
          </div>
          
          <Link to={`/tournaments/${event.id}`} className="group flex items-center gap-2 bg-[#7B61FF] text-white px-6 py-3 rounded text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            Tournament Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
