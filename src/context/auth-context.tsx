
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { currentUser, mockUsers } from '@/lib/mock-data';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';


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

  React.useEffect(() => {
    // In mock mode, we just set the currentUser after a short delay
    // to simulate an async operation.
    setTimeout(() => {
      setUser(currentUser);
      setLoading(false);
    }, 500);
  }, []);

  React.useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    setLoading(true);
    setUser(null);
    // No need to push, the effect above will handle it
    setTimeout(() => setLoading(false), 300);
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // In mock mode, any login is successful as long as it's not empty.
    const success = email !== '' && pass !== '';
    if (success) {
      setUser(currentUser); // Log in as the default mock user
    }
    setTimeout(() => setLoading(false), 500);
    return success;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    additionalData: { name: string; skillLevel: SkillLevel; favoritePosition: PlayerPosition }
  ): Promise<boolean> => {
    console.log('Mock sign up successful for:', additionalData.name);
    // In a real app, you'd create the user. Here, we just return true.
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
     if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
      // In a real app, find the user in mockUsers and update them too if needed.
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
      }
      return true;
    }
    return false;
  };
  
  if (loading) {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
            <VolleyballIcon className="h-12 w-12 animate-spin-slow text-primary" />
        </div>
    );
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
