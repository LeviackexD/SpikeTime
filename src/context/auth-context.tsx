
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { currentUser as mockCurrentUser, mockUsers } from '@/lib/mock-data';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
  logout: () => void; // Keep for type consistency, but it will do nothing
  signInWithEmail: (email: string, pass: string) => Promise<boolean>; // Keep for type consistency
  signUpWithEmail: (email: string, pass: string, data: any) => Promise<boolean>; // Keep for type consistency
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(mockCurrentUser);
  const [loading, setLoading] = React.useState(false);

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      // In a real app, you would also update your backend/mock data source
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = newUser;
      }
      return true;
    }
    return false;
  };
  
  // Dummy functions to satisfy the type, they don't do anything.
  const logout = async () => { console.log("Logout function is disabled in local mode."); };
  const signInWithEmail = async () => { console.log("Sign-in function is disabled in local mode."); return false; };
  const signUpWithEmail = async () => { console.log("Sign-up function is disabled in local mode."); return false; };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout, signInWithEmail, signUpWithEmail }}>
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
