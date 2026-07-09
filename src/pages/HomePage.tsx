import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ChevronRight, Users, Trophy, Briefcase, Play, ExternalLink, Calendar, MapPin, Shield, Gamepad2, Smartphone, Cpu, Tag, ArrowRight } from 'lucide-react';
import { Slider, SliderItem } from '../components/ui/Slider';
import { SUPPORTED_GAMES } from '../lib/constants';
import { getSliders, Slider as SliderData } from '../lib/sliderService';
import { getDynamicGames, Game } from '../lib/gamesService';
import { LiveMatchTicker } from '../components/home/LiveMatchTicker';
import { NextMajorEventCountdown } from '../components/home/NextMajorEventCountdown';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';

// Import newly added high-fidelity components representing Blueprint sections
import { EcosystemNav } from '../components/home/EcosystemNav';
import { GameShowcase } from '../components/home/GameShowcase';
import { FeaturedPlayers } from '../components/home/FeaturedPlayers';
import { RankingsSneakPeek } from '../components/home/RankingsSneakPeek';
import { CommunityHub } from '../components/home/CommunityHub';
import { BrandTrustBar } from '../components/home/BrandTrustBar';

interface FeaturedTournament {
  id: string;
  name: string;
  game: string;
  prize: string;
  date: string;
  location: string;
  status: string;
  bannerUrl?: string;
  registeredCount?: number;
  maxTeams?: number;
}

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  date: string;
}

export const HomePage = () => {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredTournaments, setFeaturedTournaments] = useState<FeaturedTournament[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(heroSearchQuery.trim())}`;
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedSliders, fetchedGames] = await Promise.all([
          getSliders(),
          getDynamicGames()
        ]);
        
        // Use only published sliders, or the first one if it exists
        const publishedSliders = fetchedSliders.filter(s => s.status === 'published');
        setSliders(publishedSliders.length > 0 ? publishedSliders : fetchedSliders);
        
        setGames(fetchedGames);

        // Fetch featured tournaments
        try {
          const toursRef = collection(db, 'tournaments');
          const q = query(
            toursRef,
            where('status', 'in', ['upcoming', 'ongoing']),
            limit(3)
          );
          const snap = await getDocs(q);
          const tours = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedTournament));
          setFeaturedTournaments(tours);
        } catch (e) {
          console.warn("Failed to fetch featured tournaments:", e);
        }

        // Fetch latest news
        try {
          const newsRef = collection(db, 'news');
          const nq = query(newsRef, orderBy('createdAt', 'desc'), limit(3));
          const nSnap = await getDocs(nq);
          const newsList = nSnap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              excerpt: data.excerpt || data.content?.substring(0, 100) + '...',
              category: data.category || 'update',
              imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800',
              date: data.createdAt?.toDate().toLocaleDateString() || 'Recent'
            } as NewsArticle;
          });
          setLatestNews(newsList);
        } catch (e) {
          console.warn("Failed to fetch latest news:", e);
        }

      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dynamicSliderItems: SliderItem[] = sliders.length > 0 && sliders[0].slides.length > 0 
    ? sliders[0].slides.map(s => ({
        id: s.id,
        image: s.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80',
        title: s.title,
        description: s.content,
        subtitle: "Featured Story",
        link: s.linkUrl || "/news",
        buttonText: "Read Article"
      }))
    : [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
          subtitle: 'Competitive Ecosystem',
          title: "Pakistan's Complete Esports Ecosystem",
          description: "From Grassroots to Glory — Discovered. Trained. Signed. Championed.",
          buttonText: 'Explore Tournaments',
          link: "/tournaments"
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
          subtitle: 'Player Advancement',
          title: "Build Your Legacy",
          description: "Create your professional player profile. Track stats, upload highlights, and get discovered by top organizations.",
          buttonText: 'Join as Player',
          link: "/register"
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop',
          subtitle: 'Brand Partnerships',
          title: "Sponsor The Next Champion",
          description: "Access our verified talent directory. Measure ROI, track campaigns, and support the grassroots growth of esports.",
          buttonText: 'Find Talent',
          link: "/sponsors"
        }
      ];

  return (
    <div className="w-full">
      {/* Slider Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] border-b border-white/5">
        <Slider 
          items={dynamicSliderItems}
          autoPlay={true}
          autoPlayInterval={7000}
          transitionType="glitch"
          transitionDuration={0.8}
          className="w-full h-full rounded-none"
          overlayClassName="from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent"
          showFullscreen={false}
          showDots={false}
          showProgressBar={false}
        />
        {/* Modern Cyberpunk Search & CTA HUD Panel Overlay */}
        <div className="absolute bottom-0 left-0 w-full z-30 pb-10 bg-gradient-to-t from-[#0A0A0F] to-transparent">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/5 to-transparent pointer-events-none"></div>
              
              {/* Left Column: Prominent Search Bar */}
              <form onSubmit={handleSearchSubmit} className="w-full md:w-[450px] relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players, teams, tournaments..."
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-20 py-3.5 bg-black/50 border border-white/10 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl text-white font-mono text-xs placeholder-gray-500 uppercase tracking-widest transition-all shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#00D4FF] hover:bg-[#7B61FF] text-black hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                  >
                    SEARCH
                  </button>
                </div>
              </form>

              {/* Right Column: CTA Buttons */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
                <Link
                  to="/register"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3.5 bg-white/5 hover:bg-[#00D4FF]/20 border border-white/10 hover:border-[#00D4FF] text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Join as Player <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                </Link>
                <Link
                  to="/players"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3.5 bg-white/5 hover:bg-[#7B61FF]/20 border border-white/10 hover:border-[#7B61FF] text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Find Talent <ArrowRight className="w-3.5 h-3.5 text-[#7B61FF]" />
                </Link>
                <Link
                  to="/made-in-pakistan"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3.5 bg-white/5 hover:bg-[#FFD700]/20 border border-white/10 hover:border-[#FFD700] text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Shop Gear <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveMatchTicker />

      {/* Game Activity Hub (Marquee Row) */}
      <div className="w-full bg-[#0A0A0F]/30 border-b border-white/5 py-8 relative z-20 overflow-hidden">
        <style>{`
          .game-card-hover:hover { border-color: var(--hover-color) !important; box-shadow: 0 0 20px var(--hover-color); }
          .mask-edges { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        `}</style>
        <div className="w-full overflow-hidden mask-edges py-0">
          <motion.div 
            className="flex gap-4 w-max px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {(() => {
              const displayGames = games.length > 0 ? games : SUPPORTED_GAMES;
              return [...displayGames, ...displayGames, ...displayGames].map((game, i) => (
                <Link 
                  to={`/game/${game.id}`} 
                  key={`${game.id}-${i}`} 
                  className="w-[108px] h-[144px] shrink-0 premium-gaming-card relative overflow-hidden group transition-all duration-300 cursor-pointer game-card-hover border border-white/10 rounded-xl flex items-end p-3" 
                  style={{ '--hover-color': game.color } as React.CSSProperties}
                >
                  <img 
                    src={game.image} 
                    alt={game.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[50%] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                  <div className="relative z-20 w-full transform group-hover:-translate-y-2 transition-transform duration-300"> 
                     <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: game.color, color: game.color }}></span>
                        <span className="text-[6px] font-mono font-bold text-white/70 uppercase tracking-widest truncate">{game.category.replace('_', ' ')}</span>
                     </div>
                     <span className="font-display font-black text-[10px] uppercase tracking-tight text-white leading-tight group-hover:text-white transition-colors drop-shadow-md line-clamp-2">{game.name}</span>
                     {game.matchFormat && (
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[6px] font-mono text-[#A0A0AB] uppercase tracking-widest border border-white/10 px-1 py-0.5 rounded bg-black/50 whitespace-nowrap">{game.matchFormat}</span>
                        </div>
                     )}
                  </div>
                </Link>
              ));
            })()}
          </motion.div>
        </div>
      </div>

      <NextMajorEventCountdown />

      {/* Stats Ribbon (Social Proof) */}
      <section className="w-full bg-[#121B2A]/70 backdrop-blur-md border-b border-white/5 py-12 relative z-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:divide-x md:divide-white/10">
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="font-mono text-[10px] text-[#A0A0AB] uppercase tracking-widest mb-2 text-center md:text-left">Registered Gamers</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-white">36<span className="text-[#00D4FF]">M+</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="font-mono text-[10px] text-[#A0A0AB] uppercase tracking-widest mb-2 text-center md:text-left">Pro Players</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-white">500<span className="text-[#7B61FF]">+</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="font-mono text-[10px] text-[#A0A0AB] uppercase tracking-widest mb-2 text-center md:text-left">Verified Sponsors</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-white">50<span className="text-[#00D4FF]">+</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="font-mono text-[10px] text-[#A0A0AB] uppercase tracking-widest mb-2 text-center md:text-left">Total Prize Pool Won</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-white"><span className="text-[#7B61FF] text-base align-top mr-0.5">₨</span>700<span className="text-[#00D4FF]">M+</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="font-mono text-[10px] text-[#A0A0AB] uppercase tracking-widest mb-2 text-center md:text-left">Games Supported</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-white">20<span className="text-[#7B61FF]">+</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Navigation */}
      <EcosystemNav />

      {/* Game Ecosystem Showcase */}
      <GameShowcase />

      {/* Featured Players */}
      <FeaturedPlayers />

      {/* Upcoming Tournaments: "Compete. Win. Rise." */}
      {featuredTournaments.length > 0 && (
        <section className="w-full py-20 relative z-10 border-b border-white/5 bg-[#060913]/50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="container mx-auto px-6 md:px-10 relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">Compete. Win. Rise.</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight mb-2 flex items-center gap-3 text-white">
                  <Trophy className="w-8 h-8 text-[#FFD700]" /> Featured Tournaments
                </h2>
                <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px] text-sm">Register your squad for upcoming major regional tournaments and claim your share of verified prize pools.</p>
              </div>
              <Link to="/tournaments" className="hidden md:flex items-center gap-2 text-[#00D4FF] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors shrink-0">
                View All Events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTournaments.map(tour => (
                <Link to="/tournaments" key={tour.id} className="group premium-gaming-card cyber-angled-border scanline-effect cyber-glow-row block h-full min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/90 -z-10 pointer-events-none"></div>
                  <div className="h-32 bg-[#121B2A] relative overflow-hidden">
                    <img 
                      src={tour.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'} 
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${
                      tour.status === 'upcoming' ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]' :
                      tour.status === 'ongoing' ? 'bg-[#FF4444]/20 text-[#FF4444] border-[#FF4444]/50 shadow-[0_0_10px_rgba(255,68,68,0.3)]' :
                      'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.3)]'
                    }`}>
                      {tour.status}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col justify-between h-[calc(100%-8rem)] relative z-10">
                    <div>
                      <h3 className="font-display font-bold text-lg uppercase text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#00D4FF] transition-colors">{tour.name}</h3>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-xs text-[#A0A0AB]">
                          <Trophy className="w-4 h-4 text-[#FFD700]" />
                          <span className="font-mono text-white font-bold">{tour.prize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#A0A0AB]">
                          <Calendar className="w-4 h-4 text-[#00D4FF]" />
                          <span>{tour.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <Shield className="w-3.5 h-3.5 text-[#7B61FF]" />
                        <span className="text-white">{tour.registeredCount || 0} / {tour.maxTeams || 16} Teams</span>
                      </div>
                      <span className="text-[#00D4FF] group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link to="/tournaments" className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors px-6 py-3 border border-[#00D4FF]/30 rounded-full">
                View All Events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Rankings Sneak Peek */}
      <RankingsSneakPeek />

      {/* Community Hub */}
      <CommunityHub />

      {/* Latest Esports News (Stay Ahead with Pakistan's #1 Esports News Source) */}
      {latestNews.length > 0 && (
        <section className="w-full py-20 relative z-10 bg-[#0B111F]">
          <div className="container mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest">BREAKING INTEL</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight mb-2 text-white">
                  Stay Ahead with Pakistan's <span className="text-[#00D4FF]">#1 Esports News Source</span>
                </h2>
                <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px] text-sm">Stay updated with instant press releases, local tournament brackets, transfer windows, and pro schedules.</p>
              </div>
              <Link to="/news" className="hidden md:flex items-center gap-2 text-[#A0A0AB] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors shrink-0">
                All News Intel <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((news, idx) => (
                <Link to={`/news?id=${news.id}`} key={news.id} className={`group block overflow-hidden rounded-xl bg-[#121B2A]/70 bg-gradient-to-b from-[#121B2A]/70 to-[#0A0A0F] border border-white/5 hover:border-[#00D4FF]/50 transition-all duration-300 ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <div className={`relative ${idx === 0 ? 'h-64 md:h-80' : 'h-48'} overflow-hidden`}>
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121B2A] via-[#121B2A]/50 to-transparent"></div>
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 text-[10px] font-mono font-bold uppercase tracking-widest rounded backdrop-blur-md">
                        {news.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-6 relative z-10 ${idx === 0 ? 'md:pt-2' : ''}`}>
                    <div className="flex items-center gap-2 text-xs text-[#A0A0AB] font-mono mb-3">
                      <span>{news.date}</span>
                    </div>
                    <h3 className={`font-display font-bold text-white group-hover:text-[#00D4FF] transition-colors leading-tight mb-3 ${idx === 0 ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                      {news.title}
                    </h3>
                    <p className="text-sm text-[#A0A0AB] line-clamp-2 leading-relaxed">
                      {news.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link to="/news" className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-colors px-6 py-3 border border-[#00D4FF]/30 rounded-full">
                View All News <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ecosystem Partners (Backlink Strategy) */}
      <section className="w-full py-20 bg-transparent relative z-10 border-b border-white/5">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">PARTNERS & LOGISTICS</span>
            </div>
            <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight mb-3 text-white">Ecosystem Partners</h2>
            <p className="font-body text-[#A0A0AB] w-full max-w-[600px] md:max-w-[800px] text-sm leading-relaxed">Trusted corporate organizations delivering national logistics, travel, hardware, and broadcasting infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agility Travels */}
            <a href="/travel" className="group block h-[260px] bg-[#121B2A]/70 backdrop-blur-md rounded-xl border border-[#2A2A35] hover:border-[#00D4FF] transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent z-0"></div>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="text-[#00D4FF] w-5 h-5" />
              </div>
              <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/10 text-2xl">
                    ✈️
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white">Agility Travels</h3>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-[#00D4FF]/10 text-[#00D4FF] font-mono text-[10px] uppercase tracking-widest rounded mb-3">Official Travel Partner</span>
                  <p className="text-xs font-body text-[#A0A0AB] group-hover:text-white transition-colors mb-2 leading-relaxed">Premium Umrah, Haj, study abroad, and visa services. Seamless logistics for international travel.</p>
                  <span className="text-[10px] font-mono font-bold text-[#00D4FF] group-hover:underline uppercase tracking-wider">Learn More &rarr;</span>
                </div>
              </div>
            </a>
            
            {/* AV Live */}
            <a href="/events" className="group block h-[260px] bg-[#121B2A]/70 backdrop-blur-md rounded-xl border border-[#2A2A35] hover:border-[#7B61FF] transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/5 to-transparent z-0"></div>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="text-[#7B61FF] w-5 h-5" />
              </div>
              <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/10 text-2xl">
                    🎥
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white">AV Live</h3>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-[#7B61FF]/10 text-[#7B61FF] font-mono text-[10px] uppercase tracking-widest rounded mb-3">Broadcast Partner</span>
                  <p className="text-xs font-body text-[#A0A0AB] group-hover:text-white transition-colors mb-2 leading-relaxed">Pakistan's leader in audio-visual solutions. Live streaming, video conferencing, and event production.</p>
                  <span className="text-[10px] font-mono font-bold text-[#7B61FF] group-hover:underline uppercase tracking-wider">Learn More &rarr;</span>
                </div>
              </div>
            </a>
            
            {/* Made By Pak */}
            <a href="/made-in-pakistan" className="group block h-[260px] bg-[#121B2A]/70 backdrop-blur-md rounded-xl border border-[#2A2A35] hover:border-white transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0"></div>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="text-white w-5 h-5" />
              </div>
              <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/10 text-2xl">
                    🇵🇰
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white">Made By Pak</h3>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-transparent/10 text-white font-mono text-[10px] uppercase tracking-widest rounded mb-3">Local Ecosystem</span>
                  <p className="text-xs font-body text-[#A0A0AB] group-hover:text-white transition-colors mb-2 leading-relaxed">Support local manufacturing. High-quality products and gaming accessories proudly assembled in Pakistan.</p>
                  <span className="text-[10px] font-mono font-bold text-white group-hover:underline uppercase tracking-wider">Learn More &rarr;</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Brand Logos (Trust Bar) */}
      <BrandTrustBar />
    </div>
  );
};

