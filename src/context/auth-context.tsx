
'use client';

import * as React from 'react';
import type { User as AppUser } from '@/lib/types';
import { currentUser } from '@/lib/mock-data';

interface AuthContextType {
  user: AppUser | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AppUser | null>(currentUser);

  return (
    <AuthContext.Provider value={{ user }}>
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
