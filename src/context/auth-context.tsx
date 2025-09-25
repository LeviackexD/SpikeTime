

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import { supabase } from '@/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<{success: boolean, requiresConfirmation: boolean}>;
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

            if (error || !profile) {
                console.error('Error fetching profile or profile not found:', error);
                // Create a partial user object instead of logging them out.
                // This prevents the user from being logged out if the profile fetch fails.
                 setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.email!,
                    username: session.user.email!,
                    role: 'user',
                    avatarUrl: '',
                    skillLevel: 'Beginner',
                    favoritePosition: 'Hitter',
                    stats: { sessionsPlayed: 0, attendanceRate: 0 },
                });

            } else if (profile) {
                const appUser: User = {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    email: session.user.email!,
                    avatarUrl: profile.avatarUrl,
                    role: profile.role,
                    skillLevel: profile.skillLevel,
                    favoritePosition: profile.favoritePosition,
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
  }, [user, loading, pathname]);

  const signInWithEmail = async (email: string, pass: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
        // Throw the error so the UI can catch it.
        throw error;
    }
    // onAuthStateChange will handle setting the user and redirecting.
  };

  const signUpWithEmail = async (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<{success: boolean, requiresConfirmation: boolean}> => {
    const { data: signUpData, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
            channel: 'email', // Explicitly set channel
            data: {
                name: data.name,
                skillLevel: data.skillLevel,
                favoritePosition: data.favoritePosition
            }
        }
    });

    if (error) {
        console.error("Sign up error:", error);
        return { success: false, requiresConfirmation: false };
    }
    
    // If a user is created but session is null, email confirmation is likely needed.
    const requiresConfirmation = !!(signUpData.user && !signUpData.session);

    // If user creation was successful, regardless of confirmation status.
    const success = !!signUpData.user;
    
    return { success, requiresConfirmation };
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
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
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
