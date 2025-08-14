import { useState, useCallback } from 'react';
import { GameState, Block, GameMode, ChallengeLevel } from '../types/game';
import { createInitialBlock, createNewBlock, calculateCollision, calculateScore } from '../utils/gameLogic';
import { GAME_CONFIG, CHALLENGE_LEVELS } from '../constants/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    blocks: [createInitialBlock()],
    score: 0,
    combo: 0,
    perfectBlocks: 0,
    gameOver: false,
    gameStarted: false,
    tower_height: 1,
    currentBlock: null,
    highScore: 0,
    mode: 'classic',
    coins: 0,
    currentTheme: 'default',
    unlockedThemes: ['default'],
    unlockedSkins: [],
    dailyChallengeCompleted: false,
    lastDailyChallengeDate: '',
    rewardsGranted: false,
  });

  const startGame = useCallback((mode: GameMode = 'classic', level?: ChallengeLevel) => {
    const initialBlock = createInitialBlock();
    const firstMovingBlock = createNewBlock(initialBlock, 1, mode, level);

    setGameState(prev => ({
      ...prev,
      blocks: [initialBlock],
      score: 0,
      combo: 0,
      perfectBlocks: 0,
      gameOver: false,
      gameStarted: true,
      tower_height: 1,
      currentBlock: firstMovingBlock,
      mode,
      level: level?.id,
      timeRemaining: mode === 'timeAttack' ? GAME_CONFIG.TIME_ATTACK_DURATION : level?.timeLimit,
      rewardsGranted: false,
    }));
  }, []);

  const dropBlock = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentBlock || prev.gameOver) return prev;

      const topBlock = prev.blocks[prev.blocks.length - 1];
      const collision = calculateCollision(prev.currentBlock, topBlock);

      if (collision.newWidth <= 0) {
        return {
          ...prev,
          gameOver: true,
          currentBlock: null,
          gameStarted: false
        };
      }

      const newBlock: Block = {
        ...prev.currentBlock,
        x: collision.newX,
        width: collision.newWidth,
        isMoving: false,
      };

      const newCombo = collision.isPerfect ? prev.combo + 1 : 0;
      const newPerfectBlocks = collision.isPerfect ? prev.perfectBlocks + 1 : prev.perfectBlocks;
      const scoreIncrease = calculateScore(prev.tower_height, newCombo, collision.isPerfect, prev.mode);

      // Check if challenge/time attack mode objectives are met
      const isComplete = checkModeCompletion(prev, newBlock);

      if (isComplete) {
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
          currentBlock: null,
          score: prev.score + scoreIncrease,
          combo: newCombo,
          perfectBlocks: newPerfectBlocks,
          tower_height: prev.tower_height + 1,
          gameOver: true,
          gameStarted: false
        };
      }

      const nextMovingBlock = createNewBlock(
        newBlock,
        prev.tower_height + 1,
        prev.mode,
        prev.level ? CHALLENGE_LEVELS.find(l => l.id === prev.level) : undefined
      );

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        currentBlock: nextMovingBlock,
        score: prev.score + scoreIncrease,
        combo: newCombo,
        perfectBlocks: newPerfectBlocks,
        tower_height: prev.tower_height + 1,
      };
    });
  }, []);

  const checkModeCompletion = (state: GameState, newBlock: Block): boolean => {
    if (state.mode === 'challenge' && state.level) {
      const challengeLevel = CHALLENGE_LEVELS.find(l => l.id === state.level);
      if (challengeLevel && state.tower_height >= challengeLevel.targetBlocks) {
        return true;
      }
    }
    return false;
  };

  const updateTimer = useCallback(() => {
    setGameState(prev => {
      if (prev.mode !== 'timeAttack' || !prev.gameStarted || prev.gameOver) return prev;

      const newTime = (prev.timeRemaining || 0) - 1;

      if (newTime <= 0) {
        return {
          ...prev,
          timeRemaining: 0,
          gameOver: true,
          currentBlock: null,
          gameStarted: false
        };
      }

      return {
        ...prev,
        timeRemaining: newTime,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      blocks: [createInitialBlock()],
      score: 0,
      combo: 0,
      perfectBlocks: 0,
      gameOver: false,
      gameStarted: false,
      tower_height: 1,
      currentBlock: null,
      timeRemaining: undefined,
      level: 1,
      rewardsGranted: false,
    }));
  }, []);

  const updateCurrentBlockPosition = useCallback((newX: number, newDirection?: 'left' | 'right') => {
    setGameState(prev => {
      if (!prev.currentBlock) return prev;

      return {
        ...prev,
        currentBlock: {
          ...prev.currentBlock,
          x: newX,
          ...(newDirection && { direction: newDirection }),
        },
      };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount),
    }));
  }, []);

  const unlockTheme = useCallback((themeId: string) => {
    setGameState(prev => ({
      ...prev,
      unlockedThemes: [...prev.unlockedThemes, themeId],
    }));
  }, []);

  const setCurrentTheme = useCallback((themeId: string) => {
    setGameState(prev => ({
      ...prev,
      currentTheme: themeId,
    }));
  }, []);

  const completeDailyChallenge = useCallback(() => {
    const today = new Date().toDateString();
    setGameState(prev => ({
      ...prev,
      dailyChallengeCompleted: true,
      lastDailyChallengeDate: today,
    }));
  }, []);

  return {
    gameState,
    startGame,
    dropBlock,
    resetGame,
    updateCurrentBlockPosition,
    updateTimer,
    addCoins,
    spendCoins,
    unlockTheme,
    setCurrentTheme,
    completeDailyChallenge,
    setGameState,
  };
};