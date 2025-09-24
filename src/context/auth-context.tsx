
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, now get their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates to the user profile
        const unsubFromDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            // This case might happen if a user is created in Auth but not in Firestore.
            console.error("No such user document in Firestore!");
            setUser(null);
          }
          setLoading(false);
        });

        // Return a cleanup function for the document snapshot listener
        return () => unsubFromDoc();

      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  React.useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  const handleAuthError = (error: any, defaultMessage: string) => {
       const errorCode = error.code || 'unknown';
       let description = defaultMessage;
       if(errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
           description = 'Invalid email or password.';
       } else if (errorCode === 'auth/email-already-in-use') {
           description = 'This email address is already in use.';
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
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
    } catch (error) {
        console.error('Error signing out: ', error);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        return true;
    } catch (error: any) {
        handleAuthError(error, 'Could not sign you in.');
        return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        // Create user document in Firestore
        const newUser: Omit<User, 'id'> = {
            name: additionalData.name,
            email: email,
            username: email.split('@')[0],
            avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            role: 'user', // All new sign-ups are users
            skillLevel: additionalData.skillLevel,
            favoritePosition: additionalData.favoritePosition,
            stats: {
                sessionsPlayed: 0,
                attendanceRate: 100,
            },
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
        return true;

    } catch (error: any) {
        handleAuthError(error, 'Could not create your account.');
        return false;
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    try {
        await setDoc(userDocRef, updatedData, { merge: true });
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
            variant: "success"
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
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
