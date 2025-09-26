

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<{success: boolean, requiresConfirmation: boolean}>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
  updateAvatarUrl: (avatarUrl: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true); // Only for initial load
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleUserSession = async (sessionUser: any | null) => {
    if (sessionUser) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile or profile not found:', error);
        setUser({
          id: sessionUser.id,
          email: sessionUser.email!,
          name: sessionUser.email!,
          username: sessionUser.email!,
          role: 'user',
          avatarUrl: '',
          skillLevel: 'Beginner',
          favoritePosition: 'Hitter',
        });
      } else {
        const appUser: User = {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: sessionUser.email!,
          avatarUrl: profile.avatarUrl,
          role: profile.role,
          skillLevel: profile.skillLevel,
          favoritePosition: profile.favoritePosition,
          stats: { sessionsPlayed: 0, attendanceRate: 0 },
        };
        setUser(appUser);
      }
    } else {
      setUser(null);
    }
  };

  React.useEffect(() => {
    // Check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleUserSession(session?.user ?? null);
      setLoading(false); // End initial loading
    };
    
    checkInitialSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't set loading to true here to avoid flicker on token refresh
      await handleUserSession(session?.user ?? null);
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
        throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, data: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<{success: boolean, requiresConfirmation: boolean}> => {
    const { data: signUpData, error } = await supabase.auth.signUp({ 
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

    if (error) {
        console.error("Sign up error:", error);
        return { success: false, requiresConfirmation: false };
    }
    
    // A user is returned, but a session is not. This means email confirmation is required.
    const requiresConfirmation = !!(signUpData.user && !signUpData.session);
    
    return { success: !!signUpData.user, requiresConfirmation };
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
  
  const updateAvatarUrl = async (avatarUrl: string): Promise<boolean> => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatarUrl })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
          console.error("Error updating avatar URL:", error);
          return false;
      }
      
      if (data) {
        toast({ title: "Avatar updated", description: "Your new avatar has been saved.", variant: "success", duration: 1500 });
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
        return true;
      }

      return false;
  }
  
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
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, logout, updateUser, updateAvatarUrl }}>
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
