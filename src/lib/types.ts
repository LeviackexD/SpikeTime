
export type UserRole = 'user' | 'admin';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All-Rounder';
export type PlayerPosition = 'Setter' | 'Hitter' | 'Libero' | 'Blocker' | 'All-Rounder';

export const skillLevelColors: Record<SkillLevel, string> = {
  'Beginner': 'bg-green-500',
  'Intermediate': 'bg-blue-500',
  'Advanced': 'bg-orange-500',
  'All-Rounder': 'bg-purple-500',
};


export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl: string;
  role: UserRole;
  skillLevel: SkillLevel;
  favoritePosition: PlayerPosition;
  stats: {
    sessionsPlayed: number;
  };
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  level: SkillLevel;
  players: string[];
  maxPlayers: number;
  waitlist: string[];
  imageUrl?: string;
  messages: Message[];
  createdBy?: string; // Admin User ID
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface DirectChat {
    id: string;
    participants: User[];
    messages: Message[];
}
