import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { Filter, MessageSquare, ThumbsUp } from 'lucide-react';
import { SUPPORTED_GAMES } from '../lib/constants';

export const NewsPage = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rssError, setRssError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsRef = collection(db, 'news');
        const q = query(newsRef, orderBy('publishedAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Failed to fetch news from Firestore", err);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const handleManualFetch = async () => {
    setLoading(true);
    setRssError(null);
    try {
      const response = await fetch('/api/rss?url=https://liquipedia.net/news.xml');
      if (!response.ok) throw new Error('Failed to fetch RSS from API proxy');
      const data = await response.json();
      console.log("RSS fetched via Express:", data);
      setRssError("RSS fetch successful. (Storage not fully wired without admin auth)");
    } catch (err: any) {
      setRssError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-transparent min-h-screen pt-12 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tighter uppercase mb-2">Platform News</h1>
            <p className="text-[#A0A0AB] font-mono text-sm tracking-widest uppercase">The Latest Intel and Updates</p>
          </div>
          <button 
            onClick={handleManualFetch} 
            className="px-6 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider bg-transparent/5 border border-white/10 text-white hover:bg-[#00D4FF] hover:border-[#00D4FF] hover:text-black transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)]"
          >
            Force RSS Sync
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 bg-[#121B2A]/70 backdrop-blur-md p-4 rounded border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#00D4FF]" />
            <span className="text-sm font-mono font-bold tracking-widest uppercase text-white">Filters:</span>
          </div>
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
          >
            <option value="all">All Games</option>
            {SUPPORTED_GAMES.map(game => (
              <option key={game.id} value={game.id}>{game.icon} {game.name}</option>
            ))}
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border border-[#2A2A35] rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00D4FF] transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
            <option value="interview">Interview</option>
            <option value="analysis">Analysis</option>
          </select>
        </div>

        {rssError && (
          <div className="mb-8 p-4 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded text-[#FF4444] font-mono text-xs uppercase tracking-wider shadow-lg">
            {rssError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#121B2A]/70 backdrop-blur-md h-72 rounded border border-white/5 shadow-lg"></div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 premium-gaming-card shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <p className="text-white font-display font-bold text-xl mb-2">No Intel Found</p>
            <p className="text-[#A0A0AB] font-mono text-sm tracking-wide uppercase">The automated RSS parser will populate this soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <article key={article.id} className="premium-gaming-card overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)] group hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 bg-[#2A2A35] relative overflow-hidden">
                  {article.featuredImage ? (
                    <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#A0A0AB] font-mono text-xs uppercase tracking-widest">
                      No Image Data
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-[#00D4FF]/30 text-[#00D4FF] text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded">
                    {article.category || 'News'}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#14141E] to-transparent"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#7B61FF] uppercase">{article.game || 'General'}</span>
                    <span className="text-[10px] font-mono text-[#A0A0AB]">
                      {article.publishedAt ? format(article.publishedAt.toDate(), 'MMM d, yyyy') : 'Recent'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white leading-snug mb-3 group-hover:text-[#00D4FF] transition-colors">{article.title}</h3>
                  <p className="text-sm text-[#A0A0AB] line-clamp-3 mb-6 font-body flex-1">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[#A0A0AB]">
                      <button className="flex items-center gap-1.5 hover:text-[#00D4FF] transition-colors text-xs font-mono font-bold group/btn">
                        <ThumbsUp className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                        <span>{Math.floor(Math.random() * 50) + 12}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-[#00D4FF] transition-colors text-xs font-mono font-bold group/btn">
                        <MessageSquare className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                        <span>{Math.floor(Math.random() * 20) + 3}</span>
                      </button>
                    </div>
                    <a href={article.sourceUrl || '#'} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold tracking-widest uppercase text-[#00D4FF] hover:text-white transition-colors flex items-center gap-1 group/link">
                      Read External <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
