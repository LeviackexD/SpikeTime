/**
 * @fileoverview Manages user authentication state and provides auth-related functions.
 * This is a MOCK implementation for prototype purposes. It uses a hardcoded
 * user from `mock-data.ts` and does not perform real authentication.
 */

'use client';

import * as React from 'react';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { currentUser as mockCurrentUser, mockUsers } from '@/lib/mock-data';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define a type for the user that can be null
type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  // These functions are mocks and will simulate success/failure
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(mockCurrentUser);
  const [loading, setLoading] = React.useState(false); // Set to false as we are not fetching
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    // This effect redirects users if they are not logged in and not on a public page.
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  const logout = () => {
    setUser(null);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
     // Find a user that matches the email. In a real app, you'd also check the password hash.
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
        setUser(foundUser);
        return true;
    }
    return false;
  };

  const signInWithGoogle = async (): Promise<void> => {
    // Simulate Google sign-in by logging in as the default mock user
    setUser(mockCurrentUser);
    toast({ title: 'Login Successful', description: `Welcome back, ${mockCurrentUser.name}!` });
    router.push('/');
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    // Simulate sign-up. In a real app, this would create a new user record.
    // For this mock, we'll just log the attempt and simulate success.
    console.log('Simulating sign-up for:', email, additionalData);
    // Here, we don't actually add the user to the mockUsers array to keep the prototype simple.
    // We just pretend it worked and redirect to login.
    return true;
  };
  
  // In a real app with Firebase, you'd have a loading screen.
  // Here we can render children immediately as auth is synchronous.
  // if (loading && !publicRoutes.includes(pathname)) {
  //   return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  // }


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
