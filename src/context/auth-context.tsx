
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import { supabase } from '@/lib/supabase-client';
import type { AuthChangeEvent, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
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
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setLoading(true);
        if (session?.user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setUser(null);
            } else if (profile) {
                // Map Supabase profile to our app's User type
                const appUser: User = {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    email: session.user.email!,
                    avatarUrl: profile.avatarUrl,
                    role: profile.role,
                    skillLevel: profile.skillLevel,
                    favoritePosition: profile.favoritePosition,
                    // Stats will be static for now
                    stats: {
                        sessionsPlayed: 0,
                        attendanceRate: 0,
                    }
                };
                setUser(appUser);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
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
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return !error;
  };

  const signUpWithEmail = async (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
            data: {
                name: data.name,
                skillLevel: data.skillLevel,
                favoritePosition: data.favoritePosition
            }
        }
    });
    return !error;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .update({
            name: updatedData.name,
            skillLevel: updatedData.skillLevel,
            favoritePosition: updatedData.favoritePosition,
            avatarUrl: updatedData.avatarUrl
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
          console.error("Error updating profile:", error);
          return false;
      }

      if (data) {
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
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
