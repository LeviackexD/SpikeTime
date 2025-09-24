
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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
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
        // User is signed in, get their full profile.
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
          } else {
            // This case is problematic. User exists in Auth but not Firestore.
            // This might happen if Firestore creation fails after registration.
            // Log them out to force a clean state.
            console.warn("User authenticated but no profile found in Firestore. Logging out.");
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // No user is signed in.
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirect logic based on auth state
  React.useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      // If not logged in and not on an auth page, redirect to login
      router.push('/login');
    } else if (user && isAuthPage) {
      // If logged in and on an auth page, redirect to dashboard
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast({ title: t('toasts.logoutTitle'), description: t('toasts.logoutDescription') });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state and redirection
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

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        name: additionalData.name,
        username: email.split('@')[0],
        avatarUrl: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        email: email, // Store email in Firestore profile as well
        stats: { sessionsPlayed: 0, attendanceRate: 100 },
        createdAt: serverTimestamp(),
      });
      // After sign up, log them out to force a login, ensuring a clean flow.
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Sign up failed:", error);
      return false;
    }
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, updatedData);
        return true;
      } catch (error) {
        console.error("Failed to update user profile in Firestore:", error);
        // Revert optimistic update on failure
        setUser(user);
        return false;
      }
    }
    return false;
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  // Render children only when loading is complete AND auth state is resolved for the current page type
  const shouldRenderChildren = !loading && ((user && !isAuthPage) || (!user && isAuthPage));


  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithEmail, signUpWithEmail, updateUser }}>
      {shouldRenderChildren ? children : null}
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
