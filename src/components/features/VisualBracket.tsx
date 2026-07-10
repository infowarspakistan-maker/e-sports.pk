import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Trophy, ZoomIn, ZoomOut, Maximize, Edit3, Check, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface Match {
  match: number;
  team1: string;
  score1: string;
  team2: string;
  score2: string;
}

interface BracketData {
  quarterFinals: Match[];
  semiFinals: Match[];
  grandFinal: {
    team1: string;
    score1: string;
    team2: string;
    score2: string;
  };
  champion: string;
}

const DEFAULT_BRACKET: BracketData = {
  quarterFinals: [
    { match: 1, team1: 'Thunder Hawks', score1: '2', team2: 'Portal Esports', score2: '1' },
    { match: 2, team1: 'Karachi Vipers', score1: '0', team2: 'Max Gaming', score2: '2' },
    { match: 3, team1: 'Salt Esports', score1: '2', team2: 'Zong Warriors', score2: '1' },
    { match: 4, team1: 'Red Line Clan', score1: '1', team2: 'BlackMamba', score2: '2' },
  ],
  semiFinals: [
    { match: 1, team1: 'Thunder Hawks', score1: '3', team2: 'Max Gaming', score2: '2' },
    { match: 2, team1: 'Salt Esports', score1: '1', team2: 'BlackMamba', score2: '3' },
  ],
  grandFinal: {
    team1: 'Thunder Hawks',
    score1: '3',
    team2: 'BlackMamba',
    score2: '2',
  },
  champion: 'Thunder Hawks'
};

interface VisualBracketProps {
  tournamentId?: string;
  isAdmin?: boolean;
}

export const VisualBracket: React.FC<VisualBracketProps> = ({ tournamentId = 'default', isAdmin = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Bracket state
  const [bracketData, setBracketData] = useState<BracketData>(DEFAULT_BRACKET);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync with Firestore in real-time
  useEffect(() => {
    if (!tournamentId) return;

    const docRef = doc(db, 'tournament_brackets', tournamentId);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bracket) {
          setBracketData(data.bracket as BracketData);
        }
      } else {
        // If no customized bracket exists, load defaults
        setBracketData(DEFAULT_BRACKET);
      }
    });

    return () => unsub();
  }, [tournamentId]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    setScale((prev) => Math.min(Math.max(0.5, prev + scaleAmount), 2));
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    // Prevent dragging if clicking inside input or button fields
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button')) {
      return;
    }
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

  // Admin Mutation Handlers
  const handleUpdateQF = (idx: number, field: keyof Match, value: string) => {
    const nextQFs = [...bracketData.quarterFinals];
    nextQFs[idx] = { ...nextQFs[idx], [field]: value };
    setBracketData(prev => ({ ...prev, quarterFinals: nextQFs }));
  };

  const handleUpdateSF = (idx: number, field: keyof Match, value: string) => {
    const nextSFs = [...bracketData.semiFinals];
    nextSFs[idx] = { ...nextSFs[idx], [field]: value };
    setBracketData(prev => ({ ...prev, semiFinals: nextSFs }));
  };

  const handleUpdateGF = (field: 'team1' | 'score1' | 'team2' | 'score2', value: string) => {
    setBracketData(prev => ({
      ...prev,
      grandFinal: { ...prev.grandFinal, [field]: value }
    }));
  };

  const handleUpdateChampion = (value: string) => {
    setBracketData(prev => ({ ...prev, champion: value }));
  };

  const handleSaveBracket = async () => {
    setSaveLoading(true);
    try {
      await setDoc(doc(db, 'tournament_brackets', tournamentId), {
        bracket: bracketData,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save bracket data:", err);
      alert("Error saving bracket to database.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[550px] overflow-hidden bg-[#050505] rounded-xl border border-white/5 cyber-grid-bg group" onMouseLeave={handleMouseUp}>
      
      {/* Top Banner indicating Admin Tools */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[9px] font-mono text-white uppercase tracking-wider backdrop-blur-md">
          {isEditing ? '/// BUILDER MODE ACTIVE' : '/// INTERACTIVE TOURNAMENT VIEW'}
        </span>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00D4FF]/20 hover:bg-[#00D4FF] border border-[#00D4FF]/30 text-black hover:text-black font-black font-mono text-[9px] uppercase tracking-wider transition-all"
          >
            <Edit3 className="w-3 h-3" /> Edit Bracket
          </button>
        )}
        {isEditing && (
          <div className="flex gap-1.5">
            <button
              onClick={handleSaveBracket}
              disabled={saveLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00E676] text-black font-black font-mono text-[9px] uppercase tracking-wider transition-all"
            >
              <Check className="w-3 h-3" /> {saveLoading ? 'Uploading...' : 'Save Bracket'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-white hover:text-black font-black font-mono text-[9px] uppercase tracking-wider transition-all"
            >
              <X className="w-3 h-3" /> Discard
            </button>
          </div>
        )}
      </div>

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
              {bracketData.quarterFinals.map((matchData, index) => (
                <div key={`qf-${matchData.match}`} className="w-56 flex flex-col bg-[#0A0A0A] border border-white/10 rounded-none overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)] cyber-angled-border hover:border-[#00D4FF]/50 transition-colors">
                  {/* Team 1 Row */}
                  <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors">
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.team1}
                        onChange={(e) => handleUpdateQF(index, 'team1', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white border-b border-white/20 focus:border-[#00D4FF] outline-none w-32"
                      />
                    ) : (
                      <span className="text-xs font-mono text-white truncate max-w-[130px]" title={matchData.team1}>
                        {matchData.team1}
                      </span>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.score1}
                        onChange={(e) => handleUpdateQF(index, 'score1', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-[#00D4FF] font-bold border-b border-[#00D4FF]/40 outline-none w-8 text-center"
                      />
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#00D4FF]">{matchData.score1}</span>
                    )}
                  </div>

                  {/* Team 2 Row */}
                  <div className="flex justify-between items-center px-4 py-2 opacity-80 hover:bg-white/5 transition-colors">
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.team2}
                        onChange={(e) => handleUpdateQF(index, 'team2', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white border-b border-white/20 focus:border-[#00D4FF] outline-none w-32"
                      />
                    ) : (
                      <span className="text-xs font-mono text-white truncate max-w-[130px]" title={matchData.team2}>
                        {matchData.team2}
                      </span>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.score2}
                        onChange={(e) => handleUpdateQF(index, 'score2', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white font-bold border-b border-white/20 focus:border-[#00D4FF] outline-none w-8 text-center"
                      />
                    ) : (
                      <span className="text-xs font-mono font-bold">{matchData.score2}</span>
                    )}
                  </div>
                  {/* Connector line out */}
                  <div className="absolute top-1/2 -right-8 w-8 border-b-2 border-white/20"></div>
                </div>
              ))}
            </div>

            {/* Semi Finals */}
            <div className="flex flex-col justify-around gap-24 relative">
              <div className="text-[10px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest text-center mb-4 absolute -top-12 w-full">Semi Finals</div>
              {bracketData.semiFinals.map((matchData, index) => (
                <div key={`sf-${matchData.match}`} className="w-56 flex flex-col bg-[#0A0A0A] border border-[#00D4FF]/30 rounded-none overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)] relative z-10 cyber-angled-border hover:border-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all">
                  {/* Connector line in (Vertical) */}
                  <div className="absolute -left-8 top-[-50%] h-[200%] border-l-2 border-white/20"></div>
                  {/* Connector line in (Horizontal) */}
                  <div className="absolute -left-8 top-1/2 w-8 border-b-2 border-white/20"></div>
                  
                  {/* Team 1 Row */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-[#00D4FF]/10 relative overflow-hidden group hover:bg-[#00D4FF]/20 transition-colors">
                    <div className="absolute inset-0 scanline-effect opacity-50"></div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.team1}
                        onChange={(e) => handleUpdateSF(index, 'team1', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white border-b border-white/20 focus:border-[#00D4FF] outline-none w-32 relative z-10"
                      />
                    ) : (
                      <span className="text-sm font-mono text-white font-bold relative z-10 truncate max-w-[130px]">{matchData.team1}</span>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.score1}
                        onChange={(e) => handleUpdateSF(index, 'score1', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-[#00D4FF] font-bold border-b border-[#00D4FF]/40 outline-none w-8 text-center relative z-10"
                      />
                    ) : (
                      <span className="text-sm font-mono font-bold text-[#00D4FF] relative z-10">{matchData.score1}</span>
                    )}
                  </div>

                  {/* Team 2 Row */}
                  <div className="flex justify-between items-center px-4 py-3 opacity-80 hover:bg-white/5 transition-colors">
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.team2}
                        onChange={(e) => handleUpdateSF(index, 'team2', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white border-b border-white/20 focus:border-[#00D4FF] outline-none w-32 relative z-10"
                      />
                    ) : (
                      <span className="text-sm font-mono text-white truncate max-w-[130px]">{matchData.team2}</span>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={matchData.score2}
                        onChange={(e) => handleUpdateSF(index, 'score2', e.target.value)}
                        className="bg-neutral-900 px-1 text-xs font-mono text-white font-bold border-b border-white/20 focus:border-[#00D4FF] outline-none w-8 text-center relative z-10"
                      />
                    ) : (
                      <span className="text-sm font-mono font-bold">{matchData.score2}</span>
                    )}
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
                
                {/* Team 1 Row */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 bg-[#7B61FF]/15 relative overflow-hidden group hover:bg-[#7B61FF]/25 transition-colors">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>
                  <div className="absolute inset-0 scanline-effect opacity-50"></div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={bracketData.grandFinal.team1}
                      onChange={(e) => handleUpdateGF('team1', e.target.value)}
                      className="bg-neutral-900 px-1.5 py-0.5 text-sm font-mono text-white border-b border-white/20 focus:border-[#7B61FF] outline-none w-36 relative z-10"
                    />
                  ) : (
                    <span className="text-base font-mono text-white font-black z-10 tracking-wider truncate max-w-[150px]">{bracketData.grandFinal.team1}</span>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      value={bracketData.grandFinal.score1}
                      onChange={(e) => handleUpdateGF('score1', e.target.value)}
                      className="bg-neutral-900 px-1 py-0.5 text-sm font-mono text-[#7B61FF] font-black border-b border-[#7B61FF]/40 outline-none w-8 text-center relative z-10"
                    />
                  ) : (
                    <span className="text-base font-mono font-black text-[#7B61FF] z-10 text-shadow-glow">{bracketData.grandFinal.score1}</span>
                  )}
                </div>

                {/* Team 2 Row */}
                <div className="flex justify-between items-center px-5 py-4 relative overflow-hidden hover:bg-white/5 transition-colors">
                  {isEditing ? (
                    <input
                      type="text"
                      value={bracketData.grandFinal.team2}
                      onChange={(e) => handleUpdateGF('team2', e.target.value)}
                      className="bg-neutral-900 px-1.5 py-0.5 text-sm font-mono text-white border-b border-white/20 focus:border-[#7B61FF] outline-none w-36 relative z-10"
                    />
                  ) : (
                    <span className="text-base font-mono text-white font-bold z-10 tracking-wider truncate max-w-[150px]">{bracketData.grandFinal.team2}</span>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      value={bracketData.grandFinal.score2}
                      onChange={(e) => handleUpdateGF('score2', e.target.value)}
                      className="bg-neutral-900 px-1 py-0.5 text-sm font-mono text-white font-bold border-b border-white/20 focus:border-[#7B61FF] outline-none w-8 text-center relative z-10"
                    />
                  ) : (
                    <span className="text-base font-mono font-bold text-gray-500 z-10">{bracketData.grandFinal.score2}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Winner Champion */}
            <div className="flex flex-col justify-center pl-8 relative">
              <div className="absolute -left-8 top-1/2 w-16 border-b-2 border-[#7B61FF] shadow-[0_0_10px_rgba(123,97,255,0.5)]"></div>
              <div className="animate-in zoom-in duration-1000 delay-500 fill-mode-both">
                <div className="text-[12px] font-mono text-[#FFD700] uppercase font-black tracking-widest text-center mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                  Champion
                </div>
                <div className="w-48 flex items-center justify-center bg-[#FFD700]/10 border-2 border-[#FFD700] rounded-none py-4 shadow-[0_0_30px_rgba(255,215,0,0.4)] cyber-angled-border hover:bg-[#FFD700]/20 hover:scale-105 transition-all">
                  {isEditing ? (
                    <input
                      type="text"
                      value={bracketData.champion}
                      onChange={(e) => handleUpdateChampion(e.target.value)}
                      className="bg-neutral-900 px-2 py-1 text-sm font-display font-black text-[#FFD700] border border-[#FFD700]/40 outline-none w-40 text-center uppercase tracking-wider"
                    />
                  ) : (
                    <span className="text-xl font-display font-black text-[#FFD700] uppercase italic tracking-tighter text-shadow-glow-gold">
                      {bracketData.champion}
                    </span>
                  )}
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
