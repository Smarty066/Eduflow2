'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (!user) {
        setUserData(null);
        setLoading(false);
      } else {
        setLoading(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeData = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          setUserData(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });

      return () => unsubscribeData();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}
