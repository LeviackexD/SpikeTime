
'use client';

import * as React from 'react';
import type { Session, Message, User, DirectChat } from '@/lib/types';
import { mockSessions, mockDirectChats, currentUser } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';

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
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const { toast } = useToast();
  const { requestPermission, showNotification, isPermissionGranted } = useNotifications();
  const scheduledNotificationsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  React.useEffect(() => {
    if (isPermissionGranted && currentUser) {
      const upcomingSessions = sessions.filter(session =>
        session.players.some(p => p.id === currentUser.id) && new Date(`${session.date}T${session.startTime}`) > new Date()
      );

      upcomingSessions.forEach(session => {
        const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
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

  const createSession = (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'>) => {
     if (!currentUser || currentUser.role !== 'admin') {
      showToast({ title: 'Unauthorized', description: 'Only admins can create sessions.', variant: 'destructive' });
      return;
    }
    const newSession: Session = {
        id: `s${sessions.length + 1}`,
        ...sessionData,
        players: [],
        waitlist: [],
        messages: [],
        createdBy: currentUser.id
    };
    setSessions(prev => [...prev, newSession]);
    showToast({
        title: 'Session Created!',
        description: 'The new session has been successfully added locally.',
        variant: 'success',
    });
  };

  const updateSession = (updatedSession: Session) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    showToast({ title: 'Session Updated', description: 'The session has been successfully updated locally.', variant: 'success' });
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast({ title: 'Session Deleted', description: 'The session has been successfully deleted locally.', variant: 'success' });
  };
  
  const bookSession = (sessionId: string) => {
    if (!currentUser) return;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    setSessions(prev => prev.map(s => 
        s.id === sessionId 
        ? { ...s, players: [...s.players, currentUser] } 
        : s
    ));
    showToast({
        title: 'Booking Confirmed!',
        description: `You're all set for the ${session.level} session.`,
        variant: 'success',
    });
  };

  const cancelBooking = (sessionId: string) => {
    if (!currentUser) return;
    
    setSessions(prev => prev.map(s => 
        s.id === sessionId 
        ? { ...s, players: s.players.filter(p => p.id !== currentUser.id) } 
        : s
    ));
    showToast({
        title: 'Booking Canceled',
        description: 'Your spot has been successfully canceled.',
        variant: 'success',
    });
  };

  const joinWaitlist = (sessionId: string) => {
    if (!currentUser) return;
    
    setSessions(prev => prev.map(s => 
        s.id === sessionId 
        ? { ...s, waitlist: [...s.waitlist, currentUser] } 
        : s
    ));
    showToast({
        title: 'You are on the waitlist!',
        description: "We'll notify you if a spot opens up.",
        variant: 'success'
    });
  };

  const addMessage = (sessionId: string, message: Message) => {
    setSessions(prev => prev.map(s => 
        s.id === sessionId 
        ? { ...s, messages: [...s.messages, message] }
        : s
    ));
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
