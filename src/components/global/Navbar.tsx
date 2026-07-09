import { Link, useLocation } from 'react-router-dom';
import { Search, Users, Sparkles, Trophy, Newspaper, Home, User, LogOut, Shield } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuthContext } from './AuthProvider';
import { useState } from 'react';

export const Navbar = () => {
  const { user, claims } = useAuthContext();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => 
    `text-[11px] font-mono tracking-widest uppercase transition-all duration-300 relative ${
      isActive(path) 
        ? 'text-[#00D4FF] font-bold after:content-[""] after:absolute after:-bottom-6 after:left-0 after:w-full after:h-1 after:bg-[#00D4FF] after:shadow-[0_0_10px_#00D4FF]'
        : 'text-[#A0A0AB] font-medium hover:text-white hover:translate-y-[-1px]'
    }`;
    
  return (
    <header className="fixed top-8 left-0 w-full h-16 z-50 flex justify-between items-center px-6 md:px-10 bg-[#060913]/90 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(0,212,255,0.05)]">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-display font-extrabold text-white tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00D4FF] rounded-sm flex items-center justify-center transform rotate-45 cyber-angled-border shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <span className="text-black transform -rotate-45 font-black text-lg font-mono">E</span>
          </div>
          <span className="hidden sm:inline">e-sports<span className="text-[#00D4FF]">.pk</span></span>
        </Link>
        <nav className="hidden md:flex gap-4 lg:gap-6 ml-4 lg:ml-8 items-center h-full">
          <Link to="/players" className={navLinkClass('/players')}>Players</Link>
          <Link to="/teams" className={navLinkClass('/teams')}>Teams</Link>
          <Link to="/tournaments" className={navLinkClass('/tournaments')}>Tournaments</Link>
          <Link to="/news" className={navLinkClass('/news')}>News</Link>
          <Link to="/sponsors" className={navLinkClass('/sponsors')}>Sponsors</Link>
          <Link to="/about" className={navLinkClass('/about')}>Learn</Link>
          <Link to="/rankings" className={navLinkClass('/rankings')}>Rankings</Link>
          <Link to="/ai-hub" className={`text-[11px] font-mono tracking-widest uppercase flex items-center gap-1.5 transition-all ${
            isActive('/ai-hub') ? 'text-[#00D4FF] font-bold after:content-[""] after:absolute after:-bottom-6 after:left-0 after:w-full after:h-1 after:bg-[#00D4FF] after:shadow-[0_0_10px_#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" /> AI Hub
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 h-full relative">
        <Link to="/search" className="text-[#A0A0AB] hover:text-[#00D4FF] transition-colors p-2 hover:bg-white/5 rounded-full">
          <Search className="w-5 h-5" />
        </Link>
        
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/5 hover:bg-[#00D4FF]/20 transition-all cyber-button"
            >
              <div className="w-7 h-7 bg-[#00D4FF] rounded-full flex items-center justify-center text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                {user.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:block text-xs font-mono font-bold text-white max-w-[100px] truncate">{user.email}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-4 w-56 bg-[#0B111F]/95 backdrop-blur-xl border border-[#00D4FF]/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-50 cyber-angled-border scanline-effect">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none"></div>
                <div className="p-4 border-b border-white/10 relative z-10">
                  <p className="text-[10px] text-[#A0A0AB] font-mono uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                </div>
                
                <div className="p-2 flex flex-col gap-1 relative z-10">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Player Dashboard
                  </Link>
                  
                  {claims?.role === 'admin' && (
                    <Link 
                      to="/dashboard/admin" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Console
                    </Link>
                  )}
                </div>
                
                <div className="p-2 border-t border-white/10 relative z-10">
                  <button 
                    onClick={() => {
                      auth.signOut();
                      setShowUserMenu(false);
                    }} 
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-[#00D4FF] text-black px-6 py-2 font-mono text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors hidden sm:inline-flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)] cyber-button">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
