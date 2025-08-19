type DifficultyLevel = 'easy' | 'medium' | 'hard';

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
  perfectBlocks: number;
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
  challengeProgress?: Record<number, ChallengeLevel>;
  currentUnlockedLevel?: number;
  highScores?: {
    classic: number;
    timeAttack: number;
    challenge: number;
  };
  totalGamesPlayed?: number;
  selectedDifficulty: DifficultyLevel
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
  perfectBlocksRequired?: number;
  bestScore?: number;
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
  backgroundColors: readonly [string, string, ...string[]];
  blockColors: readonly [string, string][];
  unlocked: boolean;
  cost: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
}

export interface ScoreRecord {
  mode: GameMode;
  score: number;
  date: string;
  level?: number;
  blocks: number;
  difficulty: DifficultyLevel;
}