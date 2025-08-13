import { Dimensions } from 'react-native';
import { GameModeConfig, ChallengeLevel, Theme } from '../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GAME_CONFIG = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BLOCK_HEIGHT: 40,
  INITIAL_BLOCK_WIDTH: 120,
  INITIAL_SPEED: 2,
  SPEED_INCREMENT: 0.3,
  MAX_SPEED: 8,
  PERFECT_THRESHOLD: 5,
  COMBO_MULTIPLIER: 10,
  BASE_SCORE: 100,
  TIME_ATTACK_DURATION: 60, // seconds
  DAILY_CHALLENGE_REWARD: 50,
} as const;

export const COLORS = {
  blocks: [
    ['#FF6B6B', '#FF8E8E'],
    ['#4ECDC4', '#6FE3DC'],
    ['#45B7D1', '#6BC5E8'],
    ['#96CEB4', '#B8D8C7'],
    ['#FFEAA7', '#FFDD94'],
    ['#DDA0DD', '#E6B3E6'],
    ['#FF9FF3', '#FFB3F7'],
    ['#54A0FF', '#74B9FF'],
  ],
  background: {
    start: '#667eea',
    end: '#764ba2',
  },
} as const;

export const ANIMATION_CONFIG = {
  DURATION: 300,
  BOUNCE_DURATION: 150,
  CAMERA_SCALE_FACTOR: 0.02,
  CAMERA_PAN_FACTOR: 5,
} as const;

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Endless stacking with increasing difficulty',
    icon: 'infinity',
    unlocked: true,
  },
  {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Stack as many blocks as possible in 60 seconds',
    icon: 'clock',
    unlocked: true,
  },
  {
    id: 'challenge',
    name: 'Challenge',
    description: 'Complete levels with unique objectives',
    icon: 'target',
    unlocked: true,
  },
];

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 1,
    name: 'Perfect Start',
    description: 'Stack 5 blocks perfectly',
    objective: 'Stack 5 blocks with perfect alignment',
    targetBlocks: 5,
    completed: false,
    stars: 0,
  },
  {
    id: 2,
    name: 'Speed Demon',
    description: 'Stack 10 blocks in 30 seconds',
    objective: 'Stack 10 blocks within 30 seconds',
    targetBlocks: 10,
    timeLimit: 30,
    completed: false,
    stars: 0,
  },
  {
    id: 3,
    name: 'Slippery Slope',
    description: 'Handle slippery blocks',
    objective: 'Stack 8 blocks including slippery ones',
    targetBlocks: 8,
    specialBlocks: ['slippery'],
    completed: false,
    stars: 0,
  },
  {
    id: 4,
    name: 'Heavy Duty',
    description: 'Stack heavy blocks',
    objective: 'Stack 6 heavy blocks perfectly',
    targetBlocks: 6,
    specialBlocks: ['heavy'],
    completed: false,
    stars: 0,
  },
  {
    id: 5,
    name: 'Master Builder',
    description: 'Ultimate challenge',
    objective: 'Stack 15 blocks with mixed types',
    targetBlocks: 15,
    specialBlocks: ['slippery', 'heavy', 'irregular'],
    completed: false,
    stars: 0,
  },
];

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Classic',
    backgroundColors: ['#667eea', '#764ba2'],
    blockColors: [
      ['#FF6B6B', '#FF8E8E'],
      ['#4ECDC4', '#6FE3DC'],
      ['#45B7D1', '#6BC5E8'],
      ['#96CEB4', '#B8D8C7'],
      ['#FFEAA7', '#FFDD94'],
      ['#DDA0DD', '#E6B3E6'],
      ['#FF9FF3', '#FFB3F7'],
      ['#54A0FF', '#74B9FF'],
    ],
    unlocked: true,
    cost: 0,
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    backgroundColors: ['#0f0f23', '#1a1a2e'],
    blockColors: [
      ['#ff0080', '#ff4da6'],
      ['#00ff80', '#4dff9f'],
      ['#8000ff', '#a64dff'],
      ['#ff8000', '#ff9f4d'],
      ['#0080ff', '#4d9fff'],
      ['#ff0040', '#ff4d73'],
      ['#40ff00', '#73ff4d'],
      ['#0040ff', '#4d73ff'],
    ],
    unlocked: false,
    cost: 100,
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    backgroundColors: ['#1e3c72', '#2a5298'],
    blockColors: [
      ['#00b4db', '#0083b0'],
      ['#74b9ff', '#0984e3'],
      ['#81ecec', '#00cec9'],
      ['#a29bfe', '#6c5ce7'],
      ['#fd79a8', '#e84393'],
      ['#fdcb6e', '#e17055'],
      ['#55a3ff', '#2d3436'],
      ['#00b894', '#00a085'],
    ],
    unlocked: false,
    cost: 150,
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    backgroundColors: ['#ff7e5f', '#feb47b'],
    blockColors: [
      ['#ff6b6b', '#ee5a52'],
      ['#ffa726', '#ff9800'],
      ['#ffee58', '#ffeb3b'],
      ['#66bb6a', '#4caf50'],
      ['#42a5f5', '#2196f3'],
      ['#ab47bc', '#9c27b0'],
      ['#ef5350', '#f44336'],
      ['#26c6da', '#00bcd4'],
    ],
    unlocked: false,
    cost: 200,
  },
];