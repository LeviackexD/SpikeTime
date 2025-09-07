export type UserRole = 'user' | 'admin';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All-Rounder';
export type PlayerPosition = 'Setter' | 'Hitter' | 'Libero' | 'Blocker' | 'All-Rounder';

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: UserRole;
  skillLevel: SkillLevel;
  favoritePosition: PlayerPosition;
  stats: {
    sessionsPlayed: number;
    sessionsCancelled: number;
  };
}

export interface Session {
  id: string;
  date: string;
  time: string;
  location: string;
  level: SkillLevel;
  players: User[];
  maxPlayers: number;
  waitlist: User[];
  imageUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}
