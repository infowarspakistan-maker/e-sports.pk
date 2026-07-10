import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Trophy, MapPin, Twitch, MessageSquare, Gamepad2, RotateCw, ExternalLink, Star, X, CheckCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthContext } from '../global/AuthProvider';

interface SkillStats {
  str: number;
  spd: number;
  pmk: number;
  phy: number;
  def: number;
  clu: number;
}

interface PlayerStats {
  gameId: string;
  gameName: string;
  rank: string;
  matchesPlayed: number;
  winRate: number;
  prizeWon: number;
}

interface EsportsPlayerCardProps {
  player: {
    id: string;
    name: string;
    game: string;
    teamName: string;
    avatarUrl: string;
    bannerUrl: string;
    availability: string;
    city: string;
    countryCode?: string; // e.g. 'PK'
    rating?: number; // Overall rating
    skillStats?: SkillStats;
    twitch?: string;
    discord?: string;
    steam?: string;
    gamesList?: PlayerStats[];
  };
  onViewProfile?: () => void;
  onCompareToggle?: () => void;
  isCompareSelected?: boolean;
}

export const EsportsPlayerCard: React.FC<EsportsPlayerCardProps> = ({ player, onViewProfile, onCompareToggle, isCompareSelected }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuthContext();
  
  // Tryout Form State
  const [showTryoutForm, setShowTryoutForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [discordHandle, setDiscordHandle] = useState('');
  const [position, setPosition] = useState('Starter');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleTryoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !discordHandle) {
      setSubmitError('Please fill out team name and contact info.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'tryout_applications'), {
        playerId: player.id,
        playerName: player.name,
        targetTeam: teamName,
        discordHandle,
        position,
        details,
        applicantEmail: user?.email || 'Anonymous',
        userId: user?.uid || 'Anonymous',
        type: 'player_invite', // Distinguish between team application and player invite
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowTryoutForm(false);
        setSubmitSuccess(false);
        setTeamName('');
        setDiscordHandle('');
        setDetails('');
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting tryout invite:", err);
      setSubmitError('Failed to send invite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const rating = player.rating || 85;
  const stats = player.skillStats || {
    str: 80,
    spd: 85,
    pmk: 75,
    phy: 82,
    def: 78,
    clu: 90,
  };

  const gamesList = player.gamesList && player.gamesList.length > 0
    ? player.gamesList
    : [
        {
          gameId: player.game.toLowerCase().replace(/\s+/g, '-'),
          gameName: player.game,
          rank: 'Pro Competitor',
          matchesPlayed: 142,
          winRate: 64,
          prizeWon: 3500
        }
      ];

  const handleCardClick = (e: React.MouseEvent) => {
    // If we click on an interactive element (buttons, links, or anything with stop-propagation), do not flip
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-[320px] aspect-[1/1.48] cursor-pointer group select-none relative transition-all duration-700 ease-out hover:scale-[1.15] hover:z-50 hover:shadow-[0_35px_70px_rgba(0,212,255,0.35)]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleCardClick}
    >
      <motion.div
        className="w-full h-full transform-style-3d relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        
        {/* ==================== FRONT OF THE CARD ==================== */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-[#050505] rounded-[24px] border border-white/10 group-hover:border-[#00D4FF]/40 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all duration-500 flex flex-col justify-between">
          
          {/* Compare Selector Checkbox */}
          {onCompareToggle && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 stop-propagation">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareToggle();
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider transition-all duration-300 ${
                  isCompareSelected
                    ? 'bg-[#00D4FF] text-black border-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.5)]'
                    : 'bg-black/70 text-white/50 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${isCompareSelected ? 'bg-black animate-pulse' : 'bg-white/30'}`}></span>
                {isCompareSelected ? 'SELECTED' : 'COMPARE'}
              </button>
            </div>
          )}

          {/* Dynamic Background Glow based on rating */}
          <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0 blur-3xl ${
            rating >= 90 ? 'bg-[#FFD700]' : rating >= 80 ? 'bg-[#00D4FF]' : 'bg-[#7B61FF]'
          }`}></div>

          {/* Holographic Sweep Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none z-30">
            <div className="absolute -inset-[100%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.2)_90deg,transparent_180deg,rgba(123,97,255,0.2)_270deg,transparent_360deg)]"></div>
          </div>

          {/* Futuristic Grid Layer */}
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none z-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}></div>

          {/* TOP HEADER SECTION */}
          <div className="relative h-[65%] w-full overflow-hidden">
            
            {/* Rating Hexagon Badge */}
            <div className="absolute top-6 left-6 z-40">
               <div className="relative flex flex-col items-center justify-center w-14 h-16">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-2 border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.5)] rotate-45 rounded-lg group-hover:rotate-[225deg] transition-transform duration-700"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl font-display font-black text-white leading-none">{rating}</span>
                    <span className="text-[7px] font-mono font-black text-[#00D4FF] uppercase tracking-tighter">OVR</span>
                  </div>
               </div>
            </div>

            {/* Action Status Ribbon */}
            <div className="absolute top-6 right-0 z-40">
               <div className={`pl-4 pr-6 py-1.5 rounded-l-full text-[8px] font-mono font-bold uppercase tracking-[0.2em] border-y border-l backdrop-blur-xl shadow-2xl ${
                 player.availability === 'Lft' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 
                 player.availability === 'Signed' ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40' :
                 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40'
               }`}>
                 {player.availability === 'Lft' ? '/// LFT' : `/// ${player.availability}`}
               </div>
            </div>

            {/* Flag & Team Logo Floating Stack */}
            <div className="absolute bottom-6 left-6 z-40 flex flex-col gap-3">
              <div className="p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-xl group-hover:translate-x-2 transition-transform duration-500">
                <img 
                  src={`https://flagcdn.com/w40/${(player.countryCode || 'pk').toLowerCase()}.png`} 
                  alt="Flag" 
                  className="w-8 h-5.5 object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:translate-x-2 transition-transform duration-500 delay-75">
                <Shield className="w-5 h-5 text-[#00D4FF]" />
              </div>
            </div>

            {/* Flip Indicator Tag */}
            <div className="absolute bottom-6 right-6 z-40 stop-propagation">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="w-8 h-8 bg-black/70 hover:bg-black/90 border border-white/10 hover:border-[#00D4FF] text-white/50 hover:text-[#00D4FF] rounded-full flex items-center justify-center transition-all shadow-md"
                title="Flip to back"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Portrait Backdrop Art */}
            <div className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              />
              
              {/* Cyberpunk Glitch Overlays */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none mix-blend-screen transition-opacity duration-500">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#FF0080]/20 via-transparent to-[#00D4FF]/20"></div>
              </div>
            </div>
          </div>

          {/* CORE INFO & STATS PANELS */}
          <div className="relative h-[35%] bg-black flex flex-col z-20 px-6 py-4">
            
            {/* Dynamic Name Header */}
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[8px] font-mono font-bold text-[#00D4FF] uppercase tracking-[0.3em]">Professional Talent</div>
                  <div className="flex items-center gap-1">
                    {player.twitch && <Twitch className="w-2.5 h-2.5 text-[#9146FF]" />}
                    {player.discord && <MessageSquare className="w-2.5 h-2.5 text-[#5865F2]" />}
                    {player.steam && <Gamepad2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
                <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none group-hover:tracking-normal transition-all duration-500">
                  {player.name}
                </h3>
              </div>
              <div className="text-[10px] font-mono font-black text-white/30 uppercase tracking-[0.2em] italic mb-1">{player.game}</div>
            </div>

            {/* Stats Grid - RPG Style */}
            <div className="grid grid-cols-3 gap-4 mb-5 border-y border-white/5 py-3">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Reflex</span>
                <span className="text-xl font-display font-black text-white italic leading-none">{stats.spd}</span>
              </div>
              <div className="flex flex-col items-center border-x border-white/5">
                <span className="text-[7px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Tactics</span>
                <span className="text-xl font-display font-black text-white italic leading-none">{stats.pmk}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Clutch</span>
                <span className="text-xl font-display font-black text-white italic leading-none">{stats.clu}</span>
              </div>
            </div>

            {/* Team & Identity Footer */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></div>
                 <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">{player.teamName || 'UNSIGNED_GUILD'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#7B61FF]" />
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest italic">{player.city}</span>
              </div>
            </div>
          </div>

          {/* Decorative Card Elements */}
          <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-[24px] pointer-events-none z-50"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#00D4FF]/20 rounded-br-xl pointer-events-none z-50"></div>
          
          {/* Prism Refraction Overlay */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent skew-x-[-35deg] group-hover:left-[150%] transition-all duration-1000 ease-out z-50"></div>
        </div>

        {/* ==================== BACK OF THE CARD ==================== */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-[#070B19] rounded-[24px] border-2 border-[#00D4FF]/30 group-hover:border-[#00D4FF]/60 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.25)] transition-all duration-500 flex flex-col justify-between rotate-y-180 p-5 font-mono text-white">
          
          {/* Tech/Hologram Accent Glow */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-2xl pointer-events-none z-0"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#7B61FF]/10 rounded-full blur-2xl pointer-events-none z-0"></div>

          {/* Futuristic Cyber Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '12px 12px'
          }}></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            
            {/* Top Row: Name and Grayscale Mini Photo Container */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1 text-[8px] font-bold text-[#00D4FF] uppercase tracking-[0.2em]">
                  <span>RECORD BACK</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <h4 className="text-xl font-display font-black text-white uppercase italic leading-none tracking-tight">
                  {player.name}
                </h4>
                <span className="text-[9px] text-[#7B61FF] font-bold uppercase mt-1 tracking-wider">
                  {player.game}
                </span>
              </div>

              {/* The White/Grayscale Cut-out container from reference image */}
              <div className="w-16 h-18 bg-white/5 border border-white/20 p-1 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#00D4FF]/20 border-b border-l border-white/30 rounded-bl-sm"></div>
                <img 
                  src={player.avatarUrl} 
                  alt={player.name} 
                  className="w-full h-full object-cover rounded-md filter grayscale brightness-110"
                />
              </div>
            </div>

            {/* Quick Details (HT / WT / SHOOTS equivalents) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 my-3 text-[10px] bg-white/[0.02] border border-white/5 p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">OVR Rating</span>
                <span className="text-[#00D4FF] font-display font-black text-sm">{rating} OVR</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">Region / City</span>
                <span className="text-white font-bold">{player.city}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">Platform</span>
                <span className="text-white font-bold truncate max-w-[110px]" title={player.platform}>{player.platform}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">Availability</span>
                <span className={`font-bold ${
                  player.availability === 'Lft' ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {player.availability === 'Lft' ? 'Free Agent (LFT)' : 'Signed Pro'}
                </span>
              </div>
            </div>

            {/* Esports Stats Table (YEAR, TEAM, GP, PTS, PIM style) */}
            <div className="flex-1 flex flex-col justify-start">
              <div className="text-[8px] font-bold text-[#7B61FF] uppercase tracking-[0.2em] mb-1.5 flex justify-between items-center">
                <span>COMPETITIVE LOGS</span>
                <span>₨ PKR</span>
              </div>
              
              <div className="border border-white/10 rounded-lg overflow-hidden bg-black/40 text-[9px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 bg-white/5 px-2.5 py-1.5 text-gray-400 font-bold border-b border-white/10 uppercase tracking-wider">
                  <div className="col-span-4 truncate">GAME</div>
                  <div className="col-span-3 text-center">RANK</div>
                  <div className="col-span-2 text-center">GP</div>
                  <div className="col-span-3 text-right">PRIZES</div>
                </div>

                {/* Table Rows (Max 2 rows to fit aspect ratio cleanly) */}
                <div className="divide-y divide-white/5">
                  {gamesList.slice(0, 2).map((game, i) => (
                    <div key={i} className="grid grid-cols-12 gap-1 px-2.5 py-2 items-center hover:bg-white/[0.02]">
                      <div className="col-span-4 font-bold text-white truncate" title={game.gameName}>{game.gameName}</div>
                      <div className="col-span-3 text-[#00D4FF] text-center font-bold truncate text-[8px]" title={game.rank}>{game.rank}</div>
                      <div className="col-span-2 text-gray-300 text-center">{game.matchesPlayed}</div>
                      <div className="col-span-3 text-right font-bold text-[#00E676]">
                        ₨{(game.prizeWon / 1000).toFixed(1)}k
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions and Stars */}
            <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2.5">
              
              {/* Stars decoration at bottom - directly from user's image reference! */}
              <div className="flex items-center justify-center gap-1 text-[#FFD700] opacity-80">
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>

              {/* View Full Profile button (stop-propagation) */}
              <div className="flex flex-col gap-2 stop-propagation">
                {player.availability === 'Lft' && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTryoutForm(true); }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] hover:from-white hover:to-white text-black font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                  >
                    Invite to Tryout &rarr;
                  </button>
                )}
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white hover:text-white transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Flip Card
                  </button>
                  {onViewProfile && (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                      className="flex-2 py-2 rounded-xl bg-[#00D4FF] hover:bg-white border-none text-black hover:text-black transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                    >
                      View Bio <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
          
          {/* Decorative Card Elements for Back Face */}
          <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-[24px] pointer-events-none z-50"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#7B61FF]/20 rounded-br-xl pointer-events-none z-50"></div>
        </div>

      </motion.div>

      {/* TRYOUT INVITATION MODAL */}
      {showTryoutForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto stop-propagation">
          <div className="premium-gaming-card w-full max-w-md border border-[#00D4FF]/30 bg-[#0A0A0F] rounded-2xl p-6 shadow-[0_0_50px_rgba(0,212,255,0.2)] relative overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            
            {/* Cyber background aesthetics */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7B61FF]/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-base font-display font-black tracking-wider text-white uppercase italic">
                  Scout Invitation
                </h3>
                <p className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider mt-0.5">
                  Invite {player.name} to Tryout
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTryoutForm(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-10 text-center space-y-4 flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-[#00E676] animate-bounce" />
                <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Invitation Sent!
                </h4>
                <p className="text-xs text-gray-400 font-mono max-w-xs mx-auto leading-relaxed">
                  Your team's scouting request has been transmitted. {player.name} will be notified of the opportunity.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTryoutSubmit} className="space-y-4 text-left">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
                    {submitError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Your Team Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                    placeholder="e.g. Portal Esports"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Contact Discord / Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                    placeholder="e.g. manager#1234"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Proposed Role
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-neutral-900 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                  >
                    <option value="Starter">Main Roster / Starter</option>
                    <option value="Substitute">Substitute / 6th Man</option>
                    <option value="Academy">Academy / Junior</option>
                    <option value="Trainee">Trialist / Trainee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Offer Details / Message
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white h-20 focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all resize-none"
                    placeholder="Briefly describe the tournament goals or team environment..."
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTryoutForm(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-400 font-bold rounded-xl text-[10px] uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] hover:opacity-90 text-black font-black rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Transmit Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
