/**
 * @fileoverview Mock data for the application.
 * This file contains sample data for users, sessions, announcements, and direct chats
 * to be used in development when not connected to a live backend.
 */

import { Timestamp } from 'firebase/firestore';
import type { User, Session, Announcement, DirectChat, SkillLevel, PlayerPosition } from './types';

// --- USERS ---

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Manu',
    username: 'manu_admin',
    email: 'manu@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
    role: 'admin',
    skillLevel: 'Advanced',
    favoritePosition: 'Setter',
    stats: { sessionsPlayed: 45, attendanceRate: 98 },
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    username: 'mariag',
    email: 'maria@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    role: 'user',
    skillLevel: 'Intermediate',
    favoritePosition: 'Hitter',
    stats: { sessionsPlayed: 32, attendanceRate: 92 },
  },
  {
    id: 'user-3',
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    role: 'user',
    skillLevel: 'Beginner',
    favoritePosition: 'Libero',
    stats: { sessionsPlayed: 15, attendanceRate: 100 },
  },
   {
    id: 'user-4',
    name: 'Chen Wei',
    username: 'chenw',
    email: 'chen@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
    role: 'user',
    skillLevel: 'Advanced',
    favoritePosition: 'Blocker',
    stats: { sessionsPlayed: 55, attendanceRate: 95 },
  },
  {
    id: 'user-5',
    name: 'Sofia Rossi',
    username: 'sofiar',
    email: 'sofia@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
    role: 'user',
    skillLevel: 'Intermediate',
    favoritePosition: 'Setter',
    stats: { sessionsPlayed: 28, attendanceRate: 89 },
  },
    {
    id: 'user-6',
    name: 'David Smith',
    username: 'davids',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-6',
    email: 'david@example.com',
    role: 'user',
    skillLevel: 'Intermediate',
    favoritePosition: 'Hitter',
    stats: { sessionsPlayed: 20, attendanceRate: 90 },
  },
  {
    id: 'user-7',
    name: 'Emily White',
    username: 'emilyw',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-7',
    email: 'emily@example.com',
    role: 'user',
    skillLevel: 'Beginner',
    favoritePosition: 'Libero',
    stats: { sessionsPlayed: 10, attendanceRate: 95 },
  },
];

export const currentUser: User = mockUsers[0];

// --- DATES ---

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeks = new Date(today);
twoWeeks.setDate(twoWeeks.getDate() + 14);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);


// --- SESSIONS ---

export const mockSessions: Session[] = [
    {
        id: 'session-1',
        date: Timestamp.fromDate(tomorrow),
        startTime: '18:00',
        endTime: '20:00',
        location: 'Inverness Royal Academy',
        level: 'Advanced',
        players: [mockUsers[0], mockUsers[3], mockUsers[4]],
        maxPlayers: 12,
        waitlist: [],
        imageUrl: 'https://picsum.photos/seed/s1/400/300',
        messages: [
            { id: 'msg-1', sender: mockUsers[0], content: "Hey team, looking forward to the game tomorrow! Let's warm up at 5:45.", timestamp: Timestamp.now() },
            { id: 'msg-2', sender: mockUsers[3], content: "Sounds good, I'll be there!", timestamp: Timestamp.now() },
        ],
    },
    {
        id: 'session-2',
        date: Timestamp.fromDate(nextWeek),
        startTime: '19:00',
        endTime: '21:00',
        location: 'Millburn Academy',
        level: 'Intermediate',
        players: [mockUsers[1], mockUsers[2], mockUsers[4], mockUsers[5]],
        maxPlayers: 12,
        waitlist: [mockUsers[6]],
        imageUrl: 'https://picsum.photos/seed/s2/400/300',
        messages: [],
    },
    {
        id: 'session-3',
        date: Timestamp.fromDate(twoWeeks),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Charleston Academy',
        level: 'Beginner',
        players: [mockUsers[2]],
        maxPlayers: 12,
        waitlist: [],
        imageUrl: 'https://picsum.photos/seed/s3/400/300',
        messages: [],
    },
    {
        id: 'session-4',
        date: Timestamp.fromDate(tomorrow),
        startTime: '20:00',
        endTime: '22:00',
        location: 'Inverness Leisure Centre',
        level: 'Intermediate',
        players: [mockUsers[0], mockUsers[1], mockUsers[5], mockUsers[6]],
        maxPlayers: 12,
        waitlist: [],
        imageUrl: 'https://picsum.photos/seed/s4/400/300',
        messages: [],
    },
     {
        id: 'session-5',
        date: Timestamp.fromDate(lastWeek),
        startTime: '18:00',
        endTime: '20:00',
        location: 'Culloden Academy',
        level: 'Advanced',
        players: [mockUsers[0], mockUsers[1], mockUsers[3], mockUsers[4], mockUsers[5]],
        maxPlayers: 12,
        waitlist: [],
        imageUrl: 'https://picsum.photos/seed/s5/400/300',
        messages: [
            { id: 'msg-3', sender: mockUsers[0], content: "Great game last week everyone!", timestamp: Timestamp.fromDate(new Date(lastWeek.getTime() + 86400000)) },
        ],
    },
];

// --- ANNOUNCEMENTS ---

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: { en: 'Summer Tournament Signup', es: 'Inscripción Torneo de Verano' },
    content: { en: 'Signups for the annual summer beach volleyball tournament are now open! Find a partner and sign up by the end of the month.', es: '¡Ya están abiertas las inscripciones para el torneo anual de voleibol de playa de verano! Busca pareja e inscríbete antes de fin de mes.' },
    date: Timestamp.fromDate(new Date()),
    category: 'tournament',
  },
  {
    id: 'ann-2',
    title: { en: 'New Beginners Class', es: 'Nueva Clase de Principiantes' },
    content: { en: 'Starting next month, we will be hosting a new beginners class every Wednesday at 6 PM. Perfect for new players!', es: 'A partir del próximo mes, tendremos una nueva clase para principiantes todos los miércoles a las 6 PM. ¡Perfecto para nuevos jugadores!' },
    date: Timestamp.fromDate(new Date(today.getTime() - 86400000 * 2)),
    category: 'class',
  },
  {
    id: 'ann-3',
    title: { en: 'Club Social Night', es: 'Noche Social del Club' },
    content: { en: 'Join us for a club social night at The Waterfront pub this Friday at 8 PM. See you there!', es: 'Únete a nosotros para una noche social del club en el pub The Waterfront este viernes a las 8 PM. ¡Nos vemos allí!' },
    date: Timestamp.fromDate(new Date(today.getTime() - 86400000 * 5)),
    category: 'event',
  },
    {
    id: 'ann-4',
    title: { en: 'Facility Maintenance', es: 'Mantenimiento de Instalaciones' },
    content: { en: 'Please note that the Inverness Royal Academy courts will be closed for maintenance from the 5th to the 7th of next month.', es: 'Tengan en cuenta que las canchas de la Inverness Royal Academy estarán cerradas por mantenimiento del 5 al 7 del próximo mes.' },
    date: Timestamp.fromDate(new Date(today.getTime() - 86400000 * 10)),
    category: 'general',
  },
];

// --- DIRECT CHATS ---

export const mockDirectChats: DirectChat[] = [
    {
        id: 'chat-1',
        participants: [mockUsers[0], mockUsers[1]],
        messages: [
            { id: 'dm-1', sender: mockUsers[0], content: "Hey Maria, can you cover my spot on Tuesday?", timestamp: Timestamp.now() },
            { id: 'dm-2', sender: mockUsers[1], content: "Sure, no problem! Hope everything is okay.", timestamp: Timestamp.now() },
        ],
    },
    {
        id: 'chat-2',
        participants: [mockUsers[0], mockUsers[3]],
        messages: [],
    }
]
