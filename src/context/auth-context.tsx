
'use client';

import * as React from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { mockUsers } from '@/lib/mock-data'; // For fallback profile data

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in, get their profile from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser({ id: doc.id, ...doc.data() } as AppUser);
          } else {
             // Fallback for mock users if profile doesn't exist in Firestore yet
            const mockUser = mockUsers.find(u => u.email === fbUser.email);
            if (mockUser) {
                setUser(mockUser);
            } else {
                setUser(null);
            }
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
