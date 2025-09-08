
'use client';

import * as React from 'react';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  createUserProfile: (firebaseUser: FirebaseUser, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If user exists in Auth but not Firestore, something is wrong.
          // For now, we log them out. A better implementation might create a profile.
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);
  
  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Error signing in with email:", error);
      return false;
    }
  };

  const createUserProfile = async (
    fbUser: FirebaseUser, 
    additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }
    ): Promise<void> => {
    const userRef = doc(db, 'users', fbUser.uid);
    const newUser: User = {
        id: fbUser.uid,
        name: additionalData.name,
        username: fbUser.email?.split('@')[0] || `user_${fbUser.uid.substring(0, 5)}`,
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/100/100`,
        role: 'user', // Default role
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        stats: {
            sessionsPlayed: 0
        }
    };
    await setDoc(userRef, newUser);
    setUser(newUser);
  }
  
  const signInWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        
        // Check if user already exists in Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // New user, create a profile in Firestore
            await createUserProfile(fbUser, {
              name: fbUser.displayName || 'New User',
              skillLevel: 'Beginner', // Default values
              favoritePosition: 'Hitter' // Default values
            });
        }
        return true;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        return false;
    }
  }


  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout, signInWithEmail, signInWithGoogle, createUserProfile }}>
      {loading ? <div>Loading...</div> : children}
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
