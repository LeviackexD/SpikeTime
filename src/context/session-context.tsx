
'use client';

import * as React from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { mockSessions, mockAnnouncements, mockDirectChats, mockUsers } from '@/lib/mock-data';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date' | 'players' | 'waitlist'> & { date: string, players: User[], waitlist: User[] }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bookSession: (sessionId: string) => Promise<boolean>;
  cancelBooking: (sessionId: string) => Promise<boolean>;
  joinWaitlist: (sessionId: string) => Promise<boolean>;
  leaveWaitlist: (sessionId: string) => Promise<boolean>;
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
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(mockAnnouncements);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { toast } = useToast();

  React.useEffect(() => {
    // Sort initial data
    setSessions(prev => [...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    setAnnouncements(prev => [...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
  }, []);


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
    toast({ title: 'Session Created!', description: 'The new session has been successfully added.', variant: 'success' });
  };

  const updateSession = async (updatedSessionData: Omit<Session, 'date'| 'players' | 'waitlist'> & { date: string, players: User[], waitlist: User[] }) => {
     setSessions(prev => prev.map(s => s.id === updatedSessionData.id ? { ...s, ...updatedSessionData, date: `${updatedSessionData.date}T00:00:00` } : s));
     toast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            if (session.players.length >= session.maxPlayers) {
                return session;
            }
            if ((session.players as User[]).some(p => p.id === currentUser.id)) {
                return session;
            }
            success = true;
            return {
                ...session,
                players: [...session.players, currentUser],
                waitlist: (session.waitlist as User[]).filter(p => p.id !== currentUser.id)
            };
        }
        return session;
    }));

    return success;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;

    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            const sessionDateTime = new Date(`${getSafeDate(session.date).toISOString().split('T')[0]}T${session.startTime}`);
            const now = new Date();
            const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilSession <= 12) {
                return session;
            }
            
            const isUserRegistered = (session.players as User[]).some(p => p.id === currentUser.id);

            if (!isUserRegistered) {
                return session; // User not in this session, do nothing
            }

            let newPlayers = (session.players as User[]).filter(p => p.id !== currentUser.id);
            let newWaitlist = [...(session.waitlist as User[])];
            
            // If the session was full and there's a waitlist, promote the first person.
            if (session.players.length >= session.maxPlayers && newWaitlist.length > 0) {
              const nextPlayer = newWaitlist.shift();
              if(nextPlayer) {
                newPlayers.push(nextPlayer);
                console.log(`User ${nextPlayer.name} moved from waitlist to session ${sessionId}.`);
              }
            }
            
            success = true;
            return { ...session, players: newPlayers, waitlist: newWaitlist };
        }
        return session;
    }));
    
    return success;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
             if ((session.waitlist as User[]).some(p => p.id === currentUser.id) || (session.players as User[]).some(p => p.id === currentUser.id)) {
                return session;
            }
            success = true;
            return { ...session, waitlist: [...session.waitlist, currentUser] };
        }
        return session;
    }));

    return success;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
            return { ...session, waitlist: (session.waitlist as User[]).filter(p => p.id !== currentUser.id) };
        }
        return session;
    }));
    return true;
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
    toast({ title: 'Announcement Created!', description: 'The new announcement is now live.', variant: 'success' });
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'>) => {
    setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, ...announcement, date: a.date } : a));
    toast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.', variant: 'success' });
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.', variant: 'success' });
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    
    const existingChat = directChats.find(chat => {
        const participantIds = (chat.participants as User[]).map(p => p.id);
        return participantIds.includes(currentUser.id) && participantIds.includes(otherUser.id);
    });

    if (existingChat) {
      return existingChat.id;
    }
    
    const newChat: DirectChat = {
      id: `dc${Date.now()}`,
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
