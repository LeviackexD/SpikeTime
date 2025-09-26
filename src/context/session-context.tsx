

'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement } from '@/lib/types';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { getSafeDate } from '@/lib/utils';

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

// --- IMPORTANT ---
// Real-time functionality requires you to enable replication on the tables in Supabase.
// Go to your Supabase project's SQL Editor and run the following commands:
//
// ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
// ALTER PUBLICATION supabase_realtime ADD TABLE session_players;
// ALTER PUBLICATION supabase_realtime ADD TABLE session_waitlist;
// ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
// -----------------

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchAllData = React.useCallback(async () => {
    // 1. Fetch sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*');

    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      setSessions([]);
    } else {
        // Filter out old sessions (older than 1 hour past endTime)
        const now = new Date();
        const visibleSessions = sessionData.filter(session => {
            const [endHours, endMinutes] = session.endTime.split(':').map(Number);
            const sessionEndDateTime = getSafeDate(session.date);
            sessionEndDateTime.setHours(endHours, endMinutes, 0, 0);
            
            const oneHourAfterEnd = new Date(sessionEndDateTime.getTime() + 60 * 60 * 1000);

            return now < oneHourAfterEnd;
        });

        if (visibleSessions.length > 0) {
            const sessionIds = visibleSessions.map(s => s.id);

            // 2. Fetch all players for these sessions
            const { data: playersData, error: playersError } = await supabase
                .from('session_players')
                .select('session_id, profiles!inner(*)')
                .in('session_id', sessionIds);

            if (playersError) console.error("Error fetching session players:", playersError);

            // 3. Fetch all waitlisted users for these sessions
            const { data: waitlistData, error: waitlistError } = await supabase
                .from('session_waitlist')
                .select('session_id, profiles!inner(*)')
                .in('session_id', sessionIds);

            if (waitlistError) console.error("Error fetching session waitlist:", waitlistError);
            
            // 4. Combine the data
            const sessionsWithData: Session[] = visibleSessions.map((session: any) => {
              const sessionPlayers = playersData?.filter(p => p.session_id === session.id).map(p => p.profiles) || [];
              const sessionWaitlist = waitlistData?.filter(w => w.session_id === session.id).map(w => w.profiles) || [];
              
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
                players: sessionPlayers,
                waitlist: sessionWaitlist,
                messages: [],
              };
            });
            setSessions(sessionsWithData);
        } else {
            setSessions([]);
        }
    }
    
    // Fetch announcements
    const { data: announcementData, error: announcementError } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if(announcementError) {
        console.error("Error fetching announcements:", announcementError);
        setAnnouncements([]);
    } else {
        setAnnouncements(announcementData.map((a: any) => ({...a, date: getSafeDate(a.date)})));
    }
  }, []);

  React.useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    };
    
    const initialFetch = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    }
    initialFetch();

    const handleDbChange = (payload: any) => {
      console.log('Real-time change detected, refetching data:', payload);
      fetchAllData();
    }

    const channel = supabase.channel('spiketime-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleDbChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, handleDbChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_waitlist' }, handleDbChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, handleDbChange)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time channel!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Real-time channel error:', err);
        }
         if (status === 'TIMED_OUT') {
          console.warn('Real-time channel subscription timed out.');
        }
      });
    
    return () => {
        supabase.removeChannel(channel);
    }

  }, [currentUser, fetchAllData]);


  const createSession = async (sessionData: any) => {
    if (!currentUser) return;
    toast({ title: "Session Created!", description: "The new session has been added.", variant: "success", duration: 1500});
    const { error } = await supabase.from('sessions').insert({
        ...sessionData,
        createdBy: currentUser.id,
    });
    if(error) {
        console.error("Error creating session:", error);
        toast({ title: "Error", description: "Could not create the session.", variant: "destructive"});
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

    const originalSessions = sessions;
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: "Session Deleted", description: "The session has been removed.", variant: "success", duration: 1500});

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if(error) {
        console.error("Error deleting session:", error);
        toast({ title: "Error", description: "Could not delete the session.", variant: "destructive"});
        setSessions(originalSessions); // Revert on failure
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    // Optimistic UI update
    setSessions(prevSessions => {
        return prevSessions.map(s => {
            if (s.id === sessionId) {
                const players = s.players.filter(p => p.id !== currentUser.id).concat(currentUser);
                const waitlist = s.waitlist.filter(p => p.id !== currentUser.id);
                return { ...s, players, waitlist };
            }
            return s;
        });
    });


    // Remove from waitlist first (if exists)
    await supabase.from('session_waitlist').delete().match({ session_id: sessionId, user_id: currentUser.id });

    // Insert into players
    const { error } = await supabase.from('session_players').insert({
        session_id: sessionId,
        user_id: currentUser.id
    });
    
    if (error) {
      console.error("Error booking session:", error);
      toast({ title: "Booking Error", description: error.message, variant: 'destructive'});
      fetchAllData(); // Re-fetch to ensure UI is correct
      return false;
    }
    // Let the real-time push handle broadcasting to others, but our UI is already updated.
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

     // Optimistic UI update
    setSessions(prevSessions => {
        return prevSessions.map(s => {
            if (s.id === sessionId) {
                const players = s.players.filter(p => p.id !== currentUser.id);
                return { ...s, players };
            }
            return s;
        });
    });

    const { error } = await supabase.from('session_players').delete()
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id);

    if (error) {
        console.error("Error canceling booking:", error);
        toast({ title: "Cancellation Error", description: error.message, variant: 'destructive'});
        fetchAllData(); // Re-fetch to ensure UI is correct
        return false;
    }

    // After successfully canceling, try to promote someone from the waitlist.
    // This function should be defined in your Supabase DB.
    await supabase.rpc('promote_from_waitlist', { session_id_arg: sessionId });
    return true;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    // Optimistic UI update
    setSessions(prevSessions => {
        return prevSessions.map(s => {
            if (s.id === sessionId && !s.waitlist.some(p => p.id === currentUser.id)) {
                const waitlist = s.waitlist.concat(currentUser);
                return { ...s, waitlist };
            }
            return s;
        });
    });

    const { error } = await supabase.from('session_waitlist').insert({
        session_id: sessionId,
        user_id: currentUser.id
    });

    if (error) {
        console.error("Error joining waitlist:", error);
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        fetchAllData(); // Re-fetch to ensure UI is correct
        return false;
    }
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;

    // Optimistic UI update
    setSessions(prevSessions => {
        return prevSessions.map(s => {
            if (s.id === sessionId) {
                const waitlist = s.waitlist.filter(p => p.id !== currentUser.id);
                return { ...s, waitlist };
            }
            return s;
        });
    });

     const { error } = await supabase.from('session_waitlist').delete()
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id);

     if (error) {
        console.error("Error leaving waitlist:", error);
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        fetchAllData(); // Re-fetch to ensure UI is correct
        return false;
    }
    return true;
  };


  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    toast({ title: "Announcement Created!", description: "The new announcement is now live.", variant: "success", duration: 1500});
    const { error } = await supabase.from('announcements').insert({
        ...announcementData,
        date: new Date().toISOString()
    });
    if(error) {
        console.error("Error creating announcement:", error);
        toast({ title: "Error", description: "Could not create the announcement.", variant: "destructive"});
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

    