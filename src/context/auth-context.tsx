
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import type { User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // This effect runs once on startup to check the initial auth state.
  React.useEffect(() => {
    // In a real Firebase app, you'd use onAuthStateChanged here.
    // For the mock, we'll start with no user logged in.
    setLoading(false);
  }, []);

  React.useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const logout = () => {
    setUser(null);
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    // This is a mock login.
    // In a real app, you'd call Firebase's signInWithEmailAndPassword.
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && pass === 'password') {
      setUser(foundUser);
      return true;
    }
    return false;
  };
  
  const signInWithGoogle = async (): Promise<boolean> => {
    // This is a mock Google sign-in.
    // In a real app, this would use signInWithPopup with GoogleAuthProvider.
    // We'll simulate a successful sign-in with a user who isn't in mock data.
    const googleUser = {
      id: 'u-google',
      name: 'Google User',
      username: 'google_user',
      email: 'google@example.com',
      avatarUrl: 'https://picsum.photos/seed/u-google/100/100',
      role: 'user' as const,
      skillLevel: 'Beginner' as const,
      favoritePosition: 'Hitter' as const,
      stats: { sessionsPlayed: 0 },
    }
    // You could add logic here to check if the user already exists
    // and if not, add them to your user list (in a real DB).
    setUser(googleUser);
    return true;
  }


  return (
    <AuthContext.Provider value={{ user, firebaseUser: null, loading, logout, signInWithEmail, signInWithGoogle }}>
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
