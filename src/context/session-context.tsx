
'use client';

import * as React from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { useLanguage } from './language-context';

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

export const getSafeDate = (date: string | Date | Timestamp): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    // Handle ISO strings from server or string dates from forms
    const dateString = typeof date === 'string' && !date.endsWith('Z') ? `${date}Z` : date;
    const d = new Date(dateString);
    return d;
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  // --- REAL-TIME DATA LISTENERS ---

  React.useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessionsData.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(sessionsData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsData: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        announcementsData.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(announcementsData);
    });
    return () => unsubscribe();
  }, []);
  
  React.useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
      if (!currentUser) return;
      const q = query(collection(db, 'directChats'), where('participantIds', 'array-contains', currentUser.id));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const chatsData: DirectChat[] = [];
          querySnapshot.forEach((doc) => {
              chatsData.push({ id: doc.id, ...doc.data()} as DirectChat);
          });
          setDirectChats(chatsData);
      });
      return () => unsubscribe();
  }, [currentUser]);


  // --- MUTATION FUNCTIONS ---

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'| 'date'> & { date: string }) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        date: Timestamp.fromDate(getSafeDate(sessionData.date)),
        players: [],
        waitlist: [],
        messages: [],
        createdBy: currentUser.id,
      });
      toast({ title: t('toasts.sessionCreatedTitle'), description: t('toasts.sessionCreatedDescription'), variant: 'success' });
    } catch (e) {
      console.error("Error creating session: ", e);
    }
  };

  const updateSession = async (updatedSessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string; id: string }) => {
     if (!currentUser || currentUser.role !== 'admin') return;
     try {
        const sessionRef = doc(db, 'sessions', updatedSessionData.id);
        const { id, ...dataToUpdate } = updatedSessionData;
        await updateDoc(sessionRef, {
            ...dataToUpdate,
            date: Timestamp.fromDate(getSafeDate(updatedSessionData.date)),
        });
        toast({ title: t('toasts.sessionUpdatedTitle'), description: t('toasts.sessionUpdatedDescription'), variant: 'success' });
     } catch(e) {
        console.error("Error updating session: ", e);
     }
  };

  const deleteSession = async (sessionId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      toast({ title: t('toasts.sessionDeletedTitle'), description: t('toasts.sessionDeletedDescription'), variant: 'success' });
    } catch(e) {
      console.error("Error deleting session: ", e);
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const batch = writeBatch(db);
      batch.update(sessionRef, { 
        players: arrayUnion(currentUser),
        waitlist: arrayRemove(currentUser) // Remove from waitlist if booking a spot
      });
      await batch.commit();
      return true;
    } catch (e) {
      console.error("Error booking session: ", e);
      return false;
    }
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) return false;

      const session = sessionDoc.data() as Session;
      const batch = writeBatch(db);
      
      // Remove current user
      batch.update(sessionRef, { players: arrayRemove(currentUser) });

      // Promote first from waitlist if exists
      if (session.waitlist.length > 0) {
        const nextPlayer = session.waitlist[0];
        batch.update(sessionRef, {
          players: arrayUnion(nextPlayer),
          waitlist: arrayRemove(nextPlayer)
        });
        // TODO: Send notification to `nextPlayer`
      }
      
      await batch.commit();
      return true;
    } catch (e) {
      console.error("Error canceling booking: ", e);
      return false;
    }
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { waitlist: arrayUnion(currentUser) });
      return true;
    } catch (e) {
      console.error("Error joining waitlist: ", e);
      return false;
    }
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { waitlist: arrayRemove(currentUser) });
      return true;
    } catch (e) {
      console.error("Error leaving waitlist: ", e);
      return false;
    }
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const newMessage = {
        sender: currentUser,
        content: messageContent.content,
        timestamp: serverTimestamp(),
      };
      await updateDoc(sessionRef, { messages: arrayUnion(newMessage) });
    } catch (e) {
      console.error("Error adding message: ", e);
    }
  };

   const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
     if (!currentUser || currentUser.role !== 'admin') return;
     try {
       await addDoc(collection(db, 'announcements'), {
         ...announcementData,
         date: serverTimestamp(),
       });
       toast({ title: t('toasts.announcementCreatedTitle'), description: t('toasts.announcementCreatedDescription'), variant: 'success' });
     } catch (e) {
       console.error("Error creating announcement: ", e);
     }
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'> & {id: string}) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
        const annRef = doc(db, 'announcements', announcement.id);
        await updateDoc(annRef, announcement);
        toast({ title: t('toasts.announcementUpdatedTitle'), description: t('toasts.announcementUpdatedDescription'), variant: 'success' });
    } catch (e) {
        console.error("Error updating announcement: ", e);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      toast({ title: t('toasts.announcementDeletedTitle'), description: t('toasts.announcementDeletedDescription'), variant: 'success' });
    } catch (e) {
        console.error("Error deleting announcement: ", e);
    }
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    try {
        const newChatRef = await addDoc(collection(db, 'directChats'), {
            participants: [currentUser, otherUser],
            participantIds: [currentUser.id, otherUser.id],
            messages: []
        });
        return newChatRef.id;
    } catch (e) {
        console.error("Error creating direct chat: ", e);
        return '';
    }
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
     if (!currentUser) return;
     try {
       const chatRef = doc(db, 'directChats', chatId);
       const newMessage = {
         sender: currentUser,
         content: messageContent.content,
         timestamp: serverTimestamp(),
       };
       await updateDoc(chatRef, { messages: arrayUnion(newMessage) });
     } catch (e) {
       console.error("Error adding direct message: ", e);
     }
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
