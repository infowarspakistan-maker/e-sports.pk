import { Link } from 'react-router-dom';
import { Twitter, Instagram, MessageSquare, Mail } from 'lucide-react';

export const Footer = () => (
  <footer className="border-t border-white/5 bg-transparent mt-auto relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent"></div>
    <div className="max-w-[1440px] mx-auto px-6 py-12 md:py-16 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div className="lg:col-span-1">
          <Link to="/" className="text-3xl font-display font-extrabold text-white tracking-tighter block mb-6">
            e-sports<span className="text-[#00D4FF]">.pk</span>
          </Link>
          <p className="text-[#A0A0AB] font-sans mb-8">
            Pakistan's premium ecosystem connecting players, teams, and sponsors on a unified platform.
          </p>
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A0A0AB] hover:bg-[#00D4FF] hover:text-black hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all duration-300" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A0A0AB] hover:bg-[#5865F2] hover:text-white hover:shadow-[0_0_15px_rgba(88,101,242,0.6)] transition-all duration-300" aria-label="Discord">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A0A0AB] hover:bg-[#E1306C] hover:text-white hover:shadow-[0_0_15px_rgba(225,48,108,0.6)] transition-all duration-300" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-mono font-bold tracking-widest uppercase mb-6">Platform</h3>
          <ul className="space-y-3 text-sm text-[#A0A0AB]">
            <li><Link to="/players" className="hover:text-[#00D4FF] transition-colors">Talent Directory</Link></li>
            <li><Link to="/tournaments" className="hover:text-[#00D4FF] transition-colors">Tournaments</Link></li>
            <li><Link to="/sponsors" className="hover:text-[#00D4FF] transition-colors">Sponsors</Link></li>
            <li><Link to="/community" className="hover:text-[#00D4FF] transition-colors">Community Hub</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-mono font-bold tracking-widest uppercase mb-6">Partners</h3>
          <ul className="space-y-3 text-sm text-[#A0A0AB]">
            <li><Link to="/travel" className="hover:text-[#00D4FF] transition-colors">Agility Travels</Link></li>
            <li><Link to="/events" className="hover:text-[#00D4FF] transition-colors">AV Live</Link></li>
            <li><Link to="/made-in-pakistan" className="hover:text-[#00D4FF] transition-colors">Made By Pak</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-1">
          <h3 className="text-white font-mono font-bold tracking-widest uppercase mb-6">Newsletter</h3>
          <p className="text-sm text-[#A0A0AB] mb-6">
            Get the latest platform updates and esports news straight to your inbox.
          </p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#A0A0AB]" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] transition-all placeholder-[#A0A0AB]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00D4FF] text-black font-mono font-bold tracking-wider uppercase py-3 rounded hover:bg-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="text-sm text-[#A0A0AB] text-center pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} E-Sports Pakistan. All rights reserved.</p>
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center sm:justify-end font-mono uppercase tracking-widest text-[10px]">
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  </footer>
);
