
'use client';

import * as React from 'react';
import type { Session, Message, User, DirectChat } from '@/lib/types';
import { mockDirectChats, currentUser } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

interface SessionContextType {
  sessions: Session[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'>) => void;
  updateSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  bookSession: (sessionId: string) => void;
  cancelBooking: (sessionId: string) => void;
  joinWaitlist: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  directChats: DirectChat[];
  createDirectChat: (user: User) => string;
  addDirectMessage: (chatId: string, message: Message) => void;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const { toast } = useToast();
  const { requestPermission, showNotification, isPermissionGranted } = useNotifications();
  const scheduledNotificationsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  React.useEffect(() => {
    const sessionsCollection = collection(db, 'sessions');
    const unsubscribe = onSnapshot(sessionsCollection, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Convert Firestore Timestamps to ISO strings
          date: (data.date as Timestamp).toDate().toISOString(),
        } as Session;
      }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSessions(sessionsData);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  React.useEffect(() => {
    if (isPermissionGranted && currentUser) {
      const upcomingSessions = sessions.filter(session =>
        session.players.some(p => p.id === currentUser.id) && new Date(`${session.date.split('T')[0]}T${session.startTime}`) > new Date()
      );

      upcomingSessions.forEach(session => {
        const sessionDateTime = new Date(`${session.date.split('T')[0]}T${session.startTime}`);
        const notificationTime = new Date(sessionDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
        const now = new Date();
        
        const notificationId = `session-reminder-${session.id}`;

        if (notificationTime > now && !scheduledNotificationsRef.current.has(notificationId)) {
          const timeout = notificationTime.getTime() - now.getTime();
          
          setTimeout(() => {
            showNotification('Session Reminder', {
              body: `Your ${session.level} session starts in 2 hours at ${session.location}.`,
              icon: '/volleyball-icon.png'
            });
            scheduledNotificationsRef.current.delete(notificationId);
          }, timeout);

          scheduledNotificationsRef.current.add(notificationId);
        }
      });
    }
  }, [sessions, isPermissionGranted, showNotification]);


  const showToast = (toastInfo: ToastInfo) => {
    toast({
      title: toastInfo.title,
      description: toastInfo.description,
      variant: toastInfo.variant,
    });
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'>) => {
    try {
      const newSessionDoc = {
        ...sessionData,
        date: Timestamp.fromDate(new Date(sessionData.date)),
        players: [],
        waitlist: [],
        messages: [],
      };
      await addDoc(collection(db, "sessions"), newSessionDoc);
      showToast({
        title: 'Session Created!',
        description: 'The new session has been successfully added.',
        variant: 'success',
      });
    } catch (error) {
      console.error("Error creating session: ", error);
      showToast({
        title: 'Creation Failed',
        description: 'Could not create the new session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateSession = async (updatedSession: Session) => {
    const sessionRef = doc(db, 'sessions', updatedSession.id);
    try {
        const { id, ...dataToUpdate } = updatedSession;
        await updateDoc(sessionRef, {
            ...dataToUpdate,
            date: Timestamp.fromDate(new Date(dataToUpdate.date)),
        });
        showToast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
    } catch (error) {
        console.error("Error updating session: ", error);
        showToast({ title: 'Update Failed', description: 'Could not update the session. Please try again.', variant: 'destructive' });
    }
  };

  const deleteSession = async (sessionId: string) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    try {
        await deleteDoc(sessionRef);
        showToast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
    } catch (error) {
        console.error("Error deleting session: ", error);
        showToast({ title: 'Deletion Failed', description: 'Could not delete the session. Please try again.', variant: 'destructive' });
    }
  };
  
  const bookSession = async (sessionId: string) => {
    if (!currentUser) return;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const sessionRef = doc(db, 'sessions', sessionId);
    
    try {
      await updateDoc(sessionRef, {
        players: arrayUnion(currentUser)
      });
      showToast({
        title: 'Booking Confirmed!',
        description: `You're all set for the ${session.level} session.`,
        variant: 'success',
      });
    } catch (error) {
       showToast({
        title: 'Booking Failed',
        description: 'Could not book your spot. Please try again.',
        variant: 'destructive',
      });
      console.error("Error booking session: ", error);
    }
  };

  const joinWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
     const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);

    try {
       await updateDoc(sessionRef, {
        waitlist: arrayUnion(currentUser)
      });
      showToast({
          title: 'You are on the waitlist!',
          description: "We'll notify you if a spot opens up.",
          variant: 'success'
      });
    } catch(error) {
       showToast({
        title: 'Waitlist Failed',
        description: 'Could not join the waitlist. Please try again.',
        variant: 'destructive',
      });
      console.error("Error joining waitlist: ", error);
    }
  };

  const cancelBooking = async (sessionId: string) => {
    if (!currentUser) return;
    const sessionRef = doc(db, 'sessions', sessionId);

    try {
      await updateDoc(sessionRef, {
        players: arrayRemove(currentUser)
      });
       showToast({
            title: 'Booking Canceled',
            description: 'Your spot has been successfully canceled.',
            variant: 'destructive',
        });
    } catch (error) {
        showToast({
            title: 'Cancellation Failed',
            description: 'Could not cancel your spot. Please try again.',
            variant: 'destructive',
        });
        console.error("Error canceling booking: ", error);
    }
  };

  const addMessage = (sessionId: string, message: Message) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      )
    );
  };

  const createDirectChat = (user: User) => {
    if (!currentUser) return '';
    const newChat: DirectChat = {
        id: `dc${Date.now()}`,
        participants: [currentUser, user],
        messages: [],
    };
    setDirectChats(prev => [...prev, newChat]);
    return newChat.id;
  }

  const addDirectMessage = (chatId: string, message: Message) => {
    setDirectChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
  }

  return (
    <SessionContext.Provider
      value={{ 
        sessions, 
        createSession, 
        updateSession, 
        deleteSession, 
        bookSession, 
        cancelBooking, 
        joinWaitlist, 
        addMessage,
        directChats,
        createDirectChat,
        addDirectMessage,
    }}
    >
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
