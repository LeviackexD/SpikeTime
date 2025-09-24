
'use client';

import * as React from 'react';
import type { Session, Message, User, Announcement, DirectChat } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { Timestamp, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

  React.useEffect(() => {
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setSessions(sessionsData.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    });

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(announcementsData.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    return () => {
      unsubSessions();
      unsubAnnouncements();
      unsubUsers();
    };
  }, []);

  React.useEffect(() => {
    if (!currentUser) {
      setDirectChats([]);
      return;
    };

    const q = query(collection(db, 'directChats'), where('participants', 'array-contains', currentUser));
    
    const unsubDirectChats = onSnapshot(q, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectChat));
        setDirectChats(chatsData);
    });

    return () => unsubDirectChats();
  }, [currentUser]);

  const createSession = async (sessionData: Omit<Session, 'id' | 'players'| 'waitlist'|'messages' | 'date' | 'createdBy'> & { date: string }) => {
    if (!currentUser) return;
    const newSession = {
      ...sessionData,
      date: Timestamp.fromDate(getSafeDate(sessionData.date)),
      createdBy: currentUser.id,
      players: [],
      waitlist: [],
      messages: [],
    };
    await addDoc(collection(db, 'sessions'), newSession);
  };
  
  const updateSession = async (sessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'| 'createdBy'> & { date: string, id: string, players: User[], waitlist: User[] }) => {
    const sessionRef = doc(db, 'sessions', sessionData.id);
    await updateDoc(sessionRef, {
        ...sessionData,
        date: Timestamp.fromDate(getSafeDate(sessionData.date)),
    });
  };
  
  const deleteSession = async (sessionId: string) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const sessionRef = doc(db, 'sessions', sessionId);
    try {
      await updateDoc(sessionRef, {
        players: arrayUnion(currentUser),
        waitlist: arrayRemove(currentUser)
      });
      return true;
    } catch (error) {
      console.error("Error booking session:", error);
      return false;
    }
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const sessionRef = doc(db, 'sessions', sessionId);
    try {
      await updateDoc(sessionRef, {
        players: arrayRemove(currentUser)
      });
      return true;
    } catch (error) {
      console.error("Error canceling booking:", error);
      return false;
    }
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const sessionRef = doc(db, 'sessions', sessionId);
     try {
      await updateDoc(sessionRef, {
        waitlist: arrayUnion(currentUser)
      });
      return true;
    } catch (error) {
      console.error("Error joining waitlist:", error);
      return false;
    }
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
     if (!currentUser) return false;
    const sessionRef = doc(db, 'sessions', sessionId);
     try {
      await updateDoc(sessionRef, {
        waitlist: arrayRemove(currentUser)
      });
      return true;
    } catch (error) {
      console.error("Error leaving waitlist:", error);
      return false;
    }
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const newMessage = {
      sender: currentUser,
      content: messageContent.content,
      timestamp: serverTimestamp(),
    };
    await updateDoc(sessionRef, {
      messages: arrayUnion(newMessage)
    });
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement = {
      ...announcementData,
      date: serverTimestamp(),
    };
    await addDoc(collection(db, 'announcements'), newAnnouncement);
  };

  const updateAnnouncement = async (announcementData: Omit<Announcement, 'date'> & {id: string}) => {
    const announcementRef = doc(db, 'announcements', announcementData.id);
    await updateDoc(announcementRef, {
        ...announcementData,
        date: serverTimestamp(),
    });
  };

  const deleteAnnouncement = async (announcementId: string) => {
    const announcementRef = doc(db, 'announcements', announcementId);
    await deleteDoc(announcementRef);
  };
  
  const createDirectChat = async (otherUser: User): Promise<string> => {
    if(!currentUser) return '';
    const newChat = {
        participants: [currentUser, otherUser],
        messages: [],
    };
    const docRef = await addDoc(collection(db, 'directChats'), newChat);
    return docRef.id;
  };

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const chatRef = doc(db, 'directChats', chatId);
    const newMessage = {
      sender: currentUser,
      content: messageContent.content,
      timestamp: serverTimestamp(),
    };
    await updateDoc(chatRef, {
      messages: arrayUnion(newMessage)
    });
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
