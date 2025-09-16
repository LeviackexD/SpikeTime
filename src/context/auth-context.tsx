/**
 * @fileoverview Manages user authentication state and provides auth-related functions.
 * Connects to the real Firebase Authentication service.
 */

'use client';

import * as React from 'react';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser
} from 'firebase/auth';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

// Define a type for the user that can be null
type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true); 
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in. Find the corresponding profile data from our mock data.
        // In a real app, you would fetch this from Firestore.
        const profile = mockUsers.find(u => u.email === firebaseUser.email);
        if (profile) {
          setUser(profile);
        } else {
          // If no profile is found, create a basic one from the FirebaseUser object.
          // This could happen if a user signs up but their profile isn't in mockUsers.
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            role: 'user',
            skillLevel: 'Beginner',
            favoritePosition: 'Hitter',
            username: firebaseUser.email!.split('@')[0],
            stats: { sessionsPlayed: 0 },
          });
        }
      } else {
        // User is signed out
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

  const handleAuthError = (error: any) => {
     let description = 'An unexpected error occurred. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          description = 'This email address is already in use.';
          break;
        case 'auth/weak-password':
          description = 'The password is too weak. It must be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          description = 'Network error. Please check your internet connection and emulator status.';
          break;
        default:
          console.error('Firebase Auth Error:', error);
          break;
      }
       toast({
        title: 'Authentication Failed',
        description: description,
        variant: 'destructive',
      });
  }

  const logout = async () => {
    try {
        await signOut(auth);
        setUser(null);
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
    } catch (error) {
        handleAuthError(error);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle setting the user
        return true;
    } catch (error) {
        handleAuthError(error);
        return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle setting the user
        return true;
    } catch (error) {
        handleAuthError(error);
        return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        // NOTE: In a real app, you'd create a user document in Firestore here with the 'additionalData'
        console.log('User created. In a real app, save this to Firestore:', { email, ...additionalData });
        return true;
    } catch (error) {
        handleAuthError(error);
        return false;
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithEmail, signInWithGoogle, signUpWithEmail }}>
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
