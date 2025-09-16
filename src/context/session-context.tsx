
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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session, Message, User, DirectChat, Announcement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from './auth-context';
import { mockUsers } from '@/lib/mock-data'; // Keep for profile enrichment

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

interface SessionContextType {
  sessions: Session[];
  announcements: Announcement[];
  createSession: (session: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => Promise<void>;
  updateSession: (session: Omit<Session, 'date'> & { date: string }) => Promise<void>;
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
    return new Date(date);
  };

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>([]);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { toast } = useToast();
  const { requestPermission, showNotification, isPermissionGranted } = useNotifications();
  const scheduledNotificationsRef = React.useRef<Set<string>>(new Set());

  // --- Real-time Listeners ---

  React.useEffect(() => {
    const q = query(collection(db, 'sessions'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
      setSessions(sessionsData.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    }, (error) => {
      console.error("Error fetching sessions:", error);
      toast({ title: 'Error', description: 'Could not fetch sessions.', variant: 'destructive'});
    });
    return () => unsubscribe();
  }, [toast]);
  
  React.useEffect(() => {
    const q = query(collection(db, 'announcements'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
      setAnnouncements(announcementsData.sort((a,b) => getSafeDate(b.date).getTime() - getSafeDate(a.date).getTime()));
    }, (error) => {
      console.error("Error fetching announcements:", error);
      toast({ title: 'Error', description: 'Could not fetch announcements.', variant: 'destructive'});
    });
    return () => unsubscribe();
  }, [toast]);

  React.useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'direct-chats'), where('participantIds', 'array-contains', currentUser.id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Enrich participants with full user objects
            const participants = (data.participantIds || []).map((id: string) => users.find(u => u.id === id)).filter(Boolean);
            return { id: doc.id, ...data, participants } as DirectChat;
        });
        setDirectChats(chatsData);
    }, (error) => {
        console.error("Error fetching direct chats:", error);
    });
    return () => unsubscribe();
  }, [currentUser, users]);

  // --- Notification Scheduler ---
  React.useEffect(() => {
    if (isPermissionGranted && currentUser) {
      const upcomingSessions = sessions.filter(session =>
        session.players.some(pId => pId === currentUser.id) && getSafeDate(session.date) > new Date()
      );

      upcomingSessions.forEach(session => {
        const sessionDate = getSafeDate(session.date);
        const sessionDateTime = new Date(`${sessionDate.toISOString().split('T')[0]}T${session.startTime}`);

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

  // --- Firestore Operations ---

  const createSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string }) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        date: Timestamp.fromDate(new Date(sessionData.date)),
        players: [],
        waitlist: [],
        messages: [],
        createdBy: currentUser.id,
      });
      showToast({ title: 'Session Created!', description: 'The new session has been successfully added.', variant: 'success' });
    } catch (error) {
      console.error("Error creating session: ", error);
      showToast({ title: 'Error', description: 'Failed to create session.', variant: 'destructive' });
    }
  };

  const updateSession = async (updatedSession: Omit<Session, 'date'> & { date: string }) => {
    const sessionRef = doc(db, 'sessions', updatedSession.id);
    try {
      await updateDoc(sessionRef, {
        ...updatedSession,
        date: Timestamp.fromDate(new Date(updatedSession.date)),
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
    const sessionRef = doc(db, 'sessions', sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (session.players.includes(currentUser.id)) {
      showToast({ title: 'Already Registered', description: 'You are already registered for this session.', variant: 'destructive' });
      return;
    }
    if (session.players.length >= session.maxPlayers) {
      showToast({ title: 'Session Full', description: 'This session is full. You can join the waitlist.', variant: 'destructive' });
      return;
    }
    
    try {
      await updateDoc(sessionRef, {
        players: arrayUnion(currentUser.id),
        waitlist: arrayRemove(currentUser.id), // If user was on waitlist, remove them
      });
      showToast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
    } catch (error) {
      console.error("Error booking session: ", error);
      showToast({ title: 'Error', description: 'Failed to book your spot.', variant: 'destructive' });
    }
  };
  
  const cancelBooking = async (sessionId: string) => {
    if (!currentUser) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
  
    if (!session.players.includes(currentUser.id)) {
      showToast({ title: 'Not Registered', description: "You aren't registered for this session.", variant: 'destructive' });
      return;
    }
  
    const sessionDateTime = new Date(`${getSafeDate(session.date).toISOString().split('T')[0]}T${session.startTime}`);
    const now = new Date();
    const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
    if (hoursUntilSession <= 12) {
      showToast({ title: 'Cancellation Period Over', description: 'You can only cancel a session more than 12 hours in advance.', variant: 'destructive' });
      return;
    }
    
    try {
        const batch = writeBatch(db);
        batch.update(sessionRef, {
            players: arrayRemove(currentUser.id)
        });

        // If a spot opens up, move first person from waitlist
        if (session.waitlist.length > 0) {
            const nextPlayerId = session.waitlist[0];
            batch.update(sessionRef, {
                players: arrayUnion(nextPlayerId),
                waitlist: arrayRemove(nextPlayerId)
            });
            // In a real app, you'd send a notification to nextPlayerId here.
            console.log(`User ${nextPlayerId} moved from waitlist to session ${sessionId}.`);
        }
        await batch.commit();

        showToast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
    } catch (error) {
        console.error("Error canceling booking: ", error);
        showToast({ title: 'Error', description: 'Failed to cancel your booking.', variant: 'destructive' });
    }
  };

  const joinWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (session.waitlist.includes(currentUser.id) || session.players.includes(currentUser.id)) {
      showToast({ title: 'Action Not Allowed', description: 'You are already registered or on the waitlist.', variant: 'destructive' });
      return;
    }

    try {
        await updateDoc(doc(db, 'sessions', sessionId), {
            waitlist: arrayUnion(currentUser.id)
        });
        showToast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
    } catch (error) {
        console.error("Error joining waitlist: ", error);
        showToast({ title: 'Error', description: 'Failed to join the waitlist.', variant: 'destructive' });
    }
  };
  
  const leaveWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    try {
        await updateDoc(doc(db, 'sessions', sessionId), {
            waitlist: arrayRemove(currentUser.id)
        });
        showToast({ title: 'Removed from Waitlist', description: 'You have successfully left the waitlist.', variant: 'success' });
    } catch (error) {
        console.error("Error leaving waitlist: ", error);
        showToast({ title: 'Error', description: 'Failed to leave the waitlist.', variant: 'destructive' });
    }
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
    if (!currentUser) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const newMessage = {
      id: `m${Date.now()}`,
      sender: currentUser,
      content: messageContent.content,
      timestamp: serverTimestamp(),
    };

    try {
      await updateDoc(sessionRef, {
        messages: arrayUnion(newMessage)
      });
    } catch (error) {
       console.error("Error adding message: ", error);
       showToast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };

   const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    try {
      await addDoc(collection(db, 'announcements'), {
        ...announcementData,
        date: serverTimestamp(),
      });
      showToast({ title: 'Announcement Created!', description: 'The new announcement is now live.', variant: 'success' });
    } catch (error) {
      console.error("Error creating announcement: ", error);
      showToast({ title: 'Error', description: 'Failed to create announcement.', variant: 'destructive' });
    }
  };

  const updateAnnouncement = async (announcement: Omit<Announcement, 'date'>) => {
    try {
      await updateDoc(doc(db, 'announcements', announcement.id), announcement);
      showToast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.', variant: 'success' });
    } catch (error) {
      console.error("Error updating announcement: ", error);
      showToast({ title: 'Error', description: 'Failed to update announcement.', variant: 'destructive' });
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      showToast({ title: 'Announcement Deleted', description: 'The announcement has been removed.', variant: 'success' });
    } catch (error) {
      console.error("Error deleting announcement: ", error);
      showToast({ title: 'Error', description: 'Failed to delete announcement.', variant: 'destructive' });
    }
  };


  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    
    const q = query(collection(db, 'direct-chats'), where('participantIds', '==', [currentUser.id, otherUser.id].sort()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    
    try {
        const newChatRef = await addDoc(collection(db, 'direct-chats'), {
            participantIds: [currentUser.id, otherUser.id].sort(),
            messages: [],
        });
        return newChatRef.id;
    } catch (error) {
        console.error("Error creating direct chat:", error);
        return '';
    }
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
     if (!currentUser) return;
    const chatRef = doc(db, 'direct-chats', chatId);
    const newMessage = {
      id: `m${Date.now()}`,
      sender: currentUser, // Storing the full user object, might be better to store ID and enrich on client
      content: messageContent.content,
      timestamp: serverTimestamp(),
    };

    try {
        await updateDoc(chatRef, {
            messages: arrayUnion(newMessage)
        });
    } catch (error) {
        console.error("Error adding direct message:", error);
        showToast({ title: 'Error', description: 'Failed to send direct message.', variant: 'destructive' });
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

export { getSafeDate };
