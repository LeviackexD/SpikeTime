
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers, currentUser as initialUser } from '@/lib/mock-data';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Simulate initial auth check
  React.useEffect(() => {
    setLoading(true);
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    } else {
        setUser(initialUser);
    }
    setLoading(false);
  }, []);

  const storeUser = (userToStore: AuthUser) => {
    if (userToStore) {
        sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
    } else {
        sessionStorage.removeItem('currentUser');
    }
  }

  const logout = () => {
    setUser(null);
    storeUser(null);
    toast({ title: t('toasts.logoutTitle'), description: t('toasts.logoutDescription') });
    router.push('/login');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // This is a mock sign-in. In a real app, you'd validate against a backend.
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
        setUser(foundUser);
        storeUser(foundUser);
        setLoading(false);
        return true;
    }
    
    setLoading(false);
    return false;
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
     // This is a mock sign-up. In a real app, you'd create a new user in your database.
    console.log("New user signed up (mock):", { email, ...additionalData });
    // In this mock setup, we don't add the new user to the list,
    // we just simulate a successful sign-up.
    return true;
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      storeUser(newUser);
    }
  };

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
