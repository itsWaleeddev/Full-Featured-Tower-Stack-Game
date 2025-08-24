// gameLogic.ts - Ultra-optimized version with complete difficulty implementation

import { Block, GameMode, ChallengeLevel } from '../types/game';
import { GAME_CONFIG, COLORS, THEMES } from '../constants/game';

// Performance optimization: Pre-calculated constants with DIFFICULTY-BASED SPEEDS
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

// DIFFICULTY CONSTANTS - Pre-calculated for ultra performance
const DIFFICULTY_MULTIPLIERS = {
  easy: {
    baseSpeed: 2.0,        // Slower base speed multiplier
    progression: 1.8,      // Gentler progression
    maxSpeed: 1.6,         // Lower max speed cap
    levelBoost: 0.08,      // Slower level-based acceleration
    perfectThreshold: 2.2, // More forgiving perfect threshold
    comboBoost: 0.05,      // Smaller combo speed bonus
    modeBonus: 0.9         // Reduced mode bonuses
  },
  medium: {
    baseSpeed: 3.2,        // Original multiplier
    progression: 2.8,      // Original progression
    maxSpeed: 2.2,         // Original max speed
    levelBoost: 0.15,      // Original level boost
    perfectThreshold: 1.0, // Original threshold
    comboBoost: 0.08,      // Original combo boost
    modeBonus: 1.0         // Original mode bonuses
  },
  hard: {
    baseSpeed: 4.8,        // Much faster base speed
    progression: 3.6,      // Aggressive progression
    maxSpeed: 2.8,         // Higher max speed cap
    levelBoost: 0.22,      // Faster level-based acceleration
    perfectThreshold: 0.7, // Stricter perfect threshold
    comboBoost: 0.12,      // Larger combo speed bonus
    modeBonus: 1.2         // Increased mode bonuses
  }
} as const;

type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Pre-calculated positioning values
const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;
const INITIAL_BLOCK_X = (SCREEN_WIDTH - INITIAL_BLOCK_WIDTH) / 2;
const INITIAL_BLOCK_Y = SCREEN_HEIGHT - 160; 
const COLOR_COUNT = COLORS.blocks.length;

// Object pooling for frequently created objects
const blockPool = {
  pool: [] as Block[],
  get(): Block {
    return this.pool.pop() || {} as Block;
  },
  release(block: Block): void {
    Object.keys(block).forEach(key => delete (block as any)[key]);
    if (this.pool.length < 100) this.pool.push(block);
  }
};

// Enhanced cache with difficulty-based keys
const speedCache = new Map<string, number>();
const colorCache = new Map<string, readonly [string, string]>();

export const createInitialBlock = (): Block => {
  const block = blockPool.get();

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
  challengeLevel?: ChallengeLevel,
  difficulty: DifficultyLevel = 'medium',
  combo: number = 0  // Added combo parameter for speed boost
): Block => {
  const block = blockPool.get();
  const colorIndex = level % COLOR_COUNT;
  
  // Get difficulty settings
  const diffSettings = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // ENHANCED SPEED CALCULATION with difficulty-based cache key
  const speedCacheKey = `${level}-${mode}-${challengeLevel?.id || 'none'}-${difficulty}-${Math.min(combo, 10)}`;
  let speed = speedCache.get(speedCacheKey);

  if (speed === undefined) {
    // Base speed calculation with difficulty multiplier
    const baseSpeed = INITIAL_SPEED * diffSettings.baseSpeed;
    const incrementalSpeed = level * (SPEED_INCREMENT * diffSettings.progression);
    const exponentialBoost = Math.pow(1 + diffSettings.levelBoost, Math.min(level, 25));

    // Calculate raw speed with exponential progression
    const rawSpeed = (baseSpeed + incrementalSpeed) * exponentialBoost;

    // Apply difficulty-based max speed limit
    const maxSpeedLimit = MAX_SPEED * diffSettings.maxSpeed;
    speed = Math.min(rawSpeed, maxSpeedLimit);

    // Mode-specific speed multipliers with difficulty adjustment
    let modeMultiplier = 1;
    if (mode === 'timeAttack') {
      modeMultiplier = 1.35 * diffSettings.modeBonus;
    } else if (mode === 'challenge' && challengeLevel?.specialBlocks) {
      modeMultiplier = 1.28 * diffSettings.modeBonus;
    } else if (mode === 'classic') {
      modeMultiplier = 1.0 * diffSettings.modeBonus;
    }
    speed *= modeMultiplier;

    // Progressive level boost (after level 10)
    if (level > 10) {
      const levelBoostMultiplier = 1 + ((level - 10) * diffSettings.levelBoost * 0.5);
      speed *= levelBoostMultiplier;
    }

    // Combo-based speed boost with difficulty scaling
    if (combo > 2) {
      const comboBoostMultiplier = 1 + (Math.min(combo - 2, 8) * diffSettings.comboBoost);
      speed *= comboBoostMultiplier;
    }

    speedCache.set(speedCacheKey, speed);
  }

  // Block type determination with difficulty-adjusted special block frequency
  let blockType: Block['type'] = 'normal';
  let friction = 1;
  let weight = 1;

  if (mode === 'challenge' && challengeLevel?.specialBlocks && level > 2) {
    // Adjust special block probability based on difficulty
    const baseProbability = 0.32;
    let adjustedProbability = baseProbability;
    
    if (difficulty === 'easy') {
      adjustedProbability *= 0.7; // Fewer special blocks on easy
    } else if (difficulty === 'hard') {
      adjustedProbability *= 1.3; // More special blocks on hard
    }

    const rand = Math.random();
    if (rand < adjustedProbability) {
      const specialTypes = challengeLevel.specialBlocks;
      const typeIndex = Math.floor(rand * specialTypes.length * 3.125);
      blockType = specialTypes[typeIndex % specialTypes.length];

      // Enhanced special block adjustments with difficulty scaling
      switch (blockType) {
        case 'slippery':
          friction = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 0.65 : 0.72;
          speed *= difficulty === 'easy' ? 1.25 : difficulty === 'hard' ? 1.65 : 1.45;
          break;
        case 'heavy':
          weight = difficulty === 'easy' ? 1.25 : difficulty === 'hard' ? 1.6 : 1.42;
          speed *= difficulty === 'easy' ? 0.9 : difficulty === 'hard' ? 0.75 : 0.82;
          break;
        case 'irregular':
          speed *= difficulty === 'easy' ? 0.98 : difficulty === 'hard' ? 0.88 : 0.94;
          break;
      }
    }
  }

  // Assign all properties
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

// Enhanced collision calculation with difficulty-based perfect threshold
export const calculateCollision = (
  movingBlock: Block,
  staticBlock: Block,
  difficulty: DifficultyLevel = 'medium'
): {
  newWidth: number;
  newX: number;
  isPerfect: boolean;
  slicedWidth: number;
  collisionAccuracy: number;
} => {
  const movingX = movingBlock.x;
  const movingWidth = movingBlock.width;
  const staticX = staticBlock.x;
  const staticWidth = staticBlock.width;

  const leftEdge = Math.max(movingX, staticX);
  const rightEdge = Math.min(movingX + movingWidth, staticX + staticWidth);
  const overlapWidth = Math.max(0, rightEdge - leftEdge);

  // Difficulty-based perfect threshold
  const diffSettings = DIFFICULTY_MULTIPLIERS[difficulty];
  let perfectThreshold = PERFECT_THRESHOLD * diffSettings.perfectThreshold;

  // Speed compensation with difficulty adjustment
  const blockSpeed = movingBlock.speed || 0;
  if (blockSpeed > 12) {
    perfectThreshold *= difficulty === 'easy' ? 2.2 : difficulty === 'hard' ? 1.4 : 1.8;
  } else if (blockSpeed > 8) {
    perfectThreshold *= difficulty === 'easy' ? 1.8 : difficulty === 'hard' ? 1.2 : 1.5;
  } else if (blockSpeed > 6) {
    perfectThreshold *= difficulty === 'easy' ? 1.5 : difficulty === 'hard' ? 1.1 : 1.3;
  } else if (blockSpeed > 4) {
    perfectThreshold *= difficulty === 'easy' ? 1.3 : difficulty === 'hard' ? 1.0 : 1.15;
  }

  // Block type adjustments with difficulty scaling
  const blockType = movingBlock.type;
  if (blockType === 'slippery') {
    perfectThreshold *= difficulty === 'easy' ? 2.0 : difficulty === 'hard' ? 1.3 : 1.6;
  } else if (blockType === 'heavy') {
    perfectThreshold *= difficulty === 'easy' ? 1.1 : difficulty === 'hard' ? 0.8 : 0.9;
  }

  const alignmentOffset = Math.abs(movingX - staticX);
  const isPerfect = alignmentOffset <= perfectThreshold;
  const slicedWidth = movingWidth - overlapWidth;

  // Enhanced collision accuracy with difficulty consideration
  const maxOffset = movingWidth * 0.5;
  let collisionAccuracy = Math.max(0, 1 - (alignmentOffset / maxOffset));

  // Difficulty-based accuracy boost for high-speed hits
  if (blockSpeed > 8 && collisionAccuracy > 0.6) {
    const accuracyBoost = difficulty === 'easy' ? 1.3 : difficulty === 'hard' ? 1.1 : 1.2;
    collisionAccuracy = Math.min(collisionAccuracy * accuracyBoost, 1.0);
  }

  return {
    newWidth: overlapWidth,
    newX: leftEdge,
    isPerfect,
    slicedWidth,
    collisionAccuracy,
  };
};

// Enhanced scoring with difficulty multipliers
export const calculateScore = (
  level: number,
  combo: number,
  isPerfect: boolean,
  mode: GameMode = 'classic',
  blockSpeed?: number,
  difficulty: DifficultyLevel = 'medium'
): number => {
  const diffSettings = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Base score calculation
  let baseScore = BASE_SCORE + (level << 5) + (level << 4) + (level << 1);

  // Perfect bonus
  if (isPerfect) {
    baseScore <<= 1;
  }

  // Speed bonus with difficulty adjustment
  if (blockSpeed && blockSpeed > 5) {
    const speedBonusBase = Math.min((blockSpeed - 5) * 0.048, 0.28);
    const speedBonus = speedBonusBase * diffSettings.modeBonus;
    baseScore *= (1 + speedBonus);
  }

  // Combo bonus
  const comboBonus = combo * COMBO_MULTIPLIER;

  // Mode multipliers with difficulty adjustment
  let modeMultiplier = 1;
  switch (mode) {
    case 'timeAttack':
      modeMultiplier = 1.48 * diffSettings.modeBonus;
      break;
    case 'challenge':
      modeMultiplier = 1.18 * diffSettings.modeBonus;
      break;
  }

  // Difficulty score multiplier
  let difficultyMultiplier = 1;
  switch (difficulty) {
    case 'easy':
      difficultyMultiplier = 0.85; // Slightly lower scores for easier gameplay
      break;
    case 'medium':
      difficultyMultiplier = 1.0; // Standard scoring
      break;
    case 'hard':
      difficultyMultiplier = 1.25; // Bonus scores for harder gameplay
      break;
  }

  return Math.floor((baseScore + comboBonus) * modeMultiplier * difficultyMultiplier);
};

// Rest of the functions remain the same but with difficulty parameter support
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

export const generateDailyChallenge = (): import('../types/game').DailyChallenge => {
  const today = new Date();
  const dayOfMonth = today.getDate();

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
      perfectBlocksRequired: undefined,
      reward: 75,
    },
    {
      description: 'Combo Master',
      objective: 'Achieve a 5x combo streak',
      targetBlocks: 8,
      perfectBlocksRequired: undefined,
      reward: 80,
    },
    {
      description: 'Tower Architect',
      objective: 'Build a tower of 20 blocks',
      targetBlocks: 20,
      perfectBlocksRequired: undefined,
      reward: 120,
    },
  ] as const;

  const challengeIndex = dayOfMonth & 3;
  const selectedChallenge = challenges[challengeIndex];
  const dateString = today.toDateString();
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

// Enhanced challenge stars calculation with difficulty consideration
export const calculateChallengeStars = (
  level: ChallengeLevel,
  score: number,
  blocksStacked: number,
  perfectBlocks: number,
  completed: boolean,
  averageSpeed?: number,
  difficulty: DifficultyLevel = 'medium'
): number => {
  if (!completed) return 0;

  let stars = 1;
  const perfectPercentage = blocksStacked > 0 ? perfectBlocks / blocksStacked : 0;
  const targetBlocks = level.targetBlocks;

  // Difficulty-adjusted thresholds
  let threshold2Stars = targetBlocks * 0.43;
  let threshold3Stars = targetBlocks * 0.72;
  let perfectPercentageThreshold2 = 0.36;
  let perfectPercentageThreshold3 = 0.62;

  if (difficulty === 'easy') {
    // More lenient thresholds for easy mode
    threshold2Stars *= 0.8;
    threshold3Stars *= 0.8;
    perfectPercentageThreshold2 *= 0.8;
    perfectPercentageThreshold3 *= 0.8;
  } else if (difficulty === 'hard') {
    // Stricter thresholds for hard mode
    threshold2Stars *= 1.2;
    threshold3Stars *= 1.2;
    perfectPercentageThreshold2 *= 1.2;
    perfectPercentageThreshold3 *= 1.2;
  }

  if (perfectPercentage >= perfectPercentageThreshold2 || perfectBlocks >= threshold2Stars) {
    stars = 2;
  }

  if (perfectPercentage >= perfectPercentageThreshold3 || perfectBlocks >= threshold3Stars) {
    stars = 3;
  }

  // Speed-based bonus with difficulty adjustment
  const speedThreshold = difficulty === 'easy' ? 4.5 : difficulty === 'hard' ? 7.5 : 5.8;
  const speedPerfectThreshold = difficulty === 'easy' ? 0.35 : difficulty === 'hard' ? 0.65 : 0.48;
  
  if (averageSpeed && averageSpeed > speedThreshold && perfectPercentage >= speedPerfectThreshold) {
    stars = 3;
  }

  // Special requirements override
  if (level.perfectBlocksRequired && perfectBlocks >= level.perfectBlocksRequired) {
    stars = 3;
  }

  return stars;
};

export const interpolateBlockPosition = (
  currentX: number,
  targetX: number,
  speed: number,
  deltaTime: number
): number => {
  const distance = targetX - currentX;
  const absDistance = Math.abs(distance);
  const normalizedDelta = deltaTime * 0.05988;
  const moveAmount = speed * normalizedDelta;

  if (absDistance <= moveAmount) {
    return targetX;
  }

  return currentX + (distance > 0 ? moveAmount : -moveAmount);
};

// Enhanced collision feedback with difficulty-based adjustments
export const getCollisionFeedback = (
  collisionAccuracy: number,
  isPerfect: boolean,
  blockSpeed: number,
  difficulty: DifficultyLevel = 'medium'
): {
  feedbackIntensity: number;
  feedbackDuration: number;
  feedbackType: 'perfect' | 'good' | 'normal' | 'poor';
} => {
  let feedbackType: 'perfect' | 'good' | 'normal' | 'poor';
  let feedbackIntensity: number;
  let feedbackDuration: number;

  // Difficulty-adjusted thresholds
  const goodThreshold = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 0.85 : 0.78;
  const poorThreshold = difficulty === 'easy' ? 0.25 : difficulty === 'hard' ? 0.4 : 0.32;

  if (isPerfect) {
    feedbackType = 'perfect';
    feedbackIntensity = 1.0;
    feedbackDuration = 280;
  } else if (collisionAccuracy > goodThreshold) {
    feedbackType = 'good';
    feedbackIntensity = 0.82;
    feedbackDuration = 240;
  } else if (collisionAccuracy < poorThreshold) {
    feedbackType = 'poor';
    feedbackIntensity = 0.32;
    feedbackDuration = 140;
  } else {
    feedbackType = 'normal';
    feedbackIntensity = 0.52;
    feedbackDuration = 190;
  }

  // High-speed adjustments with difficulty scaling
  const speedThreshold = difficulty === 'easy' ? 4.5 : difficulty === 'hard' ? 6.5 : 5.5;
  if (blockSpeed > speedThreshold) {
    const durationMultiplier = difficulty === 'easy' ? 1.2 : difficulty === 'hard' ? 1.1 : 1.15;
    const intensityMultiplier = difficulty === 'easy' ? 1.12 : difficulty === 'hard' ? 1.06 : 1.08;
    
    feedbackDuration = Math.floor(feedbackDuration * durationMultiplier);
    feedbackIntensity = Math.min(feedbackIntensity * intensityMultiplier, 1.0);
  }

  return {
    feedbackIntensity,
    feedbackDuration,
    feedbackType,
  };
};

// Performance utilities
export const clearPerformanceCaches = (): void => {
  speedCache.clear();
  colorCache.clear();
  if (blockPool.pool.length > 200) {
    blockPool.pool.length = 50;
  }
};

// Enhanced cache prewarming with difficulty support
export const prewarmCaches = (): void => {
  const commonThemes = ['default', 'neon', 'volcanic', 'arctic', 'galaxy'];
  commonThemes.forEach(themeId => {
    getBackgroundColors(themeId);
    for (let i = 0; i < 8; i++) {
      getBlockColors(i, themeId);
    }
  });

  // Pre-calculate speeds for all difficulty levels
  const commonModes: GameMode[] = ['classic', 'timeAttack', 'challenge'];
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  
  difficulties.forEach(difficulty => {
    const diffSettings = DIFFICULTY_MULTIPLIERS[difficulty];
    
    commonModes.forEach(mode => {
      for (let level = 1; level <= 30; level++) {
        for (let combo = 0; combo <= 10; combo += 2) {
          const cacheKey = `${level}-${mode}-none-${difficulty}-${combo}`;
          if (!speedCache.has(cacheKey)) {
            const baseSpeed = INITIAL_SPEED * diffSettings.baseSpeed;
            const incrementalSpeed = level * (SPEED_INCREMENT * diffSettings.progression);
            const exponentialBoost = Math.pow(1 + diffSettings.levelBoost, Math.min(level, 25));

            let speed = Math.min(
              (baseSpeed + incrementalSpeed) * exponentialBoost,
              MAX_SPEED * diffSettings.maxSpeed
            );

            // Apply mode multipliers
            let modeMultiplier = 1;
            if (mode === 'timeAttack') modeMultiplier = 1.35 * diffSettings.modeBonus;
            if (mode === 'challenge') modeMultiplier = 1.28 * diffSettings.modeBonus;
            speed *= modeMultiplier;

            // Progressive boost
            if (level > 10) {
              speed *= 1 + ((level - 10) * diffSettings.levelBoost * 0.5);
            }

            // Combo boost
            if (combo > 2) {
              speed *= 1 + (Math.min(combo - 2, 8) * diffSettings.comboBoost);
            }

            speedCache.set(cacheKey, speed);
          }
        }
      }
    });
  });
};