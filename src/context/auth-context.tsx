
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { mockUsers, currentUser as mockCurrentUser } from '@/lib/mock-data';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';

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
    // Simulate fetching user data
    setTimeout(() => {
      setUser(mockCurrentUser);
      setLoading(false);
    }, 500);
  }, []);
  
  React.useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (loading) return;

    if (user && isAuthPage) {
        router.push('/');
    } else if (!user && !isAuthPage) {
        router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    // Mock sign-in logic
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
        setUser(foundUser);
        return true;
    }
    return false;
  };

  const signUpWithEmail = async (email: string, pass: string, data: Omit<User, 'id' | 'email' | 'role' | 'avatarUrl' | 'username' | 'stats'>): Promise<boolean> => {
    // Mock sign-up logic. In a real app, this would create a new user.
    console.log("Mock sign up for:", email, data);
    return true;
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
      if (user) {
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
        // In a real app, you would also update the source of truth (e.g., mockUsers array or DB)
        return true;
      }
      return false;
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  if (loading && !isAuthPage) {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
            <VolleyballIcon className="h-12 w-12 animate-spin-slow text-primary" />
            <p className="mt-4 text-lg font-semibold">SpikeTime</p>
        </div>
    )
  }

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
