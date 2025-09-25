
/**
 * @fileoverview Mock data for the entire application.
 * This includes users, sessions, announcements, and direct chats.
 * In a real application, this data would come from a backend server.
 */

import type { User, Session, Announcement, DirectChat, Message } from './types';

// --- USERS ---

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Manu',
    username: 'manuginobili',
    email: 'manu@invernesseagles.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
    role: 'admin',
    skillLevel: 'Advanced',
    favoritePosition: 'Hitter',
    stats: {
        sessionsPlayed: 102,
        attendanceRate: 98,
    }
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    username: 'mariag',
    email: 'maria@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    role: 'user',
    skillLevel: 'Intermediate',
    favoritePosition: 'Setter',
     stats: {
        sessionsPlayed: 45,
        attendanceRate: 92,
    }
  },
  {
    id: 'user-3',
    name: 'John Smith',
    username: 'johnsmith',
    email: 'john@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    role: 'user',
    skillLevel: 'Beginner',
    favoritePosition: 'Libero',
     stats: {
        sessionsPlayed: 12,
        attendanceRate: 88,
    }
  },
  {
    id: 'user-4',
    name: 'Aisha Khan',
    username: 'aishak',
    email: 'aisha@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
    role: 'user',
    skillLevel: 'Intermediate',
    favoritePosition: 'Blocker',
     stats: {
        sessionsPlayed: 67,
        attendanceRate: 95,
    }
  },
   {
    id: 'user-5',
    name: 'Kenji Tanaka',
    username: 'kenjit',
    email: 'kenji@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
    role: 'user',
    skillLevel: 'Advanced',
    favoritePosition: 'Hitter',
     stats: {
        sessionsPlayed: 89,
        attendanceRate: 99,
    }
  },
   { id: 'user-6', name: 'Chloe Kim', username: 'chloek', email: 'chloe@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-6', role: 'user', skillLevel: 'Beginner', favoritePosition: 'Libero', stats: { sessionsPlayed: 5, attendanceRate: 100 } },
  { id: 'user-7', name: 'Ben Carter', username: 'benc', email: 'ben@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-7', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Setter', stats: { sessionsPlayed: 22, attendanceRate: 90 } },
  { id: 'user-8', name: 'Sofia Rossi', username: 'sofiar', email: 'sofia@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-8', role: 'user', skillLevel: 'Advanced', favoritePosition: 'Hitter', stats: { sessionsPlayed: 75, attendanceRate: 96 } },
  { id: 'user-9', name: 'Liam Wilson', username: 'liamw', email: 'liam@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-9', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Blocker', stats: { sessionsPlayed: 31, attendanceRate: 91 } },
  { id: 'user-10', name: 'Ava Chen', username: 'avac', email: 'ava@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-10', role: 'user', skillLevel: 'Beginner', favoritePosition: 'Setter', stats: { sessionsPlayed: 8, attendanceRate: 95 } },
  { id: 'user-11', name: 'Noah Brown', username: 'noahb', email: 'noah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-11', role: 'user', skillLevel: 'Advanced', favoritePosition: 'Libero', stats: { sessionsPlayed: 55, attendanceRate: 93 } },
  { id: 'user-12', name: 'Isabella Wong', username: 'isabellaw', email: 'isabella@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-12', role: 'user', skillLevel: 'Intermediate', favoritePosition: 'Hitter', stats: { sessionsPlayed: 41, attendanceRate: 94 } },
];

// --- CURRENT USER ---
// Change the index to test different users. 0 is admin, 1-4 are regular users.
export const currentUser: User = mockUsers[0]; 

// --- SESSIONS ---

const today = new Date();
const getSessionDate = (dayOffset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    return date;
}

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    date: getSessionDate(2),
    startTime: '18:00',
    endTime: '20:00',
    location: 'Main Sports Hall',
    level: 'Advanced',
    players: [mockUsers[0], mockUsers[4]],
    maxPlayers: 12,
    waitlist: [],
    imageUrl: 'https://picsum.photos/seed/s1/400/300',
    messages: [
      { id: 'msg-1-1', sender: mockUsers[0], content: 'Ready to spike!', timestamp: new Date() },
      { id: 'msg-1-2', sender: mockUsers[4], content: 'Let\'s do it!', timestamp: new Date() },
    ],
  },
  {
    id: 'session-2',
    date: getSessionDate(2),
    startTime: '18:00',
    endTime: '20:00',
    location: 'Secondary Hall',
    level: 'Intermediate',
    players: [mockUsers[1], mockUsers[3]],
    maxPlayers: 12,
    waitlist: [],
    imageUrl: 'https://picsum.photos/seed/s2/400/300',
    messages: [
      { id: 'msg-2-1', sender: mockUsers[1], content: 'Is anyone bringing a ball?', timestamp: new Date() },
    ],
  },
  {
    id: 'session-3',
    date: getSessionDate(4),
    startTime: '19:00',
    endTime: '21:00',
    location: 'Main Sports Hall',
    level: 'Intermediate',
    players: [mockUsers[0], mockUsers[1], mockUsers[3], mockUsers[4]],
    maxPlayers: 12,
    waitlist: [],
    imageUrl: 'https://picsum.photos/seed/s3/400/300',
    messages: [],
  },
  {
    id: 'session-4',
    date: getSessionDate(5),
    startTime: '20:00',
    endTime: '22:00',
    location: 'Community Center',
    level: 'Beginner',
    players: mockUsers.slice(0, 12), // Full session with unique players
    maxPlayers: 12,
    waitlist: [],
    imageUrl: 'https://picsum.photos/seed/s4/400/300',
    messages: [],
  },
  {
    id: 'session-5',
    date: getSessionDate(7),
    startTime: '18:00',
    endTime: '20:00',
    location: 'Main Sports Hall',
    level: 'Advanced',
    players: [mockUsers[4]],
    maxPlayers: 12,
    waitlist: [],
    imageUrl: 'https://picsum.photos/seed/s5/400/300',
    messages: [],
  },
];

// --- ANNOUNCEMENTS ---

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: { en: 'Summer Beach Tournament!', es: '¡Torneo de Verano en la Playa!' },
    content: { en: 'Get ready for our annual beach volleyball tournament on the 15th of next month. Sign-ups are now open!', es: '¡Prepárate para nuestro torneo anual de vóley playa el 15 del próximo mes. Las inscripciones ya están abiertas!' },
    date: new Date('2024-07-20'),
    category: 'tournament',
  },
  {
    id: 'ann-2',
    title: { en: 'New Beginners Class', es: 'Nueva Clase para Principiantes' },
    content: { en: 'We are starting a new beginners class every Wednesday. Perfect for new players!', es: 'Comenzamos una nueva clase para principiantes todos los miércoles. ¡Perfecto para nuevos jugadores!' },
    date: new Date('2024-07-18'),
    category: 'class',
  },
  {
    id: 'ann-3',
    title: { en: 'Club T-Shirts Available', es: 'Camisetas del Club Disponibles' },
    content: { en: 'Official Inverness Eagles t-shirts are now available for purchase at the front desk.', es: 'Las camisetas oficiales de los Inverness Eagles ya están disponibles para su compra en la recepción.' },
    date: new Date('2024-07-15'),
    category: 'general',
  },
];


// --- DIRECT CHATS ---

export const mockDirectChats: DirectChat[] = [
    {
        id: 'dm-1',
        participants: [mockUsers[0], mockUsers[1]],
        messages: [
            { id: 'dm-1-1', sender: mockUsers[0], content: 'Hey Maria, are you going to the advanced session on Friday?', timestamp: new Date() },
            { id: 'dm-1-2', sender: mockUsers[1], content: 'Hey Manu! I was thinking about it. You think I can handle it?', timestamp: new Date() },
            { id: 'dm-1-3', sender: mockUsers[0], content: 'For sure, you\'ll be great!', timestamp: new Date() },
        ],
    },
    {
        id: 'dm-2',
        participants: [mockUsers[0], mockUsers[2]],
        messages: [
             { id: 'dm-2-1', sender: mockUsers[2], content: 'Hi Manu, just wanted to say thanks for the pointers in the last beginner session!', timestamp: new Date() },
        ]
    }
]
