
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
  addMomentToSession: (sessionId: string, momentImageUrl: string) => Promise<boolean>;
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

  const fetchSessions = React.useCallback(async () => {
    // 1. Fetch all sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });

    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      setSessions([]); // Clear sessions on error
      return;
    }

    if (!sessionData) {
      setSessions([]);
      return;
    }
    
    const now = new Date();
    // 2-hour grace period after a session ends
    const gracePeriodEnd = new Date(now.getTime() - 2 * 60 * 60 * 1000); 

    const activeSessions = sessionData.filter(s => {
      const sessionEndDate = getSafeDate(`${s.date}T${s.endTime}`);
      return sessionEndDate > gracePeriodEnd;
    });
    
    const sessionIds = activeSessions.map(s => s.id);

    if (sessionIds.length === 0) {
      setSessions([]);
      return;
    }

    // 2. Fetch all players for the active sessions
    const { data: playersData, error: playersError } = await supabase
      .from('session_players')
      .select('session_id, profiles(*)')
      .in('session_id', sessionIds);

    if (playersError) {
      console.error("Error fetching session players:", playersError);
      // Continue without player data if this fails
    }

    // 3. Fetch all waitlisted users for the active sessions
    const { data: waitlistData, error: waitlistError } = await supabase
      .from('session_waitlist')
      .select('session_id, profiles(*)')
      .in('session_id', sessionIds);
      
    if (waitlistError) {
        console.error("Error fetching session waitlist:", waitlistError);
        // Continue without waitlist data if this fails
    }

    // 4. Combine the data on the client side
    const sessionsWithPlayers = activeSessions.map(session => {
        const players = playersData?.filter(p => p.session_id === session.id).map(p => p.profiles) as User[] || [];
        const waitlist = waitlistData?.filter(w => w.session_id === session.id).map(w => w.profiles) as User[] || [];
        return {
            ...session,
            players,
            waitlist,
            messages: [], // keep messages property
        };
    });

    setSessions(sessionsWithPlayers);
  }, []);


  const fetchAnnouncements = React.useCallback(async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if(error) {
          console.error("Error fetching announcements:", error);
          setAnnouncements([]);
          return;
      }
      setAnnouncements(data.map(a => ({...a, date: getSafeDate(a.date)})));
  }, []);

  React.useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    };
    
    const initialFetch = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchAnnouncements()]);
      setLoading(false);
    }
    initialFetch();

    const sessionChanges = supabase.channel('realtime-sessions-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSessions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, () => fetchSessions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_waitlist' }, () => fetchSessions())
      .subscribe();

    const announcementChanges = supabase.channel('realtime-announcements-all')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchAnnouncements())
        .subscribe();
    
    return () => {
        supabase.removeChannel(sessionChanges);
        supabase.removeChannel(announcementChanges);
    }

  }, [currentUser, fetchSessions, fetchAnnouncements]);


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
     const { error } = await supabase.from('sessions').update(updateData).eq('id', id);

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
    const { error } = await supabase.rpc('handle_booking', { session_id_arg: sessionId });
    
    if (error) {
      console.error("Error booking session (RPC):", error);
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const { error } = await supabase.rpc('handle_cancellation', { session_id_arg: sessionId });

    if (error) {
        console.error("Error canceling booking (RPC):", error);
        toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        return false;
    }
    return true;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const { error } = await supabase.from('session_waitlist').insert({
        session_id: sessionId,
        user_id: currentUser.id
    });

    if (error) {
        console.error("Error joining waitlist:", error);
        toast({ title: "Failed to Join", description: error.message, variant: "destructive" });
        return false;
    }
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;
     const { error } = await supabase.from('session_waitlist').delete()
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id);

     if (error) {
        console.error("Error leaving waitlist:", error);
        toast({ title: "Action Failed", description: error.message, variant: "destructive" });
        return false;
    }
    return true;
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

  const addMomentToSession = async (sessionId: string, momentImageUrl: string): Promise<boolean> => {
    const { error } = await supabase
      .from('sessions')
      .update({ momentImageUrl })
      .eq('id', sessionId);

    if (error) {
      console.error('Error adding moment to session:', error);
      return false;
    }
    // The real-time subscription will handle updating the state
    return true;
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
        addMomentToSession,
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
