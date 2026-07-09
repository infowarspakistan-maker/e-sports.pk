import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  claims: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, claims: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const adminEmails = ['infowarspakistan@gmail.com', 'infowarspakistan@gmail.cin'];
        const isAdminByEmail = firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase());
        
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (isAdminByEmail && userData.role !== 'admin') {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                role: 'admin',
                updatedAt: new Date()
              });
              setClaims({ role: 'admin' });
            } else {
              setClaims({ role: isAdminByEmail ? 'admin' : userData.role });
            }
          } else {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator',
              photoURL: firebaseUser.photoURL || '',
              role: isAdminByEmail ? 'admin' : 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
              isVerified: firebaseUser.emailVerified || false,
              isActive: true,
            });
            setClaims({ role: isAdminByEmail ? 'admin' : 'user' });
          }
        } catch (err) {
          console.error("Failed to fetch user claims", err);
          setClaims(isAdminByEmail ? { role: 'admin' } : null);
        }
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, claims, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
