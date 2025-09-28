

'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement } from '@/lib/types';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { getSafeDate } from '@/lib/utils';
import { type AuthChangeEvent, type Session as SupabaseSession } from '@supabase/supabase-js';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  loading: boolean;
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'createdBy'>) => Promise<void>;
  updateSession: (session: Partial<Session> & { id: string }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bookSession: (sessionId: string) => Promise<boolean>;
  cancelBooking: (sessionId: string) => Promise<boolean>;
  joinWaitlist: (sessionId: string) => Promise<boolean>;
  leaveWaitlist: (sessionId: string) => Promise<boolean>;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
  updateAnnouncement: (announcement: Omit<Announcement, 'date'> & { id: string }) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchAllData = React.useCallback(async () => {
    setLoading(true);
    try {
        const [
            { data: sessionData, error: sessionError },
            { data: playersData, error: playersError },
            { data: waitlistData, error: waitlistError },
            { data: announcementData, error: announcementError }
        ] = await Promise.all([
            supabase.from('sessions').select('*').order('date', { ascending: true }).order('startTime', { ascending: true }),
            supabase.from('session_players').select('session_id, profiles!inner(*)'),
            supabase.from('session_waitlist').select('session_id, profiles!inner(*)'),
            supabase.from('announcements').select('*').order('date', { ascending: false })
        ]);

        if (sessionError) throw sessionError;
        if (playersError) throw playersError;
        if (waitlistError) throw waitlistError;
        if (announcementError) throw announcementError;

        const now = new Date();
        const visibleSessions = sessionData.filter((session: any) => {
            const [endHours, endMinutes] = session.endTime.split(':').map(Number);
            const sessionEndDateTime = getSafeDate(session.date);
            sessionEndDateTime.setHours(endHours, endMinutes, 0, 0);
            const oneHourAfterEnd = new Date(sessionEndDateTime.getTime() + 60 * 60 * 1000);
            return now < oneHourAfterEnd;
        });

        const sessionsWithData: Session[] = visibleSessions.map((session: any) => {
            const players: Partial<User>[] = (playersData || [])
                .filter((p: any) => p.session_id === session.id)
                .reduce((acc: Partial<User>[], current: any) => {
                    if (current.profiles) {
                        acc.push(current.profiles as Partial<User>);
                    }
                    return acc;
                }, []);
            
            const waitlist: Partial<User>[] = (waitlistData || [])
                .filter((w: any) => w.session_id === session.id)
                .reduce((acc: Partial<User>[], current: any) => {
                    if (current.profiles) {
                        acc.push(current.profiles as Partial<User>);
                    }
                    return acc;
                }, []);

            return {
              id: session.id,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              location: session.location,
              level: session.level,
              maxPlayers: session.maxPlayers,
              imageUrl: session.imageUrl,
              momentImageUrl: session.momentImageUrl,
              createdBy: session.createdBy,
              players: players,
              waitlist: waitlist,
              messages: [],
            }
        });
        
        setSessions(sessionsWithData);
        setAnnouncements(announcementData.map((a: any) => ({...a, date: getSafeDate(a.date)})));

    } catch (error: any) {
        console.error("Error fetching all data:", error);
        toast({ title: "Error", description: "Could not load data from the server.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);


  React.useEffect(() => {
    if (currentUser) {
        fetchAllData();
    } else {
        setLoading(false);
        setSessions([]);
        setAnnouncements([]);
    }
  }, [currentUser, fetchAllData]);

   React.useEffect(() => {
    if (!currentUser) return;

    // --- Granular update handlers ---
    const handlePlayerInsert = (payload: any) => {
      supabase.from('profiles').select('*').eq('id', payload.new.user_id).single().then(({data: profile}) => {
        if (profile) {
          setSessions(prev => prev.map(s => {
            if (s.id === payload.new.session_id) {
              if (s.players.some(p => p.id === profile.id)) return s;
              const newPlayers = [...s.players, profile];
              return { ...s, players: newPlayers };
            }
            return s;
          }));
        }
      });
    };

    const handlePlayerDelete = (payload: any) => {
      setSessions(prev => prev.map(s => {
        if (s.id === payload.old.session_id) {
          const newPlayers = s.players.filter(p => p.id !== payload.old.user_id);
          return { ...s, players: newPlayers };
        }
        return s;
      }));
    };

    const handleWaitlistInsert = (payload: any) => {
       supabase.from('profiles').select('*').eq('id', payload.new.user_id).single().then(({data: profile}) => {
        if (profile) {
          setSessions(prev => prev.map(s => {
            if (s.id === payload.new.session_id) {
              if (s.waitlist.some(p => p.id === profile.id)) return s;
              const newWaitlist = [...s.waitlist, profile];
              return { ...s, waitlist: newWaitlist };
            }
            return s;
          }));
        }
      });
    };

    const handleWaitlistDelete = (payload: any) => {
      setSessions(prev => prev.map(s => {
        if (s.id === payload.old.session_id) {
          const newWaitlist = s.waitlist.filter(p => p.id !== payload.old.user_id);
          return { ...s, waitlist: newWaitlist };
        }
        return s;
      }));
    };
    
    const handleSessionInsert = (payload: any) => {
        const newSession: Session = {
            ...payload.new,
            players: [],
            waitlist: [],
            messages: []
        };
        setSessions(prev => [...prev, newSession].sort((a,b) => getSafeDate(`${a.date}T${a.startTime}`).getTime() - getSafeDate(`${b.date}T${b.startTime}`).getTime()));
    };

    const handleSessionUpdate = (payload: any) => {
        setSessions(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
    };

    const handleSessionDelete = (payload: any) => {
        setSessions(prev => prev.filter(s => s.id !== payload.old.id));
    };

    const handleAnnouncementInsert = (payload: any) => {
      setAnnouncements(prev => [payload.new, ...prev]);
    }
    const handleAnnouncementUpdate = (payload: any) => {
      setAnnouncements(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
    }
    const handleAnnouncementDelete = (payload: any) => {
      setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
    }


    const channel = supabase.channel('public-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_players' }, handlePlayerInsert)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'session_players' }, handlePlayerDelete)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_waitlist' }, handleWaitlistInsert)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'session_waitlist' }, handleWaitlistDelete)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, handleSessionInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, handleSessionUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'sessions' }, handleSessionDelete)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, handleAnnouncementInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, handleAnnouncementUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, handleAnnouncementDelete)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time connection established.');
        }
        if (status === 'CHANNEL_ERROR' && err) {
          console.error('Real-time channel subscription error:', JSON.stringify(err, null, 2));
          toast({ title: "Connection Error", description: "Real-time updates have been paused. Reconnecting...", variant: "destructive" });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };

  }, [currentUser, toast]);

  const createSession = async (sessionData: any) => {
    if (!currentUser) return;
    const { error } = await supabase.from('sessions').insert({
        ...sessionData,
        createdBy: currentUser.id,
    });
    if(error) {
        console.error("Error creating session:", error);
        toast({ title: "Error", description: "Could not create the session.", variant: "destructive"});
    } else {
        toast({ title: "Session Created!", description: "The new session has been added.", variant: "success", duration: 1500});
    }
  };
  
  const updateSession = async (sessionData: Partial<Session> & { id: string }) => {
     const { id, ...updateData } = sessionData;

     const { error } = await supabase.from('sessions').update({
        ...updateData,
     }).eq('id', id);

     if(error) {
        console.error("Error updating session:", error);
        toast({ title: "Error", description: "Could not update the session.", variant: "destructive"});
     } else {
        toast({ title: "Session Updated", description: "The session details have been saved.", variant: "success", duration: 1500});
     }
  };
  
  const deleteSession = async (sessionId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if(error) {
        console.error("Error deleting session:", error);
        toast({ title: "Error", description: "Could not delete the session.", variant: "destructive"});
    } else {
        toast({ title: "Session Deleted", description: "The session has been removed.", variant: "success", duration: 1500});
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const originalSessions = sessions;
    
    setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId) {
            const newPlayers = s.players.some(p => p.id === currentUser.id) ? s.players : [...s.players, currentUser];
            const newWaitlist = s.waitlist.filter(p => p.id !== currentUser.id);
            return { ...s, players: newPlayers, waitlist: newWaitlist };
        }
        return s;
    }));

    try {
        await supabase.from('session_waitlist').delete().match({ session_id: sessionId, user_id: currentUser.id });
        const { error } = await supabase.from('session_players').insert({
            session_id: sessionId,
            user_id: currentUser.id
        });

        if (error) throw error;
        
        return true;
    } catch (error: any) {
        console.error("Error booking session:", JSON.stringify(error, null, 2));
        toast({ title: "Booking Error", description: error.message, variant: 'destructive'});
        setSessions(originalSessions);
        return false;
    }
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const originalSessions = sessions;

    setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId) {
            return { ...s, players: s.players.filter(p => p.id !== currentUser.id) };
        }
        return s;
    }));

    try {
        const { error } = await supabase.from('session_players').delete().match({ session_id: sessionId, user_id: currentUser.id });
        if (error) throw error;
        
        return true;
    } catch (error: any) {
        console.error("Error canceling booking:", error);
        toast({ title: "Cancellation Error", description: error.message, variant: 'destructive'});
        setSessions(originalSessions);
        return false;
    }
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const originalSessions = sessions;

    setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId && !s.waitlist.some(p => p.id === currentUser.id)) {
            return { ...s, waitlist: [...s.waitlist, currentUser] };
        }
        return s;
    }));
    
    try {
        const { error } = await supabase.from('session_waitlist').insert({
            session_id: sessionId,
            user_id: currentUser.id
        });
        if (error) throw error;

        return true;
    } catch (error: any) {
        console.error("Error joining waitlist:", error);
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        setSessions(originalSessions);
        return false;
    }
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;

     const originalSessions = sessions;

     setSessions(prevSessions => prevSessions.map(s => {
         if (s.id === sessionId) {
             return { ...s, waitlist: s.waitlist.filter(p => p.id !== currentUser.id) };
         }
         return s;
     }));
     
     try {
        const { error } = await supabase.from('session_waitlist').delete().match({ session_id: sessionId, user_id: currentUser.id });
        if (error) throw error;

        return true;
     } catch (error: any) {
        console.error("Error leaving waitlist:", error);
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        setSessions(originalSessions);
        return false;
    }
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const { error } = await supabase.from('announcements').insert({
        ...announcementData,
        date: new Date().toISOString()
    });
    if(error) {
        console.error("Error creating announcement:", error);
        toast({ title: "Error", description: "Could not create the announcement.", variant: "destructive"});
    } else {
        toast({ title: "Announcement Created!", description: "The new announcement is now live.", variant: "success", duration: 1500});
    }
  };

  const updateAnnouncement = async (announcementData: Omit<Announcement, 'date'> & {id: string}) => {
    const { id, ...updateData } = announcementData;
    const { error } = await supabase.from('announcements').update(updateData).eq('id', id);
    if(error) {
        console.error("Error updating announcement:", error);
        toast({ title: "Error", description: "Could not update the announcement.", variant: "destructive"});
    } else {
        toast({ title: "Announcement Updated", description: "The announcement has been saved.", variant: "success", duration: 1500});
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
     if(error) {
        console.error("Error deleting announcement:", error);
        toast({ title: "Error", description: "Could not delete the announcement.", variant: "destructive"});
    } else {
       toast({ title: "Announcement Deleted", description: "The announcement has been removed.", variant: "success", duration: 1500});
    }
  };
  
  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {};

  const contextValue = { 
        sessions, 
        announcements,
        loading,
        createSession, 
        updateSession, 
        deleteSession,
        bookSession,
        cancelBooking,
        joinWaitlist,
        leaveWaitlist,
        addMessage,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
     };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = React.useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
};
