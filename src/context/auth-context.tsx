
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import { supabase } from '@/lib/supabase-client';
import { AuthChangeEvent, Session as SupabaseSession } from '@supabase/supabase-js';

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
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: SupabaseSession | null) => {
        if (session && session.user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setUser(null);
            } else {
                 // Map Supabase profile to app's User type
                const appUser: User = {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    email: session.user.email!,
                    avatarUrl: profile.avatar_url,
                    role: profile.role,
                    skillLevel: profile.skill_level,
                    favoritePosition: profile.favorite_position,
                    stats: { // Mock stats for now
                        sessionsPlayed: profile.sessions_played || 0,
                        attendanceRate: profile.attendance_rate || 90,
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
        subscription.unsubscribe();
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const signUpWithEmail = async (email: string, pass: string, data: Omit<User, 'id' | 'email' | 'role' | 'avatarUrl' | 'username' | 'stats'>): Promise<boolean> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: data.name,
                avatar_url: `https://i.pravatar.cc/150?u=${email}`, // default avatar
                skill_level: data.skillLevel,
                favorite_position: data.favoritePosition,
            }
        }
    });

    if (authError || !authData.user) {
        console.error("Supabase sign up error:", authError);
        return false;
    }

    // Supabase automatically creates the user in `auth.users`, but we need to create the profile in `public.profiles`.
    // A Supabase Function (Trigger) is the best way to do this automatically. For now, we are doing it on the client.
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            name: data.name,
            username: email.split('@')[0],
            avatar_url: `https://i.pravatar.cc/150?u=${email}`,
            skill_level: data.skillLevel,
            favorite_position: data.favoritePosition,
        });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        // Here you might want to delete the created user if profile creation fails.
        return false;
    }

    return true;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };
  
  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
      if (user) {
        const { error } = await supabase
            .from('profiles')
            .update({
                name: updatedData.name,
                skill_level: updatedData.skillLevel,
                favorite_position: updatedData.favoritePosition,
                avatar_url: updatedData.avatarUrl,
            })
            .eq('id', user.id);

        if (!error) {
             setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
        }
        return !error;
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

    