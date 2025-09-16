
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type PlayerPosition = 'Setter' | 'Hitter' | 'Libero' | 'Blocker';

export const skillLevelColors: Record<SkillLevel, string> = {
  'Beginner': 'hsl(142 71% 45%)',     // Green
  'Intermediate': 'hsl(217 91% 60%)',  // Blue
  'Advanced': 'hsl(25 95% 53%)',     // Orange
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
  timestamp: string | Timestamp;
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
    participantIds: string[];
    participants: User[];
    messages: Message[];
}
