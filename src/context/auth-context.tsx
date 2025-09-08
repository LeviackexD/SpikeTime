
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // By default, log in as the first mock user
  const [user, setUser] = React.useState<User | null>(mockUsers[0]);
  const [loading, setLoading] = React.useState(false);


  return (
    <AuthContext.Provider value={{ user, firebaseUser: null, loading }}>
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
