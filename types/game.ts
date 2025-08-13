export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isMoving: boolean;
  direction: 'left' | 'right';
  speed: number;
  type?: 'normal' | 'slippery' | 'heavy' | 'irregular';
  friction?: number;
  weight?: number;
}

export interface GameState {
  blocks: Block[];
  score: number;
  combo: number;
  gameOver: boolean;
  gameStarted: boolean;
  tower_height: number;
  currentBlock: Block | null;
  highScore: number;
  mode: GameMode;
  timeRemaining?: number;
  level?: number;
  coins: number;
  currentTheme: string;
  unlockedThemes: string[];
  unlockedSkins: string[];
  dailyChallengeCompleted: boolean;
  lastDailyChallengeDate: string;
  rewardsGranted: boolean;  // <-- add this line
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type GameMode = 'classic' | 'timeAttack' | 'challenge';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface ChallengeLevel {
  id: number;
  name: string;
  description: string;
  objective: string;
  targetBlocks: number;
  timeLimit?: number;
  specialBlocks?: Block['type'][];
  completed: boolean;
  stars: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  description: string;
  objective: string;
  reward: number;
  targetBlocks: number;
  perfectBlocksRequired?: number;
  completed: boolean;
}

export interface Theme {
  id: string;
  name: string;
  backgroundColors: [string, string];
  blockColors: [string, string][];
  unlocked: boolean;
  cost: number;
}

export interface ScoreRecord {
  mode: GameMode;
  score: number;
  date: string;
  level?: number;
  blocks: number;
}