
'use client';

import * as React from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { mockUsers, mockSessions, mockAnnouncements, mockDirectChats } from '@/lib/mock-data';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string, id: string }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bookSession: (sessionId: string) => Promise<boolean>;
  cancelBooking: (sessionId: string) => Promise<boolean>;
  joinWaitlist: (sessionId: string) => Promise<boolean>;
  leaveWaitlist: (sessionId: string) => Promise<boolean>;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
  updateAnnouncement: (announcement: Omit<Announcement, 'date'> & { id: string }) => Promise<void>;
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
    const dateString = typeof date === 'string' && !date.endsWith('Z') ? `${date}Z` : date;
    const d = new Date(dateString);
    return d;
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(mockAnnouncements);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { toast } = useToast();

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => {
    if (!currentUser) return;
    const newSession: Session = {
      ...sessionData,
      id: `s${Date.now()}`,
      date: new Date(sessionData.date).toISOString(),
      players: [],
      waitlist: [],
      messages: [],
      createdBy: currentUser.id,
    };
    setSessions(prev => [...prev, newSession].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    toast({ title: 'Session Created!', description: 'The new session has been successfully added.', variant: 'success' });
  };

  const updateSession = async (updatedSessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string; id: string }) => {
     setSessions(prev => prev.map(s => s.id === updatedSessionData.id ? { ...s, ...updatedSessionData, date: new Date(updatedSessionData.date).toISOString() } : s));
     toast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId && s.players.length < s.maxPlayers && !s.players.some(p => p.id === currentUser.id)) {
        return {
          ...s,
          players: [...s.players, currentUser],
          waitlist: s.waitlist.filter(p => p.id !== currentUser.id) // Remove from waitlist if they were on it
        };
      }
      return s;
    }));
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prevSessions => {
        const sessionToUpdate = prevSessions.find(s => s.id === sessionId);
        if (!sessionToUpdate) return prevSessions;

        const updatedPlayers = sessionToUpdate.players.filter(p => p.id !== currentUser.id);

        // Promote first person from waitlist if there is one
        if (sessionToUpdate.waitlist.length > 0) {
            const nextPlayer = sessionToUpdate.waitlist[0];
            updatedPlayers.push(nextPlayer);
            const updatedWaitlist = sessionToUpdate.waitlist.slice(1);
            return prevSessions.map(s => s.id === sessionId ? {...s, players: updatedPlayers, waitlist: updatedWaitlist} : s);
        }

        return prevSessions.map(s => s.id === sessionId ? {...s, players: updatedPlayers} : s);
    });
    return true;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId && !s.waitlist.some(p => p.id === currentUser.id)) {
        return { ...s, waitlist: [...s.waitlist, currentUser] };
      }
      return s;
    }));
    return true;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, waitlist: s.waitlist.filter(p => p.id !== currentUser.id) } : s));
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
       ...announcementData,
       id: `a${Date.now()}`,
       date: new Date().toISOString(),
     };
     setAnnouncements(prev => [newAnnouncement, ...prev]);
     toast({ title: 'Announcement Created!', description: 'The new announcement is now live.', variant: 'success' });
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'> & {id: string}) => {
    setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, ...announcement, date: a.date } : a));
    toast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.', variant: 'success' });
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.', variant: 'success' });
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    // This is a simplified mock implementation. A real implementation would query for existing chats.
    const newChatId = `dc_${Date.now()}`;
    const newChat: DirectChat = {
        id: newChatId,
        participants: [currentUser, otherUser],
        messages: []
    }
    setDirectChats(prev => [newChat, ...prev]);
    return newChatId;
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
     if (!currentUser) return;
     const newMessage: Message = {
        id: `dcm_${Date.now()}`,
        sender: currentUser,
        content: messageContent.content,
        timestamp: new Date().toISOString(),
     };
     setDirectChats(prev => prev.map(chat => chat.id === chatId ? {...chat, messages: [...chat.messages, newMessage]} : chat));
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
