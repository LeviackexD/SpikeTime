
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, type Auth } from 'firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { ref, get, type Database } from 'firebase/database';
import { auth, firestore, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, data: Omit<User, 'id' | 'email' | 'role' | 'avatarUrl' | 'username' | 'stats'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        console.log("AuthProvider: Firebase user found, fetching profile...", firebaseUser.uid);
        try {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log("AuthProvider: User profile found in Firestore.");
            
            // Check for admin role in Realtime Database
            const adminRef = ref(db, `adminConfig/adminUserUids/${firebaseUser.uid}`);
            const adminSnapshot = await get(adminRef);
            const isAdmin = adminSnapshot.exists() && adminSnapshot.val() === true;
            console.log(`AuthProvider: User role check -> isAdmin: ${isAdmin}`);

            setUser({ ...userData, role: isAdmin ? 'admin' : 'user' });
          } else {
            console.warn("AuthProvider: User document not found in Firestore for UID:", firebaseUser.uid);
            setUser(null);
            await signOut(auth);
          }
        } catch (error) {
          console.error("AuthProvider: Error fetching user profile:", error);
          setUser(null);
          await signOut(auth);
        }
      } else {
        console.log("AuthProvider: No Firebase user.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (!loading && !user && !isAuthPage) {
        console.log("AuthProvider: Redirecting to login.");
        router.push('/login');
    }
     if (!loading && user && isAuthPage) {
        console.log("AuthProvider: User is logged in, redirecting from auth page to home.");
        router.push('/');
    }
  }, [user, loading, pathname, router]);

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Sign-in failed:", error);
      return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, data: Omit<User, 'id' | 'email' | 'role' | 'avatarUrl' | 'username' | 'stats'>): Promise<boolean> => {
    console.log("signUpWithEmail: Attempting to create user...");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      console.log("signUpWithEmail: User created in Auth. UID:", firebaseUser.uid);
      
      const newUser: Omit<User, 'id' | 'role'> = {
        name: data.name,
        username: email.split('@')[0],
        email: email,
        avatarUrl: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        skillLevel: data.skillLevel,
        favoritePosition: data.favoritePosition,
        stats: {
          sessionsPlayed: 0,
          attendanceRate: 100,
        },
      };

      console.log("signUpWithEmail: Preparing to create user document in Firestore...");
      await setDoc(doc(firestore, 'users', firebaseUser.uid), newUser);
      console.log("signUpWithEmail: User document created successfully in Firestore for UID:", firebaseUser.uid);
      
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("ERROR al crear el documento del usuario:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await signOut(auth);
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
      if (user) {
        const userRef = doc(firestore, 'users', user.id);
        try {
            await setDoc(userRef, updatedData, { merge: true });
            setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
            return true;
        } catch(error) {
            console.error("Failed to update user profile:", error);
            return false;
        }
      }
      return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, logout, updateUser }}>
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
