// gameLogic.ts - Ultra-optimized version preserving all functionality

import { Block, GameMode, ChallengeLevel } from '../types/game';
import { GAME_CONFIG, COLORS, THEMES } from '../constants/game';

// Performance optimization: Pre-calculated constants with INCREASED SPEEDS
const SCREEN_WIDTH = GAME_CONFIG.SCREEN_WIDTH;
const SCREEN_HEIGHT = GAME_CONFIG.SCREEN_HEIGHT;
const BLOCK_HEIGHT = GAME_CONFIG.BLOCK_HEIGHT;
const INITIAL_BLOCK_WIDTH = GAME_CONFIG.INITIAL_BLOCK_WIDTH;
const INITIAL_SPEED = GAME_CONFIG.INITIAL_SPEED;
const SPEED_INCREMENT = GAME_CONFIG.SPEED_INCREMENT;
const MAX_SPEED = GAME_CONFIG.MAX_SPEED;
const BASE_SCORE = GAME_CONFIG.BASE_SCORE;
const COMBO_MULTIPLIER = GAME_CONFIG.COMBO_MULTIPLIER;
const PERFECT_THRESHOLD = GAME_CONFIG.PERFECT_THRESHOLD;

// ENHANCED SPEED CONSTANTS for significant speed increase
const SPEED_MULTIPLIER_BASE = 3.2; // Increased from 2.2 for much faster base speed
const SPEED_INCREMENT_MULTIPLIER = 2.8; // Increased from 1.5 for faster progression
const MAX_SPEED_MULTIPLIER = 2.2; // Increased from 1.2 for higher top speeds
const LEVEL_SPEED_BOOST = 0.15; // Additional speed boost per level for exponential growth

// Pre-calculated positioning values
const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;
const INITIAL_BLOCK_X = (SCREEN_WIDTH - INITIAL_BLOCK_WIDTH) / 2;
const INITIAL_BLOCK_Y = SCREEN_HEIGHT - 200;
const COLOR_COUNT = COLORS.blocks.length;

// Object pooling for frequently created objects
const blockPool = {
  pool: [] as Block[],
  get(): Block {
    return this.pool.pop() || {} as Block;
  },
  release(block: Block): void {
    // Clear properties for reuse
    Object.keys(block).forEach(key => delete (block as any)[key]);
    if (this.pool.length < 100) this.pool.push(block);
  }
};

// Cache for expensive calculations
const speedCache = new Map<string, number>();
const colorCache = new Map<string, readonly [string, string]>();

export const createInitialBlock = (): Block => {
  const block = blockPool.get();
  
  // Directly assign properties for better performance
  block.id = 'base';
  block.x = INITIAL_BLOCK_X;
  block.y = INITIAL_BLOCK_Y;
  block.width = INITIAL_BLOCK_WIDTH;
  block.height = BLOCK_HEIGHT;
  block.color = COLORS.blocks[0][0];
  block.isMoving = false;
  block.direction = 'right';
  block.speed = 0;
  block.type = 'normal';
  
  return block;
};

export const createNewBlock = (
  previousBlock: Block,
  level: number,
  mode: GameMode = 'classic',
  challengeLevel?: ChallengeLevel
): Block => {
  const block = blockPool.get();
  const colorIndex = level % COLOR_COUNT;
  
  // SIGNIFICANTLY ENHANCED SPEED CALCULATION with aggressive progression
  const speedCacheKey = `${level}-${mode}-${challengeLevel?.id || 'none'}`;
  let speed = speedCache.get(speedCacheKey);
  
  if (speed === undefined) {
    // MUCH MORE AGGRESSIVE base speed calculation
    const baseSpeed = INITIAL_SPEED * SPEED_MULTIPLIER_BASE; // 3.2x faster base
    const incrementalSpeed = level * (SPEED_INCREMENT * SPEED_INCREMENT_MULTIPLIER); // 2.8x faster progression
    const exponentialBoost = Math.pow(1 + LEVEL_SPEED_BOOST, Math.min(level, 25)); // Exponential growth capped at level 25
    
    // Calculate raw speed with exponential progression
    const rawSpeed = (baseSpeed + incrementalSpeed) * exponentialBoost;
    
    // Apply higher max speed limit
    const maxSpeedLimit = MAX_SPEED * MAX_SPEED_MULTIPLIER; // 2.2x higher max speed
    speed = Math.min(rawSpeed, maxSpeedLimit);

    // ENHANCED mode-specific speed multipliers
    if (mode === 'timeAttack') {
      speed *= 1.35; // Increased from 1.12 for more intense time attack
    } else if (mode === 'challenge' && challengeLevel?.specialBlocks) {
      speed *= 1.28; // Increased from 1.12 for faster challenge mode
    }
    
    // ADDITIONAL: Combo-based speed boost (if available from context)
    // This would need to be passed in, but for now we can simulate progressive speed
    if (level > 10) {
      speed *= 1 + ((level - 10) * 0.08); // 8% speed boost per level after 10
    }
    
    speedCache.set(speedCacheKey, speed);
  }

  // PRESERVED: Block type determination with enhanced speed adjustments
  let blockType: Block['type'] = 'normal';
  let friction = 1;
  let weight = 1;
  
  if (mode === 'challenge' && challengeLevel?.specialBlocks && level > 2) {
    const rand = Math.random();
    if (rand < 0.32) { // Slightly increased probability for more variety
      const specialTypes = challengeLevel.specialBlocks;
      const typeIndex = Math.floor(rand * specialTypes.length * 3.125);
      blockType = specialTypes[typeIndex % specialTypes.length];
      
      // ENHANCED special block speed adjustments
      switch (blockType) {
        case 'slippery':
          friction = 0.72;
          speed *= 1.45; // Increased from 1.32 for much faster slippery blocks
          break;
        case 'heavy':
          weight = 1.42;
          speed *= 0.82; // Slightly faster than before (was 0.89) to maintain challenge
          break;
        case 'irregular':
          speed *= 0.94; // Slightly faster than before for better flow
          break;
      }
    }
  }

  // Directly assign all properties for maximum performance
  block.id = `block-${level}`;
  block.x = 0;
  block.y = previousBlock.y - BLOCK_HEIGHT;
  block.width = previousBlock.width;
  block.height = BLOCK_HEIGHT;
  block.color = COLORS.blocks[colorIndex][0];
  block.isMoving = true;
  block.direction = 'right';
  block.speed = speed;
  block.type = blockType;
  block.friction = friction;
  block.weight = weight;

  return block;
};

// ENHANCED collision calculation with high-speed optimizations
export const calculateCollision = (
  movingBlock: Block,
  staticBlock: Block
): {
  newWidth: number;
  newX: number;
  isPerfect: boolean;
  slicedWidth: number;
  collisionAccuracy: number;
} => {
  // Use local variables for better performance
  const movingX = movingBlock.x;
  const movingWidth = movingBlock.width;
  const staticX = staticBlock.x;
  const staticWidth = staticBlock.width;
  
  const leftEdge = Math.max(movingX, staticX);
  const rightEdge = Math.min(movingX + movingWidth, staticX + staticWidth);
  const overlapWidth = Math.max(0, rightEdge - leftEdge);
  
  // ENHANCED: Perfect threshold with BETTER high-speed compensation
  let perfectThreshold = PERFECT_THRESHOLD;
  const blockSpeed = movingBlock.speed || 0;
  
  // MORE GENEROUS speed compensation for much higher speeds
  if (blockSpeed > 12) {
    perfectThreshold *= 1.8; // Much more generous for very high speeds
  } else if (blockSpeed > 8) {
    perfectThreshold *= 1.5; // More generous for high speeds
  } else if (blockSpeed > 6) {
    perfectThreshold *= 1.3; // Generous for medium-high speeds
  } else if (blockSpeed > 4) {
    perfectThreshold *= 1.15; // Slight help for medium speeds
  }

  // ENHANCED block type adjustments for high-speed gameplay
  const blockType = movingBlock.type;
  if (blockType === 'slippery') {
    perfectThreshold *= 1.6; // More generous for slippery blocks at high speed
  } else if (blockType === 'heavy') {
    perfectThreshold *= 0.9; // Slightly more forgiving for heavy blocks
  }

  const alignmentOffset = Math.abs(movingX - staticX);
  const isPerfect = alignmentOffset <= perfectThreshold;
  const slicedWidth = movingWidth - overlapWidth;
  
  // Enhanced collision accuracy calculation with speed consideration
  const maxOffset = movingWidth * 0.5;
  let collisionAccuracy = Math.max(0, 1 - (alignmentOffset / maxOffset));
  
  // Boost accuracy score for high-speed successful hits
  if (blockSpeed > 8 && collisionAccuracy > 0.6) {
    collisionAccuracy = Math.min(collisionAccuracy * 1.2, 1.0);
  }

  return {
    newWidth: overlapWidth,
    newX: leftEdge,
    isPerfect,
    slicedWidth,
    collisionAccuracy,
  };
};

// ULTRA-OPTIMIZED scoring with reduced calculations
export const calculateScore = (
  level: number,
  combo: number,
  isPerfect: boolean,
  mode: GameMode = 'classic',
  blockSpeed?: number
): number => {
  // Use bitwise operations where possible for integer calculations
  let baseScore = BASE_SCORE + (level << 5) + (level << 4) + (level << 1); // Equivalent to level * 50
  
  // Perfect bonus
  if (isPerfect) {
    baseScore <<= 1; // Equivalent to baseScore *= 2
  }

  // Speed bonus calculation optimized
  if (blockSpeed && blockSpeed > 5) {
    const speedBonus = Math.min((blockSpeed - 5) * 0.048, 0.28); // Slightly adjusted
    baseScore *= (1 + speedBonus);
  }

  // Combo bonus with optimized multiplication
  const comboBonus = combo * COMBO_MULTIPLIER;

  // Mode multipliers
  let modeMultiplier = 1;
  switch (mode) {
    case 'timeAttack':
      modeMultiplier = 1.48; // Slightly adjusted for balance
      break;
    case 'challenge':
      modeMultiplier = 1.18;
      break;
  }

  return Math.floor((baseScore + comboBonus) * modeMultiplier);
};

// OPTIMIZED theme functions with caching
export const getBackgroundColors = (themeId: string = 'default'): readonly [string, string] => {
  const cacheKey = `bg-${themeId}`;
  let colors = colorCache.get(cacheKey);
  
  if (!colors) {
    const theme = COLORS.themes[themeId as keyof typeof COLORS.themes];
    colors = theme ? theme.background : COLORS.themes.default.background;
    colorCache.set(cacheKey, colors);
  }
  
  return colors;
};

export const getBlockColors = (colorIndex: number, themeId: string = 'default'): readonly [string, string] => {
  const cacheKey = `block-${colorIndex}-${themeId}`;
  let colors = colorCache.get(cacheKey);
  
  if (!colors) {
    const theme = COLORS.themes[themeId as keyof typeof COLORS.themes];
    if (theme) {
      colors = theme.blocks[colorIndex % theme.blocks.length];
    } else {
      colors = COLORS.themes.default.blocks[colorIndex % COLORS.themes.default.blocks.length];
    }
    colorCache.set(cacheKey, colors);
  }
  
  return colors;
};

// OPTIMIZED daily challenge generation with reduced object creation and proper typing
export const generateDailyChallenge = (): import('../types/game').DailyChallenge => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  // Pre-defined challenges with consistent typing
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
      perfectBlocksRequired: undefined, // Explicitly undefined for type consistency
      reward: 75,
    },
    {
      description: 'Combo Master',
      objective: 'Achieve a 5x combo streak',
      targetBlocks: 8,
      perfectBlocksRequired: undefined, // Explicitly undefined for type consistency
      reward: 80,
    },
    {
      description: 'Tower Architect',
      objective: 'Build a tower of 20 blocks',
      targetBlocks: 20,
      perfectBlocksRequired: undefined, // Explicitly undefined for type consistency
      reward: 120,
    },
  ] as const;

  const challengeIndex = dayOfMonth & 3; // Bitwise modulo 4 for better performance
  const selectedChallenge = challenges[challengeIndex];
  const dateString = today.toDateString();

  // Handle perfectBlocksRequired properly with type safety
  const perfectBlocksRequired = selectedChallenge.perfectBlocksRequired;

  return {
    id: `daily-${dateString}`,
    date: dateString,
    description: selectedChallenge.description,
    objective: selectedChallenge.objective,
    targetBlocks: selectedChallenge.targetBlocks,
    perfectBlocksRequired: perfectBlocksRequired || undefined,
    reward: selectedChallenge.reward,
    completed: false,
  };
};

// ULTRA-OPTIMIZED challenge stars calculation
export const calculateChallengeStars = (
  level: ChallengeLevel,
  score: number,
  blocksStacked: number,
  perfectBlocks: number,
  completed: boolean,
  averageSpeed?: number
): number => {
  if (!completed) return 0;

  let stars = 1;
  
  // Optimized percentage calculation avoiding division where possible
  const perfectPercentage = blocksStacked > 0 ? perfectBlocks / blocksStacked : 0;
  const targetBlocks = level.targetBlocks;
  
  // Use pre-calculated thresholds
  const threshold2Stars = targetBlocks * 0.43; // Slightly adjusted
  const threshold3Stars = targetBlocks * 0.72; // Slightly adjusted

  if (perfectPercentage >= 0.36 || perfectBlocks >= threshold2Stars) {
    stars = 2;
  }

  if (perfectPercentage >= 0.62 || perfectBlocks >= threshold3Stars) {
    stars = 3;
  }

  // Speed-based bonus
  if (averageSpeed && averageSpeed > 5.8 && perfectPercentage >= 0.48) {
    stars = 3;
  }

  // Special requirements override
  if (level.perfectBlocksRequired && perfectBlocks >= level.perfectBlocksRequired) {
    stars = 3;
  }

  return stars;
};

// ULTRA-OPTIMIZED position interpolation with reduced calculations
export const interpolateBlockPosition = (
  currentX: number,
  targetX: number,
  speed: number,
  deltaTime: number
): number => {
  const distance = targetX - currentX;
  const absDistance = Math.abs(distance);
  const normalizedDelta = deltaTime * 0.05988; // Pre-calculated 1/16.67
  const moveAmount = speed * normalizedDelta;
  
  if (absDistance <= moveAmount) {
    return targetX;
  }
  
  return currentX + (distance > 0 ? moveAmount : -moveAmount);
};

// OPTIMIZED collision feedback with reduced object creation
export const getCollisionFeedback = (
  collisionAccuracy: number,
  isPerfect: boolean,
  blockSpeed: number
): {
  feedbackIntensity: number;
  feedbackDuration: number;
  feedbackType: 'perfect' | 'good' | 'normal' | 'poor';
} => {
  let feedbackType: 'perfect' | 'good' | 'normal' | 'poor';
  let feedbackIntensity: number;
  let feedbackDuration: number;

  if (isPerfect) {
    feedbackType = 'perfect';
    feedbackIntensity = 1.0;
    feedbackDuration = 280;
  } else if (collisionAccuracy > 0.78) {
    feedbackType = 'good';
    feedbackIntensity = 0.82;
    feedbackDuration = 240;
  } else if (collisionAccuracy < 0.32) {
    feedbackType = 'poor';
    feedbackIntensity = 0.32;
    feedbackDuration = 140;
  } else {
    feedbackType = 'normal';
    feedbackIntensity = 0.52;
    feedbackDuration = 190;
  }

  // High-speed adjustments
  if (blockSpeed > 5.5) {
    feedbackDuration = Math.floor(feedbackDuration * 1.15);
    feedbackIntensity = Math.min(feedbackIntensity * 1.08, 1.0);
  }

  return {
    feedbackIntensity,
    feedbackDuration,
    feedbackType,
  };
};

// PERFORMANCE UTILITY: Clear caches when needed
export const clearPerformanceCaches = (): void => {
  speedCache.clear();
  colorCache.clear();
  // Clear object pool if it gets too large
  if (blockPool.pool.length > 200) {
    blockPool.pool.length = 50;
  }
};

// PERFORMANCE UTILITY: Pre-warm caches for common values with ENHANCED SPEEDS
export const prewarmCaches = (): void => {
  // Pre-calculate common theme colors
  const commonThemes = ['default', 'neon', 'volcanic', 'arctic', 'galaxy'];
  commonThemes.forEach(themeId => {
    getBackgroundColors(themeId);
    for (let i = 0; i < 8; i++) {
      getBlockColors(i, themeId);
    }
  });
  
  // Pre-calculate common speed values with ENHANCED FORMULA
  const commonModes: GameMode[] = ['classic', 'timeAttack', 'challenge'];
  commonModes.forEach(mode => {
    for (let level = 1; level <= 30; level++) { // Extended to level 30 for higher progression
      const cacheKey = `${level}-${mode}-none`;
      if (!speedCache.has(cacheKey)) {
        // Use the same enhanced speed calculation as createNewBlock
        const baseSpeed = INITIAL_SPEED * SPEED_MULTIPLIER_BASE;
        const incrementalSpeed = level * (SPEED_INCREMENT * SPEED_INCREMENT_MULTIPLIER);
        const exponentialBoost = Math.pow(1 + LEVEL_SPEED_BOOST, Math.min(level, 25));
        
        let speed = Math.min(
          (baseSpeed + incrementalSpeed) * exponentialBoost,
          MAX_SPEED * MAX_SPEED_MULTIPLIER
        );
        
        if (mode === 'timeAttack') speed *= 1.35;
        if (mode === 'challenge') speed *= 1.28;
        
        // Additional progressive boost
        if (level > 10) {
          speed *= 1 + ((level - 10) * 0.08);
        }
        
        speedCache.set(cacheKey, speed);
      }
    }
  });
};