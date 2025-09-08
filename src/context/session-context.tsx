
'use client';

import * as React from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import type { Session, Message, User, DirectChat } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from './auth-context';

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

interface SessionContextType {
  sessions: Session[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'>) => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bookSession: (sessionId: string) => Promise<void>;
  cancelBooking: (sessionId: string) => Promise<void>;
  joinWaitlist: (sessionId: string) => Promise<void>;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'sender'>) => Promise<void>;
  directChats: DirectChat[];
  createDirectChat: (otherUser: User) => Promise<string>;
  addDirectMessage: (chatId: string, message: Omit<Message, 'id' | 'sender'>) => Promise<void>;
  users: User[];
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const { toast } = useToast();
  const { requestPermission, showNotification, isPermissionGranted } = useNotifications();
  const scheduledNotificationsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Fetch all users
  React.useEffect(() => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all sessions
  React.useEffect(() => {
    const sessionsCollection = collection(db, 'sessions');
    const q = query(sessionsCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate().toISOString(),
        } as Session;
      });
      setSessions(sessionsData);
    });
    return () => unsubscribe();
  }, []);
  
    // Fetch direct chats for the current user
  React.useEffect(() => {
    if (!currentUser) return;

    const chatsCollection = collection(db, 'directChats');
    const q = query(chatsCollection, where('participantIds', 'array-contains', currentUser.id));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const participants = users.filter(u => data.participantIds.includes(u.id));
        return {
          id: doc.id,
          ...data,
          participants,
        } as DirectChat;
      }).filter(chat => chat.participants.length > 1); // Ensure both participants are loaded
      setDirectChats(chatsData);
    });

    return () => unsubscribe();
  }, [currentUser, users]);

  // Schedule notifications
  React.useEffect(() => {
    if (isPermissionGranted && currentUser) {
      const upcomingSessions = sessions.filter(session =>
        session.players.some(pId => pId === currentUser.id) && new Date(`${session.date}T${session.startTime}`) > new Date()
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
  }, [sessions, isPermissionGranted, showNotification, currentUser]);


  const showToast = (toastInfo: ToastInfo) => {
    toast({
      title: toastInfo.title,
      description: toastInfo.description,
      variant: toastInfo.variant,
    });
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages'>) => {
     if (!currentUser || currentUser.role !== 'admin') {
      showToast({ title: 'Unauthorized', description: 'Only admins can create sessions.', variant: 'destructive' });
      return;
    }
    try {
      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        date: Timestamp.fromDate(new Date(sessionData.date)),
        players: [],
        waitlist: [],
        messages: [],
        createdBy: currentUser.id
      });
      showToast({
          title: 'Session Created!',
          description: 'The new session has been successfully added.',
          variant: 'success',
      });
    } catch (error) {
      console.error("Error creating session: ", error);
      showToast({ title: 'Error', description: 'Failed to create session.', variant: 'destructive' });
    }
  };

  const updateSession = async (updatedSession: Session) => {
    try {
      const sessionDoc = doc(db, 'sessions', updatedSession.id);
      const { id, ...dataToUpdate } = updatedSession;
      await updateDoc(sessionDoc, {
        ...dataToUpdate,
        date: Timestamp.fromDate(new Date(dataToUpdate.date)),
      });
      showToast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
    } catch (error) {
      console.error("Error updating session: ", error);
      showToast({ title: 'Error', description: 'Failed to update session.', variant: 'destructive' });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      showToast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
    } catch (error) {
      console.error("Error deleting session: ", error);
      showToast({ title: 'Error', description: 'Failed to delete session.', variant: 'destructive' });
    }
  };
  
  const bookSession = async (sessionId: string) => {
    if (!currentUser) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (session.players.includes(currentUser.id)) {
        showToast({ title: 'Already Registered', description: 'You are already registered for this session.', variant: 'destructive' });
        return;
    }
    
    try {
      const sessionDoc = doc(db, 'sessions', sessionId);
      await updateDoc(sessionDoc, {
        players: arrayUnion(currentUser.id)
      });
      showToast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
    } catch (error) {
      console.error("Error booking session: ", error);
      showToast({ title: 'Error', description: 'Failed to book session.', variant: 'destructive' });
    }
  };

  const cancelBooking = async (sessionId: string) => {
    if (!currentUser) return;
    
    try {
      const sessionDoc = doc(db, 'sessions', sessionId);
      await updateDoc(sessionDoc, {
        players: arrayRemove(currentUser.id)
      });
      showToast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
    } catch (error) {
      console.error("Error canceling booking: ", error);
      showToast({ title: 'Error', description: 'Failed to cancel booking.', variant: 'destructive' });
    }
  };

  const joinWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.waitlist.includes(currentUser.id)) {
        showToast({ title: 'Already on Waitlist', description: 'You are already on the waitlist for this session.', variant: 'destructive' });
        return;
    }

    try {
      const sessionDoc = doc(db, 'sessions', sessionId);
      await updateDoc(sessionDoc, {
        waitlist: arrayUnion(currentUser.id)
      });
      showToast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
    } catch (error) {
       console.error("Error joining waitlist: ", error);
       showToast({ title: 'Error', description: 'Failed to join waitlist.', variant: 'destructive' });
    }
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender'>) => {
    if (!currentUser) return;
    const newMessage = {
        senderId: currentUser.id,
        content: messageContent.content,
        timestamp: Timestamp.now(),
    };
    try {
      const messagesCollection = collection(db, 'sessions', sessionId, 'messages');
      await addDoc(messagesCollection, newMessage);
    } catch (error) {
        console.error("Error sending message: ", error);
        showToast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    
    // Check if a chat already exists
    const existingChat = directChats.find(chat => chat.participants.some(p => p.id === otherUser.id));
    if (existingChat) {
      return existingChat.id;
    }
    
    try {
      const newChatDoc = await addDoc(collection(db, 'directChats'), {
        participantIds: [currentUser.id, otherUser.id],
        messages: [],
      });
      return newChatDoc.id;
    } catch(error) {
      console.error("Error creating direct chat: ", error);
      showToast({ title: 'Error', description: 'Failed to create chat.', variant: 'destructive' });
      return '';
    }
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender'>) => {
    if (!currentUser) return;
    const newMessage = {
        senderId: currentUser.id,
        content: messageContent.content,
        timestamp: Timestamp.now(),
    };
    try {
      const messagesCollection = collection(db, 'directChats', chatId, 'messages');
      await addDoc(messagesCollection, newMessage);
    } catch (error) {
      console.error("Error sending direct message: ", error);
      showToast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
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
