
'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement, DirectChat } from '@/lib/types';
import { mockSessions, mockAnnouncements, mockUsers, mockDirectChats } from '@/lib/mock-data';
import { useAuth } from './auth-context';
import { Timestamp } from 'firebase/firestore';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
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
  directChats: DirectChat[];
  createDirectChat: (otherUser: User) => Promise<string>;
  addDirectMessage: (chatId: string, message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => Promise<void>;
  users: User[];
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export const getSafeDate = (date: string | Date | Timestamp): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        // Handle 'YYYY-MM-DD' format which Date constructor can misinterpret
        const parts = String(date).split(/[-T:]/);
        if (parts.length >= 3) {
            return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        }
        return new Date(); // fallback
    }
    return d;
};


export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(mockAnnouncements);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { user: currentUser } = useAuth();


  const createSession = async (sessionData: Omit<Session, 'id' | 'players'| 'waitlist'|'messages' | 'date' | 'createdBy'> & { date: string }) => {
    if (!currentUser) return;
    const newSession: Session = {
      ...sessionData,
      id: `session-${Date.now()}`,
      date: Timestamp.fromDate(getSafeDate(sessionData.date)),
      createdBy: currentUser.id,
      players: [],
      waitlist: [],
      messages: [],
    };
    setSessions(prev => [newSession, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
  };
  
  const updateSession = async (sessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'| 'createdBy'> & { date: string, id: string, players: User[], waitlist: User[] }) => {
     setSessions(prev => prev.map(s => s.id === sessionData.id ? {
        ...s,
        ...sessionData,
        date: Timestamp.fromDate(getSafeDate(sessionData.date)),
     } : s));
  };
  
  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId && !s.players.some(p => p.id === currentUser.id) && s.players.length < s.maxPlayers) {
        return {
          ...s,
          players: [...s.players, currentUser],
          waitlist: s.waitlist.filter(p => p.id !== currentUser.id), // Also remove from waitlist if they were on it
        };
      }
      return s;
    }));
    return true;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updatedPlayers = s.players.filter(p => p.id !== currentUser.id);
        const updatedWaitlist = [...s.waitlist];
        
        // If there's a waitlist, move the first person from waitlist to players
        if (s.players.length === s.maxPlayers && updatedWaitlist.length > 0) {
            const nextPlayer = updatedWaitlist.shift();
            if(nextPlayer) {
                updatedPlayers.push(nextPlayer);
            }
        }
        
        return { ...s, players: updatedPlayers, waitlist: updatedWaitlist };
      }
      return s;
    }));
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
     setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, waitlist: s.waitlist.filter(p => p.id !== currentUser.id) };
      }
      return s;
    }));
    return true;
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: Timestamp.now(),
    };
    setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, messages: [...s.messages, newMessage] } : s
    ));
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `ann-${Date.now()}`,
      date: Timestamp.now(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
  };

  const updateAnnouncement = async (announcementData: Omit<Announcement, 'date'> & {id: string}) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementData.id ? { ...a, ...announcementData, date: Timestamp.now() } : a));
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };
  
  const createDirectChat = async (otherUser: User): Promise<string> => {
    if(!currentUser) return '';
    // Check if a chat already exists
    const existingChat = directChats.find(c => c.participants.some(p => p.id === otherUser.id));
    if (existingChat) {
      return existingChat.id;
    }

    const newChatId = `dm-${Date.now()}`;
    const newChat: DirectChat = {
        id: newChatId,
        participants: [currentUser, otherUser],
        messages: [],
    };
    setDirectChats(prev => [...prev, newChat]);
    return newChatId;
  };

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `dm-msg-${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: Timestamp.now(),
    };
    setDirectChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c
    ));
  };

  return (
    <SessionContext.Provider value={{ 
        sessions, 
        createSession, 
        updateSession, 
        deleteSession,
        bookSession,
        cancelBooking,
        joinWaitlist,
        leaveWaitlist,
        addMessage,
        announcements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        directChats,
        createDirectChat,
        addDirectMessage,
        users,
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
