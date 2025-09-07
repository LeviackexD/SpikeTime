import type { User, Session, Announcement } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 25, sessionsCancelled: 2 } },
  { id: 'u2', name: 'Maria Garcia', email: 'maria@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100/100', role: 'user', skillLevel: 'Advanced', favoritePosition: 'Setter', stats: { sessionsPlayed: 42, sessionsCancelled: 1 } },
  { id: 'u3', name: 'Sam Chen', email: 'sam@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100/100', role: 'admin', skillLevel: 'Advanced', favoritePosition: 'All-Rounder', stats: { sessionsPlayed: 89, sessionsCancelled: 5 } },
  { id: 'u4', name: 'Emily White', email: 'emily@example.com', avatarUrl: 'https://picsum.photos/seed/u4/100/100', role: 'user', skillLevel: 'Beginner', favoritePosition: 'Libero', stats: { sessionsPlayed: 10, sessionsCancelled: 0 } },
  { id: 'u5', name: 'David Lee', email: 'david@example.com', avatarUrl: 'https://picsum.photos/seed/u5/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Blocker', stats: { sessionsPlayed: 33, sessionsCancelled: 3 } },
  { id: 'u6', name: 'Chloe Brown', email: 'chloe@example.com', avatarUrl: 'https://picsum.photos/seed/u6/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u7', name: 'User 7', email: 'user7@example.com', avatarUrl: 'https://picsum.photos/seed/u7/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u8', name: 'User 8', email: 'user8@example.com', avatarUrl: 'https://picsum.photos/seed/u8/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u9', name: 'User 9', email: 'user9@example.com', avatarUrl: 'https://picsum.photos/seed/u9/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u10', name: 'User 10', email: 'user10@example.com', avatarUrl: 'https://picsum.photos/seed/u10/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u11', name: 'User 11', email: 'user11@example.com', avatarUrl: 'https://picsum.photos/seed/u11/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
  { id: 'u12', name: 'User 12', email: 'user12@example.com', avatarUrl: 'https://picsum.photos/seed/u12/100/100', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 18, sessionsCancelled: 1 } },
];

function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export const mockSessions: Session[] = [
  { id: 's1', date: getFutureDate(2), time: '18:00 - 20:00', location: 'Main Beach Court', level: 'Intermediate', players: mockUsers.slice(0, 5), maxPlayers: 12, waitlist: [] },
  { id: 's2', date: getFutureDate(2), time: '20:00 - 22:00', location: 'Side Court 2', level: 'Advanced', players: mockUsers.slice(1, 3), maxPlayers: 12, waitlist: [] },
  { id: 's3', date: getFutureDate(4), time: '19:00 - 21:00', location: 'Community Center', level: 'Beginner', players: mockUsers.slice(3, 4), maxPlayers: 12, waitlist: [] },
  { id: 's4', date: getFutureDate(7), time: '18:00 - 20:00', location: 'Sunset Park', level: 'Intermediate', players: mockUsers.slice(0, 11), maxPlayers: 12, waitlist: [] },
  { id: 's5', date: getFutureDate(7), time: '18:00 - 20:00', location: 'Main Beach Court', level: 'Advanced', players: mockUsers.slice(0, 12), maxPlayers: 12, waitlist: mockUsers.slice(4, 5) },
  { id: 's6', date: getFutureDate(10), time: '10:00 - 12:00', location: 'City Sports Complex', level: 'All-Rounder', players: [], maxPlayers: 12, waitlist: [] },
  { id: 's7', date: new Date().toISOString().split('T')[0], time: '18:00 - 20:00', location: 'East Side Beach', level: 'Intermediate', players: mockUsers.slice(0, 8), maxPlayers: 12, waitlist: [] },
];

export const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Summer Tournament', content: 'Sign-ups for the annual summer tournament are now open! Find a partner and register by the end of the month.', date: getFutureDate(-1) },
  { id: 'a2', title: 'New Sunday Sessions', content: 'We are adding new beginner-friendly sessions every Sunday morning at 10 AM.', date: getFutureDate(-5) },
  { id: 'a3', title: 'Maintenance Notice', content: 'The west court will be closed for floor maintenance on the 15th. All sessions will be moved to the east court.', date: getFutureDate(-10) },
];

export const currentUser: User = mockUsers[2]; // Mocking the logged-in user as the admin
