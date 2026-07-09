import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SUPPORTED_GAMES } from '../lib/constants';
import { Trophy, Users, Briefcase, Calendar, MessageSquare, ArrowLeft, Share2, Twitter, Facebook, Link2, Copy, Check, X } from 'lucide-react';

export const GameActivitiesPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const game = SUPPORTED_GAMES.find(g => g.id === gameId) || SUPPORTED_GAMES[0];

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock data filtered specifically for the chosen game
  const gamePlayers = [
    { name: 'Ahmad Khan', rank: 'God of Destruction', score: 92, platform: 'PS5' },
    { name: 'Sara Malik', rank: 'Tekken God / Master', score: 88, platform: 'PC' },
    { name: 'Zain Ali', rank: 'Tekken King / Elite', score: 85, platform: 'PS5' },
    { name: 'Fatima Noor', rank: 'Blue ranks / Diamond', score: 82, platform: 'Mobile' },
  ];

  const gameTeams = [
    { name: 'Team Thunder', location: 'Lahore', activeMembers: 5, recruiting: true },
    { name: '4Thrives', location: 'Islamabad', activeMembers: 6, recruiting: true },
    { name: 'Karachi Kings Esports', location: 'Karachi', activeMembers: 4, recruiting: false },
  ];

  const gameTournaments = [
    { name: `National ${game.name} Championship 2026`, platform: 'Hybrid', prize: 'Rs 500,000', date: 'Aug 15, 2026' },
    { name: `${game.name} Pakistan Cup 2026`, platform: 'Online', prize: 'Rs 1,500,000', date: 'Sep 10, 2026' },
  ];

  const gameNews = [
    { title: `Pakistani Players Dominate ${game.name} International Cup`, date: '2 days ago', readTime: '5 min read' },
    { title: `Season 2 Official Patch Notes Released for ${game.name}`, date: '5 days ago', readTime: '3 min read' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      {/* Back Button */}
      <div className="relative z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest text-[#A0A0AB] hover:text-[#00D4FF] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Cinematic Game Header */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 group">
        {/* Background Banner */}
        <div className="absolute inset-0 z-0">
          <img 
            src={game.banner} 
            alt={game.name} 
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2000ms] ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-transparent to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">
                  {game.category.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Ecosystem Active
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter uppercase italic leading-none">
                {game.name}
              </h1>
              <p className="text-[#A0A0AB] text-sm md:text-base max-w-xl font-body leading-relaxed">
                The definitive competitive hub for {game.name} in Pakistan. Connect with professional players, join elite teams, and enter verified tournaments.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Link 
              to="/register" 
              className="w-full md:w-auto text-center bg-[#00D4FF] text-black px-10 py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-[1.02] active:scale-95"
            >
              Join the Arena
            </Link>
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-full md:w-auto text-center bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all"
            >
              Invite Squad
            </button>
          </div>
        </div>
      </div>

      {/* Grid of activities on the game */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Players & Teams */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Players section */}
          <div className="premium-gaming-card p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Users className="w-5 h-5 text-[#00D4FF]" /> Featured Players
              </h2>
              <Link to="/players" className="text-xs font-mono text-[#00D4FF] font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gamePlayers.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg bg-black border border-white/10" style={{ color: game.color }}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0AB]">{p.rank} • {p.platform}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00D4FF]">SCORE: {p.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div className="premium-gaming-card p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Briefcase className="w-5 h-5 text-[#7B61FF]" /> Competitive Rosters
              </h2>
              <Link to="/teams" className="text-xs font-mono text-[#7B61FF] font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameTeams.map((t, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{t.name}</h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0AB]">{t.location} • {t.activeMembers} Members</p>
                  </div>
                  {t.recruiting && (
                    <span className="px-2 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] text-[10px] font-mono font-bold rounded uppercase tracking-widest">Recruiting</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Tournaments & News */}
        <div className="space-y-8">
          
          {/* Tournaments */}
          <div className="premium-gaming-card p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Trophy className="w-5 h-5 text-[#7B61FF]" /> Tournaments
              </h2>
              <Link to="/tournaments" className="text-xs font-mono text-[#7B61FF] font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
            </div>

            <div className="space-y-4">
              {gameTournaments.map((t, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] px-2 py-0.5 bg-[#7B61FF]/10 text-[#7B61FF] rounded font-mono font-bold uppercase tracking-widest">{t.platform}</span>
                    <span className="text-[10px] font-mono text-[#A0A0AB] uppercase tracking-widest">{t.date}</span>
                  </div>
                  <h3 className="font-bold text-white leading-snug">{t.name}</h3>
                  <p className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-widest">PRIZE: {t.prize}</p>
                </div>
              ))}
            </div>
          </div>

          {/* News and Patch Notes */}
          <div className="premium-gaming-card p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <MessageSquare className="w-5 h-5 text-[#00D4FF]" /> Game News
              </h2>
              <Link to="/news" className="text-xs font-mono text-[#00D4FF] font-bold uppercase tracking-widest hover:text-white transition-colors">Read News</Link>
            </div>

            <div className="space-y-4">
              {gameNews.map((n, i) => (
                <div key={i} className="p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                  <h3 className="font-bold text-sm text-white leading-snug group-hover:text-[#00D4FF] transition-colors">{n.title}</h3>
                  <div className="flex justify-between items-center mt-2 text-[10px] font-mono uppercase tracking-widest text-[#A0A0AB]">
                    <span>{n.date}</span>
                    <span>{n.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Social Media Sharing Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="premium-gaming-card border border-white/10 shadow-2xl max-w-xl w-full p-10 space-y-8 relative">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-[#A0A0AB] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-extrabold text-white uppercase tracking-tight">Share Hub</h3>
              <p className="text-sm font-body text-[#A0A0AB]">Help grow Pakistan's esports community by sharing this hub with your team.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out the esports activities and player directory for ${game.name} on E-Sports Pakistan!`)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all group"
              >
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A0A0AB] group-hover:text-[#00D4FF]">Twitter</span>
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all group"
              >
                <Facebook className="w-6 h-6 text-[#1877F2]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A0A0AB] group-hover:text-[#00D4FF]">Facebook</span>
              </a>
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out the ${game.name} Esports Hub on E-Sports Pakistan: ` + shareUrl)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all group"
              >
                <span className="text-xl">💬</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A0A0AB] group-hover:text-[#00D4FF]">WhatsApp</span>
              </a>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-mono font-bold text-[#A0A0AB] uppercase tracking-widest">Page Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono text-[#00D4FF] focus:outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-[#00D4FF] text-black rounded font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
