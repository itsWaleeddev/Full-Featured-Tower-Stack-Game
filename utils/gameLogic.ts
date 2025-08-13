import { Block, GameMode, ChallengeLevel } from '../types/game';
import { GAME_CONFIG, COLORS, THEMES } from '../constants/game';

export const createInitialBlock = (): Block => ({
  id: 'base',
  x: (GAME_CONFIG.SCREEN_WIDTH - GAME_CONFIG.INITIAL_BLOCK_WIDTH) / 2,
  y: GAME_CONFIG.SCREEN_HEIGHT - 200,
  width: GAME_CONFIG.INITIAL_BLOCK_WIDTH,
  height: GAME_CONFIG.BLOCK_HEIGHT,
  color: COLORS.blocks[0][0],
  isMoving: false,
  direction: 'right',
  speed: 0,
  type: 'normal',
});

export const createNewBlock = (
  previousBlock: Block,
  level: number,
  mode: GameMode = 'classic',
  challengeLevel?: ChallengeLevel
): Block => {
  const colorIndex = level % COLORS.blocks.length;
  let speed = Math.min(
    GAME_CONFIG.INITIAL_SPEED + level * GAME_CONFIG.SPEED_INCREMENT,
    GAME_CONFIG.MAX_SPEED
  );

  // Adjust speed for different modes
  if (mode === 'timeAttack') {
    speed *= 1.2; // Faster in time attack
  } else if (mode === 'challenge' && challengeLevel?.specialBlocks) {
    speed *= 0.8; // Slower for challenge mode with special blocks
  }

  // Determine block type for challenge mode
  let blockType: Block['type'] = 'normal';
  if (mode === 'challenge' && challengeLevel?.specialBlocks && level > 2) {
    const specialTypes = challengeLevel.specialBlocks;
    if (Math.random() < 0.3) { // 30% chance for special block
      blockType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
    }
  }

  // Adjust properties based on block type
  let friction = 1;
  let weight = 1;
  
  switch (blockType) {
    case 'slippery':
      friction = 0.7;
      speed *= 1.3;
      break;
    case 'heavy':
      weight = 1.5;
      speed *= 0.7;
      break;
    case 'irregular':
      speed *= 0.9;
      break;
  }

  return {
    id: `block-${level}`,
    x: 0,
    y: previousBlock.y - GAME_CONFIG.BLOCK_HEIGHT,
    width: previousBlock.width,
    height: GAME_CONFIG.BLOCK_HEIGHT,
    color: COLORS.blocks[colorIndex][0],
    isMoving: true,
    direction: 'right',
    speed,
    type: blockType,
    friction,
    weight,
  };
};

export const calculateCollision = (
  movingBlock: Block,
  staticBlock: Block
): { 
  newWidth: number; 
  newX: number; 
  isPerfect: boolean;
  slicedWidth: number;
} => {
  const leftEdge = Math.max(movingBlock.x, staticBlock.x);
  const rightEdge = Math.min(
    movingBlock.x + movingBlock.width,
    staticBlock.x + staticBlock.width
  );

  const overlapWidth = Math.max(0, rightEdge - leftEdge);
  
  // Adjust perfect threshold based on block type
  let perfectThreshold = GAME_CONFIG.PERFECT_THRESHOLD;
  if (movingBlock.type === 'slippery') {
    perfectThreshold *= 1.5; // Harder to get perfect with slippery blocks
  } else if (movingBlock.type === 'heavy') {
    perfectThreshold *= 0.8; // Easier to get perfect with heavy blocks
  }
  
  const isPerfect = Math.abs(movingBlock.x - staticBlock.x) <= perfectThreshold;
  const slicedWidth = movingBlock.width - overlapWidth;

  return {
    newWidth: overlapWidth,
    newX: leftEdge,
    isPerfect,
    slicedWidth,
  };
};

export const calculateScore = (
  level: number,
  combo: number,
  isPerfect: boolean,
  mode: GameMode = 'classic'
): number => {
  let baseScore = GAME_CONFIG.BASE_SCORE + level * 50;
  
  if (isPerfect) {
    baseScore *= 2;
  }
  
  const comboBonus = combo * GAME_CONFIG.COMBO_MULTIPLIER;
  
  // Mode-specific multipliers
  let modeMultiplier = 1;
  if (mode === 'timeAttack') {
    modeMultiplier = 1.5;
  } else if (mode === 'challenge') {
    modeMultiplier = 1.2;
  }
  
  return Math.floor((baseScore + comboBonus) * modeMultiplier);
};

export const getBackgroundColors = (themeId: string = 'default'): readonly [string, string] => {
  const theme = COLORS.themes[themeId as keyof typeof COLORS.themes];
  if (!theme) {
    return COLORS.themes.default.background;
  }
  return theme.background;
};

export const getBlockColors = (colorIndex: number, themeId: string = 'default'): readonly [string, string] => {
  const theme = COLORS.themes[themeId as keyof typeof COLORS.themes];
  if (!theme) {
    // Fallback to default theme if theme not found
    return COLORS.themes.default.blocks[colorIndex % COLORS.themes.default.blocks.length];
  }
  return theme.blocks[colorIndex % theme.blocks.length];
};

export const generateDailyChallenge = (): import('../types/game').DailyChallenge => {
  const today = new Date();
  const challenges = [
    {
      description: 'Perfect Precision',
      objective: 'Stack 10 blocks with perfect alignment',
      targetBlocks: 10,
      perfectBlocksRequired: 10,
      reward: 100,
    },
    {
      description: 'Speed Builder',
      objective: 'Stack 15 blocks in under 2 minutes',
      targetBlocks: 15,
      reward: 75,
    },
    {
      description: 'Combo Master',
      objective: 'Achieve a 5x combo streak',
      targetBlocks: 8,
      reward: 80,
    },
    {
      description: 'Tower Architect',
      objective: 'Build a tower of 20 blocks',
      targetBlocks: 20,
      reward: 120,
    },
  ];

  const challengeIndex = today.getDate() % challenges.length;
  const challenge = challenges[challengeIndex];

  return {
    id: `daily-${today.toDateString()}`,
    date: today.toDateString(),
    ...challenge,
    completed: false,
  };
};

export const calculateChallengeStars = (
  level: ChallengeLevel,
  score: number,
  blocksStacked: number,
  perfectBlocks: number
): number => {
  let stars = 0;
  
  // Base star for completion
  if (blocksStacked >= level.targetBlocks) {
    stars = 1;
  }
  
  // Second star for good performance
  if (perfectBlocks >= Math.floor(level.targetBlocks * 0.5)) {
    stars = 2;
  }
  
  // Third star for excellent performance
  if (perfectBlocks >= Math.floor(level.targetBlocks * 0.8)) {
    stars = 3;
  }
  
  return stars;
};