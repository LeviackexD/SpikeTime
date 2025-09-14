/**
 * @fileoverview Manages user authentication state and provides auth-related functions.
 * It connects to Firebase Authentication, handles user sign-in, sign-up, sign-out,
 * and syncs user profile data with Firestore.
 */

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
    signInWithPopup,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  createUserProfile: (firebaseUser: FirebaseUser, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(mockUsers[0]);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(false);

  const logout = async () => {
    // In a real app, you'd sign out. For this mock, we do nothing or redirect.
    setUser(null);
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    // Mock sign-in
    const foundUser = mockUsers.find(u => u.email === email);
    if(foundUser){
      setUser(foundUser);
      router.push('/');
      return true;
    }
    return false;
  };

  const createUserProfile = async (
    fbUser: FirebaseUser, 
    additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }
    ): Promise<void> => {
        // This is a mock, so we just log it
    console.log("Creating user profile for", fbUser.uid, additionalData);
  }
  
  const signInWithGoogle = async (): Promise<void> => {
    // Mock sign-in
    setUser(mockUsers[1]); // Log in as a regular user for variety
    router.push('/');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout, signInWithEmail, signInWithGoogle, createUserProfile }}>
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
