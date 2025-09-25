
'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement, DirectChat } from '@/lib/types';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { getSafeDate, toYYYYMMDD } from '@/lib/utils';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  loading: boolean;
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'createdBy'>) => Promise<void>;
  updateSession: (session: Omit<Session, 'messages' | 'createdBy'>) => Promise<void>;
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

  const fetchSessions = React.useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*, players:profiles!session_players(*), waitlist:profiles!session_waitlist(*)')
      .order('date', { ascending: false });
  
    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      return [];
    }
  
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
    const fetchedSessions = sessionData.filter(s => {
      const sessionEndDate = getSafeDate(s.date);
      const [endHours, endMinutes] = s.endTime.split(':').map(Number);
      sessionEndDate.setUTCHours(endHours, endMinutes, 0, 0);
      return sessionEndDate > gracePeriodEnd;
    }).map(s => ({
      ...s,
      date: getSafeDate(s.date),
      messages: [],
    }));
    setSessions(fetchedSessions);
  }, []);

  const fetchAnnouncements = React. useCallback(async () => {
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
    
    setLoading(true);
    const initialFetch = async () => {
      await Promise.all([fetchSessions(), fetchAnnouncements()]);
      setLoading(false);
    }
    initialFetch();

    const handleRealtimeUpdate = (payload: any) => {
      // console.log("Realtime change detected, refetching sessions:", payload);
      fetchSessions();
    };
    
    const handleAnnouncementUpdate = (payload: any) => {
        fetchAnnouncements();
    }

    const sessionChanges = supabase.channel('sessions-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleRealtimeUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, handleRealtimeUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_waitlist' }, handleRealtimeUpdate)
      .subscribe();

    const announcementChanges = supabase.channel('announcements-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, handleAnnouncementUpdate)
        .subscribe();
    
    return () => {
        supabase.removeChannel(sessionChanges);
        supabase.removeChannel(announcementChanges);
    }

  }, [currentUser, fetchSessions, fetchAnnouncements]);


  const createSession = async (sessionData: Omit<Session, 'id' | 'players'| 'waitlist'|'messages' | 'createdBy'>) => {
    if (!currentUser) return;
    const { error } = await supabase.from('sessions').insert({
        ...sessionData,
        date: (sessionData.date as Date).toISOString(),
        createdBy: currentUser.id,
    });
    if(error) {
        console.error("Error creating session:", error);
        toast({ title: "Error", description: "Could not create the session.", variant: "destructive"});
    } else {
        toast({ title: "Session Created!", description: "The new session has been added.", variant: "success", duration: 1500});
    }
  };
  
  const updateSession = async (sessionData: Omit<Session, 'messages' | 'createdBy'>) => {
     const { id, players, waitlist, ...updateData } = sessionData;
     const { error } = await supabase.from('sessions').update({
         ...updateData,
         date: (sessionData.date as Date).toISOString(),
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

    // Optimistic update
    setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if(error) {
        console.error("Error deleting session:", error);
        toast({ title: "Error", description: "Could not delete the session.", variant: "destructive"});
        // Rollback
        setSessions(originalSessions);
    } else {
        toast({ title: "Session Deleted", description: "The session has been removed.", variant: "success", duration: 1500});
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const originalSessions = sessions;
    
    // Optimistic update
    setSessions(prevSessions => prevSessions.map(s => 
        s.id === sessionId 
          ? { ...s, players: [...s.players, currentUser] } 
          : s
    ));
    
    const { error } = await supabase.rpc('handle_booking', { session_id_arg: sessionId });
    
    if (error) {
      console.error("Error booking session (RPC):", error);
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
      // Rollback optimistic update on failure
      setSessions(originalSessions);
      return false;
    }
    
    // Manually trigger a refetch for others after success, as a fallback for realtime
    fetchSessions();
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const originalSessions = sessions;

    // Optimistic update
    setSessions(prevSessions => prevSessions.map(s =>
        s.id === sessionId
          ? { ...s, players: s.players.filter(p => p.id !== currentUser.id) }
          : s
    ));

    const { error } = await supabase.rpc('handle_cancellation', { session_id_arg: sessionId });

    if (error) {
        console.error("Error canceling booking (RPC):", error);
        toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        // Rollback optimistic update on failure
        setSessions(originalSessions);
        return false;
    }
    
    // Manually trigger a refetch for others after success, as a fallback for realtime
    fetchSessions();
    return true;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const originalSessions = sessions;

    // Optimistic update
    setSessions(prevSessions => prevSessions.map(s =>
        s.id === sessionId
          ? { ...s, waitlist: [...s.waitlist, currentUser] }
          : s
    ));

    const { error } = await supabase.from('session_waitlist').insert({
        session_id: sessionId,
        user_id: currentUser.id
    });

    if (error) {
        console.error("Error joining waitlist:", error);
        toast({ title: "Failed to Join", description: error.message, variant: "destructive" });
        // Rollback optimistic update on failure
        setSessions(originalSessions);
        return false;
    }

    fetchSessions(); // Refetch to ensure consistency
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;
     const originalSessions = sessions;

     // Optimistic update
     setSessions(prevSessions => prevSessions.map(s =>
         s.id === sessionId
           ? { ...s, waitlist: s.waitlist.filter(p => p.id !== currentUser.id) }
           : s
     ));
     
     const { error } = await supabase.from('session_waitlist').delete()
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id);

     if (error) {
        console.error("Error leaving waitlist:", error);
        toast({ title: "Action Failed", description: error.message, variant: "destructive" });
        // Rollback optimistic update on failure
        setSessions(originalSessions);
        return false;
    }
    
    fetchSessions(); // Refetch to ensure consistency
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
    const originalAnnouncements = announcements;
    // Optimistic update
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));

    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
     if(error) {
        console.error("Error deleting announcement:", error);
        toast({ title: "Error", description: "Could not delete the announcement.", variant: "destructive"});
        // Rollback
        setAnnouncements(originalAnnouncements);
    } else {
        toast({ title: "Announcement Deleted", description: "The announcement has been removed.", variant: "success", duration: 1500});
    }
  };
  
  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {};

  return (
    <SessionContext.Provider value={{ 
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
     }}>
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
    
    