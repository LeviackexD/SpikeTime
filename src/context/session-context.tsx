
'use client';

import * as React from 'react';
import { mockSessions, mockUsers, mockDirectChats } from '@/lib/mock-data';
import type { Session, Message, User, DirectChat } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from './auth-context';
import { seedDevelopmentData } from '@/lib/seed-dev-data';


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
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [directChats, setDirectChats] = React.useState<DirectChat[]>(mockDirectChats);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const { toast } = useToast();
  const { requestPermission, showNotification, isPermissionGranted } = useNotifications();
  const scheduledNotificationsRef = React.useRef<Set<string>>(new Set());

  // Seed data in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // We are using a local admin instance of Firebase to seed the data
      // This is a temporary solution and should be replaced with a proper seeding script
      // that runs against the emulators.
      const seed = async () => {
        try {
          const admin = await import('firebase-admin');
          if (admin.apps.length === 0) {
            process.env.FIRESTORE_EMULATOR_HOST="127.0.0.1:8080";
            process.env.FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099";
            admin.initializeApp({ projectId: 'spiketime-8retn' });
          }
          
          const auth = admin.auth();
          const db = admin.firestore();
          
          const seedDevelopmentData = async () => {
            let isSeeding = true;
            try {
              const { users } = await auth.listUsers();
              if (users.length >= mockUsers.length) {
                console.log('Auth emulator already seeded.');
                return;
              }

              console.log('Seeding development data...');
              for (const mockUser of mockUsers) {
                if (!mockUser.email) continue;
                try {
                  await auth.createUser({
                    uid: mockUser.id,
                    email: mockUser.email,
                    password: "password123",
                    displayName: mockUser.name,
                    photoURL: mockUser.avatarUrl,
                  });
                  await db.collection('users').doc(mockUser.id).set(mockUser);
                  console.log(`Successfully created user: ${mockUser.name}`);
                } catch (error: any) {
                  if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
                    console.log(`User ${mockUser.name} already exists. Skipping.`);
                  } else {
                    console.error(`Error creating user ${mockUser.name}:`, error);
                  }
                }
              }
              console.log('Development data seeding complete.');
            } catch (error) {
              console.error('Error seeding data:', error);
            }
          };

          await seedDevelopmentData();

        } catch (e) {
            console.log('Could not seed dev data', e);
        }
      }
      seed();
    }
  }, []);

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

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
    // In a real app, this would be an API call. Here, we just update local state.
    const newSession: Session = {
      ...sessionData,
      id: `s${sessions.length + 1}`,
      players: [],
      waitlist: [],
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    showToast({
        title: 'Session Created!',
        description: 'The new session has been successfully added.',
        variant: 'success',
    });
  };

  const updateSession = async (updatedSession: Session) => {
    setSessions(prev =>
      prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );
    showToast({ title: 'Session Updated', description: 'The session has been successfully updated.', variant: 'success' });
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast({ title: 'Session Deleted', description: 'The session has been successfully deleted.', variant: 'success' });
  };
  
  const bookSession = async (sessionId: string) => {
    if (!currentUser) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    if (session.players.includes(currentUser.id)) {
        showToast({ title: 'Already Registered', description: 'You are already registered for this session.', variant: 'destructive' });
        return;
    }
    
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, players: [...s.players, currentUser.id] } : s
      )
    );
    showToast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
  };

  const cancelBooking = async (sessionId: string) => {
    if (!currentUser) return;
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, players: s.players.filter(pId => pId !== currentUser.id) }
          : s
      )
    );
    showToast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
  };

  const joinWaitlist = async (sessionId: string) => {
    if (!currentUser) return;
    
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.waitlist.includes(currentUser.id)) {
        showToast({ title: 'Already on Waitlist', description: 'You are already on the waitlist for this session.', variant: 'destructive' });
        return;
    }

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, waitlist: [...s.waitlist, currentUser.id] } : s
      )
    );
    showToast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
  };

  const addMessage = async (sessionId: string, messageContent: Omit<Message, 'id' | 'sender'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      ...messageContent,
      id: `m${Date.now()}`,
      sender: currentUser,
    };
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, messages: [...s.messages, newMessage] } : s
      )
    );
  };

  const createDirectChat = async (otherUser: User) => {
    if (!currentUser) return '';
    
    // Check if a chat already exists
    const existingChat = directChats.find(chat => chat.participants.some(p => p.id === otherUser.id));
    if (existingChat) {
      return existingChat.id;
    }
    
    const newChat: DirectChat = {
        id: `dc${Date.now()}`,
        participants: [currentUser, otherUser],
        participantIds: [currentUser.id, otherUser.id],
        messages: [],
    };
    setDirectChats(prev => [newChat, ...prev]);
    return newChat.id;
  }

  const addDirectMessage = async (chatId: string, messageContent: Omit<Message, 'id' | 'sender'>) => {
     if (!currentUser) return;
    const newMessage: Message = {
      ...messageContent,
      id: `m${Date.now()}`,
      sender: currentUser,
    };
    setDirectChats(prev =>
      prev.map(c =>
        c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c
      )
    );
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
