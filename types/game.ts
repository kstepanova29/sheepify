export interface Sheep {
  id: string;
  name: string;
  earnedDate: Date;
  woolProduction: number; // wool blocks per day
  outfit?: string;
  isAlive: boolean;
}

export interface SleepSession {
  id: string;
  date: Date;
  bedTime: Date;
  wakeTime: Date;
  duration: number; // in hours
  quality: 'poor' | 'good' | 'perfect'; // <6hrs, 6-8hrs, 8-10hrs
}

export interface User {
  id: string;
  username: string;
  sheep: Sheep[];
  woolBlocks: number;
  shepherdTokens: number;
  prankTokens: number;
  streak: number;
  totalSheepEarned: number;
  lastSleepDate: Date | null;
  penalties: {
    lambChopWarning: number; // 0-3 bad nights
    isInPenalty: boolean;
  };
}

export interface Friend {
  id: string;
  username: string;
  sheep: number;
  woolBlocks: number;
  streak: number;
  lastSleepQuality: 'poor' | 'good' | 'perfect';
}

export interface PrankAlarm {
  id: string;
  type: 'screaming-sheep' | 'meme-distortion' | 'custom';
  name: string;
  woolCost: number;
  unlockStreak: number;
}

export interface SleepWar {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  participants: Friend[];
  winnerId?: string;
}
