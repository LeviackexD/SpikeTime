

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
    // 1. Fetch sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*');

    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      setSessions([]);
    } else {
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

            const { data: playersData, error: playersError } = await supabase
                .from('session_players')
                .select('session_id, profiles!inner(*)');

            if (playersError) console.error("Error fetching session players:", playersError);

            const { data: waitlistData, error: waitlistError } = await supabase
                .from('session_waitlist')
                .select('session_id, profiles!inner(*)');
            if (waitlistError) console.error("Error fetching session waitlist:", waitlistError);
            
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
            })).sort((a, b) => getSafeDate(`${a.date}T${a.startTime}`).getTime() - getSafeDate(`${b.date}T${b.startTime}`).getTime());
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

  // Effect for initial data load and real-time subscriptions
  React.useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetchAllData().finally(() => setLoading(false));

      const channel = supabase.channel('public-db-changes');
      
      const subscription = channel
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
           console.log('Realtime change received, refetching data:', payload);
           fetchAllData();
        })
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Real-time channel subscribed successfully.');
            }
            if (status === 'CHANNEL_ERROR') {
                console.error('Real-time channel subscription error:', err);
                toast({
                    title: "Real-time connection error",
                    description: "Could not connect to live updates. Please refresh the page.",
                    variant: "destructive",
                });
            }
        });

      return () => {
          console.log('Unsubscribing from real-time channel.');
          supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
      setSessions([]);
      setAnnouncements([]);
    }
  }, [currentUser, toast, fetchAllData]);


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
        await fetchAllData();
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
        await fetchAllData();
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
        await fetchAllData();
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    const { error } = await supabase.rpc('book_session_and_leave_waitlist', {
      p_session_id: sessionId,
      p_user_id: currentUser.id
    });
    
    if (error) {
      console.error("Error booking session:", error);
      toast({ title: "Booking Error", description: error.message, variant: 'destructive'});
      return false;
    }
    
    await fetchAllData();
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
    
    await supabase.rpc('promote_from_waitlist', { session_id_arg: sessionId });
    await fetchAllData();
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
    await fetchAllData();
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
    await fetchAllData();
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
        await fetchAllData();
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
        await fetchAllData();
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
     if(error) {
        console.error("Error deleting announcement:", error);
        toast({ title: "Error", description: "Could not delete the announcement.", variant: "destructive"});
    } else {
       toast({ title: "Announcement Deleted", description: "The announcement has been removed.", variant: "success", duration: 1500});
       await fetchAllData();
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
