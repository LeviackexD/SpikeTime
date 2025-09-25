
export type UserRole = 'user' | 'admin';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type PlayerPosition = 'Setter' | 'Hitter' | 'Libero' | 'Blocker';
export type AnnouncementCategory = 'event' | 'class' | 'tournament' | 'general';

export type LocalizedString = {
  en: string;
  es: string;
};


export const skillLevelColors = {
  'Beginner': 'bg-green-500',
  'Intermediate': 'bg-blue-500',
  'Advanced': 'bg-orange-500',
};


export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  skillLevel: SkillLevel;
  favoritePosition: PlayerPosition;
  stats?: {
    sessionsPlayed: number;
    attendanceRate: number;
  };
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  level: SkillLevel;
  players: Partial<User>[];
  maxPlayers: number;
  waitlist: Partial<User>[];
  imageUrl?: string;
  momentImageUrl?: string | null;
  messages: Message[];
  createdBy?: string; // Admin User ID
}

export interface Announcement {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  date: Date;
  category: AnnouncementCategory;
}

export interface DirectChat {
    id: string;
    participants: User[];
    messages: Message[];
}
