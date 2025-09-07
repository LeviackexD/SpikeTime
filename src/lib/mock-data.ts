
import type { User, Session, Announcement, Message, DirectChat } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Manu', username: 'manu_admin', email: 'admin@invernesseagles.com', avatarUrl: 'https://picsum.photos/seed/u1/100/100', role: 'admin', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 0 } },
  { id: 'u2', name: 'Maria Garcia', username: 'maria', email: 'maria@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100/100', role: 'user', skillLevel: 'Advanced', favoritePosition: 'Setter', stats: { sessionsPlayed: 42 } },
  { id: 'u3', name: 'Sam Chen', username: 'sam', email: 'sam@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100/100', role: 'user', skillLevel: 'Advanced', favoritePosition: 'All-Rounder', stats: { sessionsPlayed: 89 } },
  { id: 'u4', name: 'Emily White', username: 'emily', email: 'emily@example.com', avatarUrl: 'https://picsum.photos/seed/u4/100/100', role: 'user', skillLevel: 'Beginner', favoritePosition: 'Libero', stats: { sessionsPlayed: 10 } },
  { id: 'u5', name: 'David Lee', username: 'david', email: 'david@example.com', avatarUrl: 'https://picsum.photos/seed/u5/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Blocker', stats: { sessionsPlayed: 33 } },
  { id: 'u6', name: 'Chloe Brown', username: 'chloe', email: 'chloe@example.com', avatarUrl: 'https://picsum.photos/seed/u6/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u7', name: 'User 7', username: 'user7', email: 'user7@example.com', avatarUrl: 'https://picsum.photos/seed/u7/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u8', name: 'User 8', username: 'user8', email: 'user8@example.com', avatarUrl: 'https://picsum.photos/seed/u8/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u9', name: 'User 9', username: 'user9', email: 'user9@example.com', avatarUrl: 'https://picsum.photos/seed/u9/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u10', name: 'User 10', username: 'user10', email: 'user10@example.com', avatarUrl: 'https://picsum.photos/seed/u10/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u11', name: 'User 11', username: 'user11', email: 'user11@example.com', avatarUrl: 'https://picsum.photos/seed/u11/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u12', name: 'User 12', username: 'user12', email: 'user12@example.com', avatarUrl: 'https://picsum.photos/seed/u12/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
  { id: 'u13', name: 'User 13', username: 'user13', email: 'user13@example.com', avatarUrl: 'https://picsum.photos/seed/u13/100/100', role: 'user', skillLevel: 'Beginner', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18 } },
];

export const currentUser: User = mockUsers[0];


function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const mockSessionMessages: Message[] = [
    {
      id: 'm1',
      sender: mockUsers[1],
      content: 'Hey everyone! Just a reminder to bring a white and a dark shirt for the session tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'm2',
      sender: mockUsers[4],
      content: 'Got it! I can bring an extra ball as well, just in case.',
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
    {
      id: 'm3',
      sender: mockUsers[0],
      content: "Awesome, thanks David! I'll bring a big water cooler for everyone.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
];

export const mockSessions: Session[] = [
  { id: 's1', date: getFutureDate(2), startTime: '18:00', endTime: '20:00', location: 'Main Beach Court', level: 'Intermediate', players: mockUsers.slice(0, 5).map(u => u.id), maxPlayers: 12, waitlist: [], imageUrl: `https://picsum.photos/seed/s1/400/300`, messages: mockSessionMessages },
  { id: 's2', date: getFutureDate(2), startTime: '20:00', endTime: '22:00', location: 'Side Court 2', level: 'Advanced', players: mockUsers.slice(1, 3).map(u => u.id), maxPlayers: 12, waitlist: [], imageUrl: `https://picsum.photos/seed/s2/400/300`, messages: [] },
  { id: 's3', date: getFutureDate(4), startTime: '19:00', endTime: '21:00', location: 'Community Center', level: 'Beginner', players: mockUsers.slice(3, 4).map(u => u.id), maxPlayers: 12, waitlist: [], imageUrl: `https://picsum.photos/seed/s3/400/300`, messages: [] },
  { id: 's4', date: getFutureDate(7), startTime: '18:00', endTime: '20:00', location: 'Sunset Park', level: 'Intermediate', players: mockUsers.slice(0,12).map(u => u.id), maxPlayers: 12, waitlist: [mockUsers[12].id], imageUrl: `https://picsum.photos/seed/s4/400/300`, messages: [] },
  { id: 's5', date: getFutureDate(7), startTime: '18:00', endTime: '20:00', location: 'Main Beach Court', level: 'Advanced', players: mockUsers.slice(0, 12).map(u => u.id), maxPlayers: 12, waitlist: mockUsers.slice(4, 5).map(u => u.id), imageUrl: `https://picsum.photos/seed/s5/400/300`, messages: [] },
  { id: 's6', date: getFutureDate(10), startTime: '10:00', endTime: '12:00', location: 'City Sports Complex', level: 'All-Rounder', players: [], maxPlayers: 12, waitlist: [], imageUrl: `https://picsum.photos/seed/s6/400/300`, messages: [] },
  { id: 's7', date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '20:00', location: 'East Side Beach', level: 'Intermediate', players: mockUsers.slice(3, 11).map(u => u.id), maxPlayers: 12, waitlist: [], imageUrl: `https://picsum.photos/seed/s7/400/300`, messages: [] },
];

export const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Summer Tournament', content: 'Sign-ups for the annual summer tournament are now open! Find a partner and register by the end of the month.', date: getFutureDate(-1) },
  { id: 'a2', title: 'New Sunday Sessions', content: 'We are adding new beginner-friendly sessions every Sunday morning at 10 AM.', date: getFutureDate(-5) },
  { id: 'a3', title: 'Maintenance Notice', content: 'The west court will be closed for floor maintenance on the 15th. All sessions will be moved to the east court.', date: getFutureDate(-10) },
];

export const mockDirectChats: DirectChat[] = [
    {
        id: 'dc1',
        participants: [mockUsers[0], mockUsers[2]],
        messages: [
            {
                id: 'dcm1',
                sender: mockUsers[2],
                content: 'Hey Manu, are you going to the advanced session on Tuesday?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            },
            {
                id: 'dcm2',
                sender: mockUsers[0],
                content: "Hey Sam! For sure, wouldn't miss it. You bringing your new ball?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
            },
        ],
    },
     {
        id: 'dc2',
        participants: [mockUsers[0], mockUsers[3]],
        messages: [
            {
                id: 'dcm3',
                sender: mockUsers[3],
                content: 'Hi Manu, I saw you signed up for the beginner session to help out. That\'s awesome!',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            },
        ],
    }
]
