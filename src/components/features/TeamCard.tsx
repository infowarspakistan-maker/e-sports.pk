import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Trophy, MapPin, Users, Star, RotateCw, ExternalLink, Award, X, CheckCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthContext } from '../global/AuthProvider';

interface Team {
  id: string;
  name: string;
  game: string;
  location: string;
  color: string;
  status: 'Recruiting' | 'Roster Full';
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  sponsors: string[];
  galleryUrls: string[];
  recruitmentRoles: string[];
  secondaryGames: string[];
}

interface TeamCardProps {
  team: Team;
  roster: any[];
  achievements: any[];
  onViewDetails: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, roster, achievements, onViewDetails }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { user } = useAuthContext();
  const [showTryoutForm, setShowTryoutForm] = useState(false);
  const [playerName, setPlayerName] = useState(user?.displayName || '');
  const [discordHandle, setDiscordHandle] = useState('');
  const [role, setRole] = useState(team.recruitmentRoles?.[0] || 'Any');
  const [rank, setRank] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleTryoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !discordHandle || !rank) {
      setSubmitError('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'tryout_applications'), {
        teamId: team.id,
        teamName: team.name,
        playerName,
        discordHandle,
        role,
        rank,
        experience,
        applicantEmail: user?.email || 'Anonymous',
        userId: user?.uid || 'Anonymous',
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowTryoutForm(false);
        setSubmitSuccess(false);
        setDiscordHandle('');
        setRank('');
        setExperience('');
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting tryout application:", err);
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamColor = team.color || '#FF4444';
  const xpPoints = (achievements.length * 100) + (roster.length * 20);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on stop-propagation items, don't flip
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="perspective-1000 w-full aspect-[1/1.48] cursor-pointer group select-none relative transition-all duration-700 ease-out hover:scale-[1.15] hover:z-50 hover:shadow-[0_35px_70px_rgba(26,115,232,0.35)]"
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
        <div className="absolute inset-0 backface-hidden w-full h-full bg-[#050505] rounded-[24px] border border-white/10 group-hover:border-[#1A73E8]/40 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] group-hover:shadow-[0_0_30px_rgba(26,115,232,0.2)] transition-all duration-500 flex flex-col justify-between">
          
          {/* Top Diagonal Corner Stripes (Athletic Sports Trading Card Style from user image) */}
          <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
            <div className="absolute top-[-25px] left-[-25px] w-[120px] h-[30px] bg-[#FF4444] rotate-45 shadow-lg"></div>
            <div className="absolute top-[-15px] left-[-15px] w-[120px] h-[10px] bg-white rotate-45"></div>
            <div className="absolute top-[-5px] left-[-5px] w-[120px] h-[5px] bg-[#1A73E8] rotate-45"></div>
          </div>

          <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-20">
            <div className="absolute bottom-[-25px] right-[-25px] w-[120px] h-[30px] bg-[#1A73E8] rotate-45 shadow-lg"></div>
            <div className="absolute bottom-[-15px] right-[-15px] w-[120px] h-[10px] bg-white rotate-45"></div>
            <div className="absolute bottom-[-5px] right-[-5px] w-[120px] h-[5px] bg-[#FF4444] rotate-45"></div>
          </div>

          {/* Dynamic Background Glow based on team color */}
          <div 
            className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none z-0 blur-3xl"
            style={{ backgroundColor: teamColor }}
          ></div>

          {/* Holographic sweep effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none z-30">
            <div className="absolute -inset-[100%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.15)_90deg,transparent_180deg,rgba(255,68,68,0.15)_270deg,transparent_360deg)]"></div>
          </div>

          {/* TOP SECTION: BANNER & ASYMMETRICAL NOTCHED CONTAINER */}
          <div className="relative h-[60%] w-full overflow-hidden">
            
            {/* Recruiting Status Tag */}
            <div className="absolute top-6 right-0 z-40">
              <div className={`pl-4 pr-6 py-1.5 rounded-l-full text-[8px] font-mono font-bold uppercase tracking-[0.2em] border-y border-l backdrop-blur-xl shadow-2xl ${
                team.status === 'Recruiting' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                /// {team.status}
              </div>
            </div>

            {/* Stars Decoration Column on side - From Reference Image */}
            <div className="absolute top-12 left-4 z-40 flex flex-col gap-1.5 text-white/40">
              <Star className="w-2.5 h-2.5 fill-current" />
              <Star className="w-2.5 h-2.5 fill-current" />
              <Star className="w-2.5 h-2.5 fill-current" />
              <Star className="w-2.5 h-2.5 fill-current" />
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>

            {/* Logo area with Notched/Cut-out design from the uploaded image */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-12">
              <div className="relative w-36 h-36 bg-white/5 backdrop-blur-md border border-white/10 p-2 shadow-[0_25px_50px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:scale-105"
                   style={{
                     clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                   }}>
                {/* Asymmetrical Notched Inner Frame */}
                <div className="absolute inset-0.5 bg-black/80 flex items-center justify-center p-3"
                     style={{
                       clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                     }}>
                  {team.logoUrl ? (
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      className="w-full h-full object-cover filter brightness-110 contrast-105 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Shield className="w-14 h-14" style={{ color: teamColor }} />
                  )}
                </div>
              </div>
            </div>

            {/* Banner Artwork Backdrop */}
            <div className="absolute inset-0 z-0">
              <img 
                src={team.bannerUrl} 
                alt={team.name} 
                className="w-full h-full object-cover opacity-20 filter blur-[1px] group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            </div>

            {/* Flip control overlay */}
            <div className="absolute bottom-3 right-6 z-40 stop-propagation">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="w-8 h-8 bg-black/70 hover:bg-black/90 border border-white/10 hover:border-[#00D4FF] text-white/50 hover:text-[#00D4FF] rounded-full flex items-center justify-center transition-all shadow-md"
                title="Flip to details"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LOWER DETAILS SECTION */}
          <div className="relative h-[40%] bg-black flex flex-col z-20 px-6 py-4 border-t border-white/5">
            
            {/* Angled "TEAM NAME" Banner from Reference Image */}
            <div className="relative mb-3 stop-propagation">
              <div className="absolute inset-0 bg-[#1A73E8] skew-x-[-15deg] shadow-[0_0_15px_rgba(26,115,232,0.4)]"></div>
              <div className="relative z-10 px-4 py-1 flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] italic">
                  GUILD REGISTERED
                </span>
                <span className="text-[10px] font-mono font-black text-[#FFD700]">
                  {xpPoints} XP
                </span>
              </div>
            </div>

            {/* Club Identity Title */}
            <div className="flex flex-col mb-4">
              <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-[#00D4FF] transition-colors">
                {team.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">{team.location}</span>
                <span className="text-[#333] font-mono">/</span>
                <span className="text-[8px] font-mono font-bold text-[#00D4FF] uppercase tracking-widest italic">{team.game}</span>
              </div>
            </div>

            {/* Dynamic Bio Paragraph */}
            <p className="text-[11px] text-gray-400 line-clamp-2 italic font-body leading-relaxed mb-4">
              "{team.bio || 'Representing Pakistan’s finest competitive scene in premier divisions.'}"
            </p>

            {/* Active Members Mini Stack */}
            <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  {roster.length} {roster.length === 1 ? 'MEMBER' : 'MEMBERS'}
                </span>
              </div>

              {/* Roster avatars stack */}
              <div className="flex -space-x-1.5">
                {roster.slice(0, 4).map((member, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-black overflow-hidden bg-white/5 shadow-md">
                    <img src={member.avatarUrl} alt="member" className="w-full h-full object-cover" />
                  </div>
                ))}
                {roster.length > 4 && (
                  <div className="w-5 h-5 rounded-full border border-black bg-[#121B2A] flex items-center justify-center text-[7px] font-black text-[#00D4FF]">
                    +{roster.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Card Frames */}
          <div className="absolute top-0 left-0 w-full h-full border-2 border-white/5 rounded-[24px] pointer-events-none z-50"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/20 rounded-bl-lg pointer-events-none z-50"></div>
          
          {/* Subtle reflection shine */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-35deg] group-hover:left-[150%] transition-all duration-1000 ease-out z-50"></div>
        </div>

        {/* ==================== BACK OF THE CARD ==================== */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-[#070B19] rounded-[24px] border-2 border-[#1A73E8]/30 group-hover:border-[#1A73E8]/60 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] group-hover:shadow-[0_0_30px_rgba(26,115,232,0.25)] transition-all duration-500 flex flex-col justify-between rotate-y-180 p-5 font-mono text-white">
          
          {/* Hologram details */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#FF4444]/10 rounded-full blur-2xl pointer-events-none z-0"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#1A73E8]/10 rounded-full blur-2xl pointer-events-none z-0"></div>

          {/* Interactive Back Panel details */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            
            {/* Back Header: Title & Cutout Mini Logo */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1 text-[8px] font-bold text-[#FF4444] uppercase tracking-[0.2em]">
                  <span>ORGANIZATION DATA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></span>
                </div>
                <h4 className="text-xl font-display font-black text-white uppercase italic leading-none tracking-tight">
                  {team.name}
                </h4>
                <span className="text-[9px] text-[#00D4FF] font-bold uppercase mt-1 tracking-wider">
                  {team.game}
                </span>
              </div>

              {/* Minified cutout container mirroring reference image */}
              <div className="w-16 h-18 bg-white/5 border border-white/20 p-1 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#1A73E8]/20 border-b border-l border-white/30 rounded-bl-sm"></div>
                {team.logoUrl ? (
                  <img 
                    src={team.logoUrl} 
                    alt={team.name} 
                    className="w-full h-full object-cover rounded-md filter grayscale brightness-110"
                  />
                ) : (
                  <Shield className="w-8 h-8 text-white/20" />
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 my-3 text-[10px] bg-white/[0.02] border border-white/5 p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">BASE STATION</span>
                <span className="text-white font-bold">{team.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">ECO XP PTS</span>
                <span className="text-[#FFD700] font-bold">{xpPoints} XP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">ACTIVE ROSTER</span>
                <span className="text-white font-bold">{roster.length} Players</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold text-[8px] uppercase tracking-wider">RECRUITMENT</span>
                <span className={`font-bold ${team.status === 'Recruiting' ? 'text-green-400' : 'text-gray-500'}`}>
                  {team.status === 'Recruiting' ? 'ACTIVE' : 'ROSTER FULL'}
                </span>
              </div>
            </div>

            {/* Competitive Record Section (YEAR, TEAM, GP, PTS layout) */}
            <div className="flex-1 flex flex-col justify-start">
              <div className="text-[8px] font-bold text-[#00D4FF] uppercase tracking-[0.2em] mb-1.5 flex justify-between items-center">
                <span>PODIUM ACHIEVEMENTS</span>
                <span>₨ PKR</span>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden bg-black/40 text-[9px] flex-1">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-1 bg-white/5 px-2.5 py-1.5 text-gray-400 font-bold border-b border-white/10 uppercase tracking-wider text-[8px]">
                  <div className="col-span-5 truncate">EVENT / TOURNAMENT</div>
                  <div className="col-span-3 text-center">RANK</div>
                  <div className="col-span-4 text-right">PRIZES</div>
                </div>

                {/* Rows of accomplishments */}
                <div className="divide-y divide-white/5 max-h-[80px] overflow-y-auto">
                  {achievements.length > 0 ? (
                    achievements.slice(0, 3).map((finish, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-1 px-2.5 py-2 items-center hover:bg-white/[0.02]">
                        <div className="col-span-5 font-bold text-white truncate" title={finish.tournamentName}>
                          {finish.tournamentName}
                        </div>
                        <div className="col-span-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            finish.position === 1 ? 'bg-yellow-500/10 text-yellow-400' :
                            finish.position === 2 ? 'bg-slate-400/10 text-slate-300' :
                            'bg-amber-600/10 text-amber-500'
                          }`}>
                            #{finish.position}
                          </span>
                        </div>
                        <div className="col-span-4 text-right font-bold text-[#00E676] truncate" title={finish.prize}>
                          {finish.prize}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-500 text-[9px]">
                      No active tournament medals.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions and Stars decoration - matching reference image */}
            <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2.5">
              
              <div className="flex items-center justify-center gap-1 text-[#FFD700] opacity-80">
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>

              {team.status === 'Recruiting' && (
                <div className="stop-propagation">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTryoutForm(true); }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] hover:from-white hover:to-white text-black font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                  >
                    Apply for Tryout &rarr;
                  </button>
                </div>
              )}

              <div className="flex gap-2 stop-propagation">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white hover:text-white transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Flip Card
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                  className="flex-2 py-2 rounded-xl bg-[#1A73E8] hover:bg-white border-none text-black hover:text-black transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(26,115,232,0.3)]"
                >
                  View Details <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Decorative Card Elements for Back Face */}
          <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-[24px] pointer-events-none z-50"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#1A73E8]/20 rounded-br-xl pointer-events-none z-50"></div>
        </div>

      </motion.div>

      {/* TRYOUT APPLICATION MODAL */}
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
                  Team Tryout Application
                </h3>
                <p className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider mt-0.5">
                  Apply for {team.name}
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
                  Application Logged!
                </h4>
                <p className="text-xs text-gray-400 font-mono max-w-xs mx-auto leading-relaxed">
                  Your tactical data has been uploaded to the {team.name} roster database. The team manager will reach out via Discord shortly.
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
                    Applicant In-Game Name / Alias *
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                    placeholder="e.g. Arslan_Ash"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Discord ID / Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                    placeholder="e.g. arslan#1234 or arslan_ash"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Target Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-neutral-900 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                  >
                    {team.recruitmentRoles && team.recruitmentRoles.length > 0 ? (
                      team.recruitmentRoles.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))
                    ) : (
                      <>
                        <option value="Entry Fragger">Entry Fragger</option>
                        <option value="Sniper">Sniper</option>
                        <option value="In-Game Leader">In-Game Leader</option>
                        <option value="Support">Support</option>
                        <option value="Flex / Sub">Flex / Sub</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Current Rank & MMR / Peak Rating *
                  </label>
                  <input
                    type="text"
                    required
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all"
                    placeholder="e.g. Radiant #150 or Grandmaster 600LP"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Competitive History / Resume (Optional)
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl text-xs bg-white/5 outline-none text-white h-20 focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF] transition-all resize-none"
                    placeholder="List tournaments played or previous teams..."
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
                    {isSubmitting ? 'Submitting...' : 'Upload Data'}
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
