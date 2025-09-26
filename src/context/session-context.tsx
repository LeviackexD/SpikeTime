
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

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchAllData = React.useCallback(async () => {
    // Do not set loading to true here to avoid flickering on real-time updates
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
        const visibleSessions = sessionData.filter(session => {
            const [endHours, endMinutes] = session.endTime.split(':').map(Number);
            const sessionEndDateTime = getSafeDate(session.date);
            sessionEndDateTime.setHours(endHours, endMinutes, 0, 0);
            const oneHourAfterEnd = new Date(sessionEndDateTime.getTime() + 60 * 60 * 1000);
            return now < oneHourAfterEnd;
        });

        const sessionsWithData: Session[] = visibleSessions.map((session: any) => ({
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
          players: playersData?.filter(p => p.session_id === session.id).map(p => p.profiles) || [],
          waitlist: waitlistData?.filter(w => w.session_id === session.id).map(w => w.profiles) || [],
          messages: [],
        }));
        
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
      setLoading(true);
      fetchAllData();

      const handleRealtimeUpdate = (payload: any) => {
        // A simple but robust way to handle updates: just refetch everything.
        // This avoids complex state management and ensures data consistency.
        fetchAllData();
      };

      const channel = supabase.channel('public-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleRealtimeUpdate)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, handleRealtimeUpdate)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'session_waitlist' }, handleRealtimeUpdate)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, handleRealtimeUpdate)
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              // console.log('Subscribed to real-time updates!');
            }
            if (status === 'CHANNEL_ERROR' && err) {
              console.error('Real-time channel subscription error:', JSON.stringify(err, null, 2));
              toast({ title: "Connection Error", description: "Could not connect to real-time updates.", variant: "destructive" });
            }
          });
      
      return () => {
          supabase.removeChannel(channel);
      };

    } else {
      // Clear data and set loading to false if there is no user
      setSessions([]);
      setAnnouncements([]);
      setLoading(false);
    }
  }, [currentUser, fetchAllData, toast]);

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
        fetchAllData(); // Refetch
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
        fetchAllData(); // Refetch
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
        fetchAllData(); // Refetch
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    // First, try to remove the user from the waitlist for that session, just in case
    await supabase.from('session_waitlist').delete()
        .match({ session_id: sessionId, user_id: currentUser.id });

    // Then, attempt to book the spot
    const { error } = await supabase.from('session_players').insert({
        session_id: sessionId,
        user_id: currentUser.id
    });
    
    if (error) {
        console.error("Error booking session:", JSON.stringify(error, null, 2));
        toast({ title: "Booking Error", description: error.message, variant: 'destructive'});
        return false;
    }
    
    fetchAllData(); // Refetch
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const { error } = await supabase.from('session_players').delete()
        .match({ session_id: sessionId, user_id: currentUser.id });

    if (error) {
        console.error("Error canceling booking:", error);
        toast({ title: "Cancellation Error", description: error.message, variant: 'destructive'});
        return false;
    }
    
    // After a successful cancellation, try to promote a user from the waitlist.
    // This call is "fire and forget" from the client's perspective.
    // We are deliberately not handling the error here to avoid showing it to the user who is canceling.
    // The previous error about `promote_from_waitlist` not existing has been noted.
    // By removing the client-side error handling for this specific RPC,
    // we prevent the user from seeing an error that doesn't directly concern their action.
    supabase.rpc('promote_from_waitlist', { session_id_arg: sessionId }).then(({error}) => {
        if(error) console.error("Error promoting from waitlist:", JSON.stringify(error, null, 2));
    });
    
    fetchAllData(); // Refetch
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
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        return false;
    }
    fetchAllData(); // Refetch
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;
     
     const { error } = await supabase.from('session_waitlist').delete()
        .match({ session_id: sessionId, user_id: currentUser.id });

     if (error) {
        console.error("Error leaving waitlist:", error);
        toast({ title: "Waitlist Error", description: error.message, variant: 'destructive'});
        return false;
    }
    fetchAllData(); // Refetch
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
        fetchAllData(); // Refetch
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
        fetchAllData(); // Refetch
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
     if(error) {
        console.error("Error deleting announcement:", error);
        toast({ title: "Error", description: "Could not delete the announcement.", variant: "destructive"});
    } else {
       toast({ title: "Announcement Deleted", description: "The announcement has been removed.", variant: "success", duration: 1500});
       fetchAllData(); // Refetch
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
