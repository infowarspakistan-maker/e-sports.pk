import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Trophy, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export const VisualBracket = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    setScale((prev) => Math.min(Math.max(0.5, prev + scaleAmount), 2));
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel as any, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel as any);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-[#050505] rounded-xl border border-white/5 cyber-grid-bg group" onMouseLeave={handleMouseUp}>
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setScale(s => Math.min(2, s + 0.2))} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded backdrop-blur-sm transition-colors border border-white/10">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded backdrop-blur-sm transition-colors border border-white/10">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={resetView} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded backdrop-blur-sm transition-colors border border-white/10">
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="origin-center transition-transform duration-75"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            width: 'max-content',
            padding: '4rem 8rem'
          }}
        >
          <div className="flex gap-16 md:gap-24 items-center">
            {/* Quarter Finals */}
            <div className="flex flex-col justify-around gap-12">
              <div className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-widest text-center mb-4">Quarter Finals</div>
              {[1, 2, 3, 4].map((match) => (
                <div key={`qf-${match}`} className="w-56 flex flex-col bg-[#0A0A0A] border border-white/10 rounded-none overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)] cyber-angled-border hover:border-[#00D4FF]/50 transition-colors">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <span className="text-xs font-mono text-white">Team {match * 2 - 1}</span>
                    <span className="text-xs font-mono font-bold text-[#00D4FF]">2</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 opacity-60 hover:bg-white/5 transition-colors">
                    <span className="text-xs font-mono text-white">Team {match * 2}</span>
                    <span className="text-xs font-mono font-bold">1</span>
                  </div>
                  {/* Connector line out */}
                  <div className="absolute top-1/2 -right-8 w-8 border-b-2 border-white/20"></div>
                </div>
              ))}
            </div>

            {/* Semi Finals */}
            <div className="flex flex-col justify-around gap-24 relative">
              <div className="text-[10px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest text-center mb-4 absolute -top-12 w-full">Semi Finals</div>
              {[1, 2].map((match) => (
                <div key={`sf-${match}`} className="w-56 flex flex-col bg-[#0A0A0A] border border-[#00D4FF]/30 rounded-none overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)] relative z-10 cyber-angled-border hover:border-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all">
                  {/* Connector line in (Vertical) */}
                  <div className="absolute -left-8 top-[-50%] h-[200%] border-l-2 border-white/20"></div>
                  {/* Connector line in (Horizontal) */}
                  <div className="absolute -left-8 top-1/2 w-8 border-b-2 border-white/20"></div>
                  
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-[#00D4FF]/10 relative overflow-hidden group hover:bg-[#00D4FF]/20 transition-colors">
                    <div className="absolute inset-0 scanline-effect opacity-50"></div>
                    <span className="text-sm font-mono text-white font-bold relative z-10">Team {match === 1 ? '1' : '5'}</span>
                    <span className="text-sm font-mono font-bold text-[#00D4FF] relative z-10">3</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 opacity-60 hover:bg-white/5 transition-colors">
                    <span className="text-sm font-mono text-white">Team {match === 1 ? '3' : '7'}</span>
                    <span className="text-sm font-mono font-bold">0</span>
                  </div>
                  
                  {/* Connector line out */}
                  <div className="absolute top-1/2 -right-8 w-8 border-b-2 border-[#00D4FF]/50"></div>
                </div>
              ))}
            </div>

            {/* Grand Final */}
            <div className="flex flex-col justify-center relative">
              <div className="text-[12px] font-mono text-[#7B61FF] uppercase font-black tracking-widest text-center mb-4 absolute -top-12 w-full flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(123,97,255,0.5)]">
                <Trophy className="w-4 h-4" /> Grand Final
              </div>
              <div className="w-64 flex flex-col bg-[#050505] border-2 border-[#7B61FF] rounded-none overflow-hidden shadow-[0_0_30px_rgba(123,97,255,0.2)] relative z-10 cyber-angled-border hover:shadow-[0_0_40px_rgba(123,97,255,0.4)] transition-shadow">
                {/* Connector line in (Vertical) */}
                <div className="absolute -left-8 top-[-100%] h-[300%] border-l-2 border-[#00D4FF]/50"></div>
                {/* Connector line in (Horizontal) */}
                <div className="absolute -left-8 top-1/2 w-8 border-b-2 border-[#00D4FF]/50"></div>
                
                <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 bg-[#7B61FF]/15 relative overflow-hidden group hover:bg-[#7B61FF]/25 transition-colors">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>
                  <div className="absolute inset-0 scanline-effect opacity-50"></div>
                  <span className="text-base font-mono text-white font-black z-10 tracking-wider">Team 1</span>
                  <span className="text-base font-mono font-black text-[#7B61FF] z-10 text-shadow-glow">3</span>
                </div>
                <div className="flex justify-between items-center px-5 py-4 relative overflow-hidden hover:bg-white/5 transition-colors">
                  <span className="text-base font-mono text-white font-bold z-10 tracking-wider">Team 5</span>
                  <span className="text-base font-mono font-bold text-gray-500 z-10">2</span>
                </div>
              </div>
            </div>
            
            {/* Winner */}
            <div className="flex flex-col justify-center pl-8 relative">
              <div className="absolute -left-8 top-1/2 w-16 border-b-2 border-[#7B61FF] shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
              <div className="animate-in zoom-in duration-1000 delay-500 fill-mode-both">
                <div className="text-[12px] font-mono text-[#FFD700] uppercase font-black tracking-widest text-center mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                  Champion
                </div>
                <div className="w-48 flex items-center justify-center bg-[#FFD700]/10 border-2 border-[#FFD700] rounded-none py-4 shadow-[0_0_30px_rgba(255,215,0,0.4)] cyber-angled-border hover:bg-[#FFD700]/20 hover:scale-105 transition-all">
                  <span className="text-xl font-display font-black text-[#FFD700] uppercase italic tracking-tighter text-shadow-glow-gold">
                    Team 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .cyber-grid-bg {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .cyber-angled-border {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .scanline-effect {
          background: linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.05) 51%, transparent 51%);
          background-size: 100% 4px;
          animation: scanline 10s linear infinite;
        }
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        .text-shadow-glow {
          text-shadow: 0 0 10px currentColor;
        }
        .text-shadow-glow-gold {
          text-shadow: 0 0 15px rgba(255,215,0,0.6);
        }
      `}</style>
    </div>
  );
};
