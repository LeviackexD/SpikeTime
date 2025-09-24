/**
 * @fileoverview Manages user authentication state and provides auth-related functions.
 * Connects to the real Firebase Authentication service.
 */

'use client';

import * as React from 'react';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define a type for the user that can be null
type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
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
    // Simulate checking auth state
    const loggedInUser = mockUsers.find(u => u.email === 'admin@invernesseagles.com');
    if (loggedInUser) {
        setUser(loggedInUser);
    }
    setLoading(false);
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
    setUser(null);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email);
    if(foundUser) {
        setUser(foundUser);
        return true;
    }
    handleAuthError('Invalid email or password.');
    return false;
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    console.log('Simulating user sign up:', {email, ...additionalData});
    // In a mock environment, we don't persist the new user.
    // We just pretend it worked and redirect to login.
    return true;
  };
  
  if (loading && !user && !publicRoutes.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithEmail, signUpWithEmail }}>
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
