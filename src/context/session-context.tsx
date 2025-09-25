
'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement, DirectChat } from '@/lib/types';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  loading: boolean;
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date' | 'createdBy'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages' | 'createdBy'> & { date: string, id: string, players: User[], waitlist: User[] }) => Promise<void>;
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

export const getSafeDate = (date: string | Date): Date => {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  // Handles date strings like '2024-10-02'. Appending 'T00:00:00Z' ensures it's parsed as midnight UTC.
  // This is the most reliable way to prevent timezone shifts.
  const dateString = String(date);
  const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
  
  if (!isNaN(d.getTime())) {
    return d;
  }
  // Fallback for invalid dates
  return new Date();
};


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
      return [];
    }
    
    return sessionData.map(s => ({
      ...s,
      date: getSafeDate(s.date),
      messages: [], // Chat messages not implemented in DB yet
    }));
  }, []);

  const fetchAnnouncements = React.useCallback(async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if(error) {
          console.error("Error fetching announcements:", error);
          return [];
      }
      return data.map(a => ({...a, date: getSafeDate(a.date)}));
  }, []);

  // Initial fetch and real-time subscriptions
  React.useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    };
    
    setLoading(true);
    Promise.all([fetchSessions(), fetchAnnouncements()]).then(([sessionRes, announcementRes]) => {
      setSessions(sessionRes);
      setAnnouncements(announcementRes);
      setLoading(false);
    });

    const sessionChanges = supabase.channel('sessions-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSessions().then(setSessions))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, () => fetchSessions().then(setSessions))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_waitlist' }, () => fetchSessions().then(setSessions))
      .subscribe();

    const announcementChanges = supabase.channel('announcements-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchAnnouncements().then(setAnnouncements))
        .subscribe();
    
    return () => {
        supabase.removeChannel(sessionChanges);
        supabase.removeChannel(announcementChanges);
    }

  }, [currentUser, fetchSessions, fetchAnnouncements]);


  const createSession = async (sessionData: Omit<Session, 'id' | 'players'| 'waitlist'|'messages' | 'date' | 'createdBy'> & { date: string }) => {
    if (!currentUser) return;
    const { error } = await supabase.from('sessions').insert({
        ...sessionData,
        date: sessionData.date, // Already a string
        createdBy: currentUser.id,
    });
    if(error) {
        console.error("Error creating session:", error);
        toast({ title: "Error", description: "Could not create the session.", variant: "destructive"});
    } else {
        toast({ title: "Session Created!", description: "The new session has been added.", variant: "success"});
        fetchSessions().then(setSessions);
    }
  };
  
  const updateSession = async (sessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'| 'createdBy'> & { date: string, id: string, players: User[], waitlist: User[] }) => {
     const { id, ...updateData } = sessionData;
     const { error } = await supabase.from('sessions').update({
         ...updateData,
         date: sessionData.date,
     }).eq('id', id);

     if(error) {
        console.error("Error updating session:", error);
        toast({ title: "Error", description: "Could not update the session.", variant: "destructive"});
     } else {
        toast({ title: "Session Updated", description: "The session details have been saved.", variant: "success"});
        fetchSessions().then(setSessions);
     }
  };
  
  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if(error) {
        console.error("Error deleting session:", error);
        toast({ title: "Error", description: "Could not delete the session.", variant: "destructive"});
    } else {
        toast({ title: "Session Deleted", description: "The session has been removed.", variant: "success"});
        fetchSessions().then(setSessions);
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    const { error } = await supabase.rpc('handle_booking', { session_id_arg: sessionId });

    if (error) {
        console.error("Error booking session (RPC):", error);
        return false;
    }
    fetchSessions().then(setSessions);
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const { error } = await supabase.rpc('handle_cancellation', { session_id_arg: sessionId });
    
    if (error) {
        console.error("Error canceling booking (RPC):", error);
        return false;
    }
    fetchSessions().then(setSessions);
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
        return false;
    }
    fetchSessions().then(setSessions);
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;
     const { error } = await supabase.from('session_waitlist').delete()
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id);
     
     if (error) {
        console.error("Error leaving waitlist:", error);
        return false;
    }
    fetchSessions().then(setSessions);
    return true;
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const { error } = await supabase.from('announcements').insert({
        ...announcementData,
        date: new Date().toISOString().split('T')[0] // Use current date
    });
    if(error) {
        console.error("Error creating announcement:", error);
        toast({ title: "Error", description: "Could not create the announcement.", variant: "destructive"});
    } else {
        toast({ title: "Announcement Created!", description: "The new announcement is now live.", variant: "success"});
        fetchAnnouncements().then(setAnnouncements);
    }
  };

  const updateAnnouncement = async (announcementData: Omit<Announcement, 'date'> & {id: string}) => {
    const { id, ...updateData } = announcementData;
    const { error } = await supabase.from('announcements').update(updateData).eq('id', id);
    if(error) {
        console.error("Error updating announcement:", error);
        toast({ title: "Error", description: "Could not update the announcement.", variant: "destructive"});
    } else {
        toast({ title: "Announcement Updated", description: "The announcement has been saved.", variant: "success"});
        fetchAnnouncements().then(setAnnouncements);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
     if(error) {
        console.error("Error deleting announcement:", error);
        toast({ title: "Error", description: "Could not delete the announcement.", variant: "destructive"});
    } else {
        toast({ title: "Announcement Deleted", description: "The announcement has been removed.", variant: "success"});
        fetchAnnouncements().then(setAnnouncements);
    }
  };
  
  // The following functions are placeholders and not connected to DB yet.
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
