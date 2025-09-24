
'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement, DirectChat } from '@/lib/types';
import { 
    mockSessions, 
    mockAnnouncements, 
    mockUsers,
    mockDirectChats,
} from '@/lib/mock-data';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string, id: string, players: User[], waitlist: User[] }) => Promise<void>;
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
        // Handle YYYY-MM-DD format from forms by ensuring it's parsed as UTC
        const parts = String(date).split('-');
        if (parts.length === 3) {
            return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        }
        return new Date(); // fallback
    }
    return d;
};


export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    setSessions(mockSessions);
    setAnnouncements(mockAnnouncements);
    setDirectChats(mockDirectChats);
    setUsers(mockUsers);
  }, []);

  const createSession = async (sessionData: Omit<Session, 'id' | 'players'| 'waitlist'|'messages' | 'date'> & { date: string }) => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      ...sessionData,
      date: Timestamp.fromDate(getSafeDate(sessionData.date)),
      players: [],
      waitlist: [],
      messages: [],
    };
    setSessions(prev => [newSession, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
  };
  
  const updateSession = async (sessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string, id: string, players: User[], waitlist: User[] }) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionData.id ? { ...s, ...sessionData, date: Timestamp.fromDate(getSafeDate(sessionData.date)) } : s
      )
    );
  };
  

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId && s.players.length < s.maxPlayers && !s.players.some(p => p.id === currentUser.id)) {
          // Add user to players list and remove from waitlist
          const newPlayers = [...s.players, currentUser];
          const newWaitlist = s.waitlist.filter(u => u.id !== currentUser.id);
          success = true;
          return { ...s, players: newPlayers, waitlist: newWaitlist };
        }
        return s;
      })
    );
    return success;
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId && s.players.some(p => p.id === currentUser.id)) {
          const newPlayers = s.players.filter(p => p.id !== currentUser.id);
          success = true;
          // If there's a waitlist, move the first person to the players list
          if (s.waitlist.length > 0 && newPlayers.length < s.maxPlayers) {
            const nextPlayer = s.waitlist[0];
            newPlayers.push(nextPlayer);
            const newWaitlist = s.waitlist.slice(1);
            return { ...s, players: newPlayers, waitlist: newWaitlist };
          }
          return { ...s, players: newPlayers };
        }
        return s;
      })
    );
    return success;
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId && !s.waitlist.some(w => w.id === currentUser.id)) {
          success = true;
          return { ...s, waitlist: [...s.waitlist, currentUser] };
        }
        return s;
      })
    );
    return success;
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    let success = false;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId && s.waitlist.some(w => w.id === currentUser.id)) {
          success = true;
          return { ...s, waitlist: s.waitlist.filter(w => w.id !== currentUser.id) };
        }
        return s;
      })
    );
    return success;
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: Timestamp.now(),
    };
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, messages: [...s.messages, newMessage] } : s
      )
    );
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      ...announcementData,
      date: Timestamp.now(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
  };

  const updateAnnouncement = async (announcementData: Omit<Announcement, 'date'> & {id: string}) => {
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === announcementData.id ? { ...a, ...announcementData, date: Timestamp.now() } : a
      )
    );
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };
  
  const createDirectChat = async (otherUser: User): Promise<string> => {
    if(!currentUser) return '';

    // Check if a chat already exists
    const existingChat = directChats.find(chat => chat.participants.some(p => p.id === otherUser.id) && chat.participants.some(p => p.id === currentUser.id));
    if(existingChat) {
        return existingChat.id;
    }

    const newChat: DirectChat = {
      id: `chat-${Date.now()}`,
      participants: [currentUser, otherUser],
      messages: [],
    };
    setDirectChats(prev => [...prev, newChat]);
    return newChat.id;
  };

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: Timestamp.now(),
    };
    setDirectChats(prev =>
      prev.map(c =>
        c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c
      )
    );
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
