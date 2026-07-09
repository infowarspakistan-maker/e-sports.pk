import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthResult = async (user: any) => {
    // Check if user document exists
    const adminEmails = ['infowarspakistan@gmail.com', 'infowarspakistan@gmail.cin'];
    const isAdminByEmail = user.email && adminEmails.includes(user.email.toLowerCase());

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || '',
        role: isAdminByEmail ? 'admin' : 'user', // Set admin role if matches adminEmails list
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: user.emailVerified || false,
        isActive: true,
      });
    } else if (isAdminByEmail) {
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          role: 'admin',
          updatedAt: new Date()
        });
      }
    }
    navigate('/');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthResult(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthResult(result.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthResult(result.user);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="premium-gaming-card w-full max-w-[550px] bg-[#0B111F] p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in duration-500 flex flex-col">
        <div className="mb-10">
          <h2 className="text-center text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight uppercase italic">
            {mode === 'login' ? 'Sign in' : 'Join the Arena'}
          </h2>
          <div className="h-1.5 w-24 bg-[#00D4FF] mx-auto mt-3 rounded-full shadow-[0_0_15px_#00D4FF]"></div>
          <p className="mt-6 text-center text-xs sm:text-sm text-gray-400 font-mono tracking-[0.2em] uppercase">
            {mode === 'login' ? 'to continue to E-Sports.pk' : 'and start your esports journey'}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleEmailAuth}>
          {error && <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl font-medium">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full px-5 py-3.5 bg-black/40 border border-white/10 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 transition-all sm:text-sm"
                placeholder="commander@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full px-5 py-3.5 bg-black/40 border border-white/10 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 transition-all sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-display font-black uppercase tracking-widest rounded-xl text-black bg-[#00D4FF] hover:bg-white hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] active:scale-95 transition-all disabled:opacity-50"
            >
              {mode === 'login' ? 'Access Account' : 'Initialize Profile'}
            </button>
          </div>
        </form>

        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-mono">
              <span className="px-4 bg-[#121B2A] text-gray-500">OR</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-white/10 rounded-xl bg-white/5 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 hover:border-[#00D4FF]/30 transition-all active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
