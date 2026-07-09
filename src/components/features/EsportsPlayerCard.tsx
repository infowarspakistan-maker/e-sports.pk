import React from 'react';
import { motion } from 'motion/react';
import { Shield, Trophy, MapPin, Twitch, MessageSquare, Gamepad2, CheckCircle2 } from 'lucide-react';

interface SkillStats {
  str: number;
  spd: number;
  pmk: number;
  phy: number;
  def: number;
  clu: number;
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
  };
}

export const EsportsPlayerCard: React.FC<EsportsPlayerCardProps> = ({ player }) => {
  const rating = player.rating || 85;
  const stats = player.skillStats || {
    str: 80,
    spd: 85,
    pmk: 75,
    phy: 82,
    def: 78,
    clu: 90,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -12, scale: 1.05 }}
      className="relative w-full max-w-[320px] aspect-[1/1.48] bg-[#050505] rounded-[24px] overflow-hidden border border-white/10 group cursor-pointer shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
    >
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
             {player.availability === 'Lft' ? '/// Looking For Team' : `/// ${player.availability}`}
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
    </motion.div>
  );
};
