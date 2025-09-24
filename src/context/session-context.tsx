
'use client';

import * as React from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { mockSessions, mockAnnouncements, mockDirectChats, mockUsers } from '@/lib/mock-data';

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date' | 'players' | 'waitlist'> & { date: string, players: User[], waitlist: User[] }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bookSession: (sessionId: string) => Promise<void>;
  cancelBooking: (sessionId: string) => Promise<void>;
  joinWaitlist: (sessionId: string) => Promise<void>;
  leaveWaitlist: (sessionId: string) => Promise<void>;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
  updateAnnouncement: (announcement: Omit<Announcement, 'date'>) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  directChats: DirectChat[];
  createDirectChat: (otherUser: User) => Promise<string>;
  addDirectMessage: (chatId: string, message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => Promise<void>;
  users: User[];
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

const getSafeDate = (date: string | Timestamp): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    // Add 'Z' to ensure UTC interpretation for ISO strings without it
    const dateString = typeof date === 'string' && !date.endsWith('Z') ? `${date}Z` : date;
    return new Date(dateString);
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { toast } = useToast();

  // --- Load Mock Data ---
  React.useEffect(() => {
    const enrichedSessions = mockSessions.map(session => ({
      ...session,
      players: (session.players as string[]).map(id => users.find(u => u.id === id)).filter(Boolean) as User[],
      waitlist: (session.waitlist as string[]).map(id => users.find(u => u.id === id)).filter(Boolean) as User[],
    }));
    setSessions(enrichedSessions.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    setAnnouncements(mockAnnouncements.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    setDirectChats(mockDirectChats);
  }, [users]);


  const showToast = (toastInfo: ToastInfo) => {
    toast({
      title: toastInfo.title,
      description: toastInfo.description,
      variant: toastInfo.variant,
    });
  };

  // --- In-memory State Operations ---

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => {
    if (!currentUser) return;
    const newSession: Session = {
      id: `s${Date.now()}`,
      ...sessionData,
      date: `${sessionData.date}T00:00:00`,
      players: [],
      waitlist: [],
      messages: [],
      createdBy: currentUser.id,
    };
    setSessions(prev => [newSession, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    showToast({ title: 'Session Created!', description: 'The new session has been successfully added.', variant: 'success' });
  };

  const updateSession = async (updatedSessionData: Omit<Session, 'date'| 'players' | 'waitlist'> & { date: string, players: User[], waitlist: User[] }) => {
     setSessions(prev => prev.map(s => s.id === updatedSessionData.id ? { ...s, ...updatedSessionData, date: `${updatedSessionData.date}T00:00:00` } : s));
     showToast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
  };
  
  const bookSession = async (sessionId: string) => {
    if (!currentUser) return;
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            if (session.players.length >= session.maxPlayers) {
                showToast({ title: 'Session Full', description: 'This session is full. You can join the waitlist.', variant: 'destructive' });
                return session;
            }
            if ((session.players as User[]).some(p => p.id === currentUser.id)) {
                showToast({ title: 'Already Registered', description: 'You are already registered for this session.', variant: 'destructive' });
                return session;
            }
            showToast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
            return {
                ...session,
                players: [...session.players, currentUser],
                waitlist: (session.waitlist as User[]).filter(p => p.id !== currentUser.id)
            };
        }
        return session;
    }));
  };
  
  const cancelBooking = async (sessionId: string) => {
    if (!currentUser) return;
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            const sessionDateTime = new Date(`${getSafeDate(session.date).toISOString().split('T')[0]}T${session.startTime}`);
            const now = new Date();
            const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilSession <= 12) {
                showToast({ title: 'Cancellation Period Over', description: 'You can only cancel a session more than 12 hours in advance.', variant: 'destructive' });
                return session;
            }

            const newPlayers = (session.players as User[]).filter(p => p.id !== currentUser.id);
            let newWaitlist = [...session.waitlist as User[]];
            
            // Promote from waitlist
            if (newWaitlist.length > 0) {
                const nextPlayer = newWaitlist.shift();
                if(nextPlayer) newPlayers.push(nextPlayer);
                 // In a real app, you'd send a notification to nextPlayerId here.
                console.log(`User ${nextPlayer?.name} moved from waitlist to session ${sessionId}.`);
            }
            
            showToast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
            return { ...session, players: newPlayers, waitlist: newWaitlist };
        }
        return session;
    }));
  };

  const joinWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
             if ((session.waitlist as User[]).some(p => p.id === currentUser.id) || (session.players as User[]).some(p => p.id === currentUser.id)) {
                showToast({ title: 'Action Not Allowed', description: 'You are already registered or on the waitlist.', variant: 'destructive' });
                return session;
            }
            showToast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
            return { ...session, waitlist: [...session.waitlist, currentUser] };
        }
        return session;
    }));
  };
  
  const leaveWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            showToast({ title: 'Removed from Waitlist', description: 'You have successfully left the waitlist.', variant: 'success' });
            return { ...session, waitlist: (session.waitlist as User[]).filter(p => p.id !== currentUser.id) };
        }
        return session;
    }));
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: currentUser, 
      content: messageContent.content,
      timestamp: new Date().toISOString(),
    };
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, newMessage] } : s));
  };

   const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      id: `a${Date.now()}`,
      ...announcementData,
      date: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    showToast({ title: 'Announcement Created!', description: 'The new announcement is now live.', variant: 'success' });
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'>) => {
    setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, ...announcement, date: a.date } : a));
    showToast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.', variant: 'success' });
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    showToast({ title: 'Announcement Deleted', description: 'The announcement has been removed.', variant: 'success' });
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    
    const existingChat = directChats.find(chat => chat.participantIds.includes(currentUser.id) && chat.participantIds.includes(otherUser.id));
    if (existingChat) {
      return existingChat.id;
    }
    
    const newChat: DirectChat = {
      id: `dc${Date.now()}`,
      participantIds: [currentUser.id, otherUser.id],
      participants: [currentUser, otherUser],
      messages: [],
    };
    setDirectChats(prev => [newChat, ...prev]);
    return newChat.id;
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
     if (!currentUser) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: new Date().toISOString(),
    };
    setDirectChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat));
  }

  return (
    <SessionContext.Provider
      value={{ 
        sessions, 
        announcements,
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
        directChats,
        createDirectChat,
        addDirectMessage,
        users,
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

export { getSafeDate };
