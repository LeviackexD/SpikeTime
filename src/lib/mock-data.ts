/**
 * @fileoverview Mock data for the entire application.
 * This includes users, sessions, announcements, and direct chats.
 * In a real application, this data would come from a backend server.
 */

import type { User, Session, Announcement, DirectChat, Message } from './types';
import { Timestamp } from 'firebase/firestore';

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
];

// --- CURRENT USER ---
// Change the index to test different users. 0 is admin, 1-4 are regular users.
export const currentUser: User = mockUsers[0]; 

// --- SESSIONS ---

const today = new Date();
const getSessionDate = (dayOffset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    return Timestamp.fromDate(date);
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
      { id: 'msg-1-1', sender: mockUsers[0], content: 'Ready to spike!', timestamp: Timestamp.now() },
      { id: 'msg-1-2', sender: mockUsers[4], content: 'Let\'s do it!', timestamp: Timestamp.now() },
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
      { id: 'msg-2-1', sender: mockUsers[1], content: 'Is anyone bringing a ball?', timestamp: Timestamp.now() },
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
    players: Array(12).fill(null).map((_, i) => mockUsers[i % 5] || mockUsers[2]), // Full session
    maxPlayers: 12,
    waitlist: [mockUsers[3]],
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
    date: Timestamp.fromDate(new Date('2024-07-20')),
    category: 'tournament',
  },
  {
    id: 'ann-2',
    title: { en: 'New Beginners Class', es: 'Nueva Clase para Principiantes' },
    content: { en: 'We are starting a new beginners class every Wednesday. Perfect for new players!', es: 'Comenzamos una nueva clase para principiantes todos los miércoles. ¡Perfecto para nuevos jugadores!' },
    date: Timestamp.fromDate(new Date('2024-07-18')),
    category: 'class',
  },
  {
    id: 'ann-3',
    title: { en: 'Club T-Shirts Available', es: 'Camisetas del Club Disponibles' },
    content: { en: 'Official Inverness Eagles t-shirts are now available for purchase at the front desk.', es: 'Las camisetas oficiales de los Inverness Eagles ya están disponibles para su compra en la recepción.' },
    date: Timestamp.fromDate(new Date('2024-07-15')),
    category: 'general',
  },
];


// --- DIRECT CHATS ---

export const mockDirectChats: DirectChat[] = [
    {
        id: 'dm-1',
        participants: [mockUsers[0], mockUsers[1]],
        messages: [
            { id: 'dm-1-1', sender: mockUsers[0], content: 'Hey Maria, are you going to the advanced session on Friday?', timestamp: Timestamp.now() },
            { id: 'dm-1-2', sender: mockUsers[1], content: 'Hey Manu! I was thinking about it. You think I can handle it?', timestamp: Timestamp.now() },
            { id: 'dm-1-3', sender: mockUsers[0], content: 'For sure, you\'ll be great!', timestamp: Timestamp.now() },
        ],
    },
    {
        id: 'dm-2',
        participants: [mockUsers[0], mockUsers[2]],
        messages: [
             { id: 'dm-2-1', sender: mockUsers[2], content: 'Hi Manu, just wanted to say thanks for the pointers in the last beginner session!', timestamp: Timestamp.now() },
        ]
    }
]
