/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/global/AuthProvider';
import { ProtectedRoute } from './components/global/ProtectedRoute';
import { auth } from './lib/firebase';
import { NewsPage } from './pages/NewsPage';
import { CommunityPage } from './pages/CommunityPage';
import { TravelPage } from './pages/TravelPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { AuthPage } from './pages/AuthPage';
import { PlayersPage } from './pages/PlayersPage';
import { TeamsPage } from './pages/TeamsPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { SponsorsPage } from './pages/SponsorsPage';
import { EventsPage } from './pages/EventsPage';
import { MadeInPakistanPage } from './pages/MadeInPakistanPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GameActivitiesPage } from './pages/GameActivitiesPage';
import { AIHubPage } from './pages/AIHubPage';
import { SearchPage } from './pages/SearchPage';
import { RankingsPage } from './pages/RankingsPage';
import { ArrowUp, Search, Twitter, Instagram, MessageSquare, Mail, Home, Trophy, Newspaper, Briefcase, Users, Sparkles } from 'lucide-react';

import { Navbar } from './components/global/Navbar';
import { Footer } from './components/global/Footer';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { HomePage } from './pages/HomePage';

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121B2A]/70 backdrop-blur-md border-t border-[#2A2A35] py-2.5 px-4 flex justify-around items-center md:hidden z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
      <Link 
        to="/" 
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/') ? 'text-[#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Home</span>
      </Link>
      <Link 
        to="/players" 
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/players') ? 'text-[#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Players</span>
      </Link>
      <Link 
        to="/teams" 
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/teams') ? 'text-[#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Teams</span>
      </Link>
      <Link 
        to="/tournaments" 
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/tournaments') ? 'text-[#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
        }`}
      >
        <Trophy className="w-5 h-5 text-[#7B61FF]" />
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Tourneys</span>
      </Link>
      <Link 
        to="/news" 
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/news') ? 'text-[#00D4FF]' : 'text-[#A0A0AB] hover:text-[#00D4FF]'
        }`}
      >
        <Newspaper className="w-5 h-5" />
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">News</span>
      </Link>
    </nav>
  );
};


import { LiveTicker } from './components/global/LiveTicker';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-[#00D4FF]/30 pb-16 md:pb-0">
          <ScrollToTop />
          <LiveTicker />
          <Navbar />
          <main className="flex-1 pt-24 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/recruitment" element={<RecruitmentPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/ai-hub" element={<AIHubPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/sponsors" element={<SponsorsPage />} />
              <Route path="/travel" element={<TravelPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/made-in-pakistan" element={<MadeInPakistanPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/game/:gameId" element={<GameActivitiesPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}
