
'use client';

import * as React from 'react';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

// Change this to test different users. 0 is admin, 1+ are regular users.
const currentUser: User = mockUsers[0]; 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setUser(currentUser);
      setLoading(false);
    }, 500);
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
    // Mock implementation
    if (email === 'admin@invernesseagles.com' && pass === 'password') {
      setUser(mockUsers[0]);
      return true;
    }
    const foundUser = mockUsers.find(u => u.email === email);
    if(foundUser) {
        setUser(foundUser);
        return true;
    }
    handleAuthError('Invalid email or password.');
    return false;
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    // Mock implementation
    const newUser: User = {
        id: `u${mockUsers.length + 1}`,
        name: additionalData.name,
        email: email,
        username: email.split('@')[0],
        avatarUrl: `https://picsum.photos/seed/u${mockUsers.length + 1}/100/100`,
        role: 'user',
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        stats: {
            sessionsPlayed: 0,
            attendanceRate: 100,
        },
    };
    mockUsers.push(newUser);
    return true;
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
    
    // In a real app, you would update this in your database
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
    }

    toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
        variant: "success"
    });
  }
  
  if (loading && !publicRoutes.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
