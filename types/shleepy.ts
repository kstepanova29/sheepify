export interface ShleepyMessage {
  id: string;
  content: string;
  type: 'affirmation' | 'roast' | 'pickup-line' | 'dream' | 'general';
  timestamp: Date;
  sleepSessionId?: string;
}

export interface ShleepyContext {
  sleepDuration: number;
  sleepQuality: 'poor' | 'good' | 'perfect';
  streak: number;
  penaltyWarning: number;
  totalSheep: number;
  lastSleepDate: Date | null;
}

export interface DreamSnippet {
  id: string;
  content: string;
  sleepDate: Date;
  sleepDuration: number;
}
