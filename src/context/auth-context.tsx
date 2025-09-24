
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { auth, db, rtdb } from '@/lib/firebase';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    pass: string,
    additionalData: { name: string; skillLevel: SkillLevel; favoritePosition: PlayerPosition }
  ) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore and check admin status.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const adminRef = ref(rtdb, `adminConfig/adminUserUids/${firebaseUser.uid}`);

        try {
          const [userDocSnap, adminSnap] = await Promise.all([
            getDoc(userDocRef),
            get(adminRef)
          ]);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as Omit<User, 'id' | 'role'>;
            const isAdmin = adminSnap.exists() && adminSnap.val() === true;
            
            const profile: User = {
              id: firebaseUser.uid,
              ...userData,
              email: firebaseUser.email || userData.email || '',
              role: isAdmin ? 'admin' : 'user',
            };
            setUser(profile);
            
             // Redirect if logged-in user is on an auth page
            if(pathname === '/login' || pathname === '/register') {
                router.replace('/');
            }
          } else {
             // This can happen briefly during registration.
             // We don't log an error, but we also don't set a user until the doc exists.
             setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        } finally {
            setLoading(false);
        }

      } else {
        // User is signed out.
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast({ title: t('toasts.logoutTitle'), description: t('toasts.logoutDescription') });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    additionalData: { name: string; skillLevel: SkillLevel; favoritePosition: PlayerPosition }
  ): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Now, create the user document in Firestore.
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        name: additionalData.name,
        username: email.split('@')[0], // Simple username generation
        avatarUrl: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        role: 'user', // Default role
        stats: { sessionsPlayed: 0, attendanceRate: 100 },
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Sign up failed:", error);
      return false;
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      // In a real app, you would also update the Firestore document here.
      // e.g., const userDocRef = doc(db, 'users', user.id);
      // await updateDoc(userDocRef, updatedData);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (loading && !isAuthPage) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithEmail, signUpWithEmail, updateUser }}>
      {children}
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
