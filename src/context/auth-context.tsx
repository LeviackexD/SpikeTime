
'use client';

import * as React from 'react';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, DocumentData, Unsubscribe } from 'firebase/firestore';


type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
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
    let userDocUnsubscribe: Unsubscribe | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
        }
        
        const userRef = doc(db, 'users', firebaseUser.uid);
        userDocUnsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
             // This case might happen if the Firestore doc wasn't created on signup
             console.log("User document not found, logging out.");
             signOut(auth);
          }
          setLoading(false);
        });
      } else {
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
        authUnsubscribe();
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
        }
    };
  }, []);


  React.useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  const handleAuthError = (description: string) => {
       toast({
        title: 'Authentication Failed',
        description: description,
        variant: 'destructive',
      });
  }

  const logout = async () => {
    await signOut(auth);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error: any) {
      console.error(error);
      handleAuthError('Invalid email or password.');
      return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      await updateFirebaseProfile(firebaseUser, { displayName: additionalData.name });

      const newUser: Omit<User, 'id'> = {
        name: additionalData.name,
        email: firebaseUser.email || '',
        username: firebaseUser.email?.split('@')[0] || `user${Date.now()}`,
        avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
        role: 'user', // default role
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        stats: {
          sessionsPlayed: 0,
          attendanceRate: 100,
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      return true;
    } catch (error: any) {
      console.error(error);
       handleAuthError(error.message || 'An unexpected error occurred during sign up.');
      return false;
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    try {
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, updatedData, { merge: true });

        if (updatedData.name || updatedData.avatarUrl) {
            await updateFirebaseProfile(auth.currentUser!, {
                displayName: updatedData.name,
                photoURL: updatedData.avatarUrl
            });
        }
        
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
            variant: "success"
        });
    } catch(error) {
        console.error("Error updating profile:", error);
         toast({
            title: "Update Failed",
            description: "Could not save your profile changes.",
            variant: "destructive"
        });
    }
  }
  
  if (loading && !publicRoutes.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
