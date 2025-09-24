
'use client';

import * as React from 'react';
import { Timestamp, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, writeBatch, getDoc, query, orderBy } from 'firebase/firestore';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { mockUsers } from '@/lib/mock-data'; // Only for seeding chats

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
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const sessionsData: Session[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const players = await Promise.all((data.players || []).map(async (playerRef: any) => (await getDoc(playerRef)).data()));
        const waitlist = await Promise.all((data.waitlist || []).map(async (playerRef: any) => (await getDoc(playerRef)).data()));
        sessionsData.push({ ...data, id: doc.id, players, waitlist } as Session);
      }
      setSessions(sessionsData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(announcementsData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: User[] = querySnapshot.docs.map(d => ({id: d.id, ...d.data()}) as User);
        setUsers(usersData);
      });
      return () => unsubscribe();
  }, []);


  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => {
    if (!currentUser) return;
    try {
        const newSession = {
            ...sessionData,
            date: Timestamp.fromDate(new Date(sessionData.date)),
            players: [],
            waitlist: [],
            messages: [],
            createdBy: doc(db, 'users', currentUser.id),
        };
        await addDoc(collection(db, 'sessions'), newSession);
        toast({ title: 'Session Created!', description: 'The new session has been successfully added.', variant: 'success' });
    } catch (error) {
        console.error("Error creating session: ", error);
        toast({ title: 'Error', description: 'Could not create the session.', variant: 'destructive' });
    }
  };

  const updateSession = async (updatedSessionData: Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string; id: string }) => {
     try {
        const sessionRef = doc(db, 'sessions', updatedSessionData.id);
        const { id, ...dataToUpdate } = updatedSessionData;
        await updateDoc(sessionRef, { ...dataToUpdate, date: Timestamp.fromDate(new Date(dataToUpdate.date)) });
        toast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
     } catch (error) {
        console.error("Error updating session: ", error);
        toast({ title: 'Error', description: 'Could not update the session.', variant: 'destructive' });
     }
  };

  const deleteSession = async (sessionId: string) => {
    try {
        await deleteDoc(doc(db, 'sessions', sessionId));
        toast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
    } catch (error) {
        console.error("Error deleting session: ", error);
        toast({ title: 'Error', description: 'Could not delete the session.', variant: 'destructive' });
    }
  };
  
  const bookSession = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(sessionRef, {
            players: arrayUnion(userRef),
            waitlist: arrayRemove(userRef)
        });
        return true;
    } catch (error) {
        console.error("Error booking session: ", error);
        return false;
    }
  };
  
  const cancelBooking = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const userRef = doc(db, 'users', currentUser.id);
        
        const sessionSnap = await getDoc(sessionRef);
        if (!sessionSnap.exists()) return false;
        
        const sessionData = sessionSnap.data();
        const waitlist = sessionData.waitlist || [];

        const batch = writeBatch(db);

        // Remove current user
        batch.update(sessionRef, { players: arrayRemove(userRef) });

        // Promote first person from waitlist if exists
        if (waitlist.length > 0) {
            const nextPlayerRef = waitlist[0];
            batch.update(sessionRef, {
                players: arrayUnion(nextPlayerRef),
                waitlist: arrayRemove(nextPlayerRef)
            });
        }
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error canceling booking: ", error);
        return false;
    }
  };

  const joinWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(sessionRef, { waitlist: arrayUnion(userRef) });
        return true;
    } catch (error) {
        console.error("Error joining waitlist: ", error);
        return false;
    }
  };
  
  const leaveWaitlist = async (sessionId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(sessionRef, { waitlist: arrayRemove(userRef) });
        return true;
    } catch (error) {
        console.error("Error leaving waitlist: ", error);
        return false;
    }
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage = {
      sender: doc(db, 'users', currentUser.id),
      content: messageContent.content,
      timestamp: Timestamp.now(),
    };
    const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
    await addDoc(messagesColRef, newMessage);
  };

   const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
     try {
        const newAnnouncement = {
            ...announcementData,
            date: Timestamp.now(),
        };
        await addDoc(collection(db, 'announcements'), newAnnouncement);
        toast({ title: 'Announcement Created!', description: 'The new announcement is now live.', variant: 'success' });
     } catch (error) {
        console.error("Error creating announcement: ", error);
        toast({ title: 'Error', description: 'Could not create announcement.', variant: 'destructive' });
     }
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'> & {id: string}) => {
    try {
        const {id, ...dataToUpdate} = announcement;
        await updateDoc(doc(db, 'announcements', id), dataToUpdate);
        toast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.', variant: 'success' });
    } catch(error) {
        console.error("Error updating announcement: ", error);
        toast({ title: 'Error', description: 'Could not update announcement.', variant: 'destructive' });
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
        await deleteDoc(doc(db, 'announcements', announcementId));
        toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.', variant: 'success' });
    } catch(error) {
        console.error("Error deleting announcement: ", error);
        toast({ title: 'Error', description: 'Could not delete announcement.', variant: 'destructive' });
    }
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    // This is a simplified mock implementation. A real implementation would query for existing chats.
    const newChatId = `dc_${Date.now()}`;
     toast({title: "Chat creation not implemented in mock.", description: "This is a placeholder.", variant: "destructive"});
    return newChatId;
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
     if (!currentUser) return;
     toast({title: "DM not implemented in mock.", description: "This is a placeholder.", variant: "destructive"});
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
