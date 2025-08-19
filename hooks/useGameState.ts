import { useState, useCallback, useRef, useEffect } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { GameState, Block, GameMode, ChallengeLevel } from '../types/game';
import { createInitialBlock, createNewBlock, calculateCollision, calculateScore, calculateChallengeStars, getCollisionFeedback } from '../utils/gameLogic';
import { GAME_CONFIG, CHALLENGE_LEVELS } from '../constants/game';
import { saveGameData } from '../utils/storage';
import { useSound } from '../contexts/SoundContext';
import { useTheme } from '../contexts/GameContext';

export const useGameState = () => {
  const { playSound } = useSound();
  const soundPlayedRef = useRef<Set<string>>(new Set());
  const { themeState } = useTheme();
  
  // ✅ CRITICAL FIX: Use ref to always get the most current difficulty
  const currentDifficultyRef = useRef(themeState.selectedDifficulty);

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
    selectedDifficulty: themeState.selectedDifficulty
  });

  // ✅ CRITICAL: Keep ref synchronized with theme context difficulty
  useEffect(() => {
    currentDifficultyRef.current = themeState.selectedDifficulty;
    setGameState(prev => ({
      ...prev,
      selectedDifficulty: themeState.selectedDifficulty
    }));
  }, [themeState.selectedDifficulty]);

  // ✅ ENHANCED: Use ref for immediate access to current difficulty
  const startGame = useCallback((mode: GameMode = 'classic', level?: ChallengeLevel) => {
    soundPlayedRef.current.clear();

    const initialBlock = createInitialBlock();
    // ✅ FIX: Use ref to get the most current difficulty immediately
    const currentDifficulty = currentDifficultyRef.current;
    
    const firstMovingBlock = createNewBlock(
      initialBlock, 
      1, 
      mode, 
      level, 
      currentDifficulty, // Use ref value for immediate access
      0
    );

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
      selectedDifficulty: currentDifficulty, // Store current difficulty
    }));

    runOnJS(() => {
      saveGameData({
        mode,
        level: level?.id,
        gameStarted: true,
        selectedDifficulty: currentDifficulty,
      });
    })();
  }, []); // Remove dependency on themeState.selectedDifficulty since we use ref

  // ✅ ENHANCED: Use ref in all game logic functions
  const dropBlock = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentBlock || prev.gameOver) return prev;

      const topBlock = prev.blocks[prev.blocks.length - 1];
      // Use ref for immediate access to current difficulty
      const currentDifficulty = currentDifficultyRef.current;
      const collision = calculateCollision(prev.currentBlock, topBlock, currentDifficulty);

      runOnJS(() => {
        playSound('click', 0.6);
      })();

      if (collision.newWidth <= 0) {
        runOnJS(() => {
          playSound('failed', 0.8);
        })();

        return {
          ...prev,
          gameOver: true,
          currentBlock: null,
          gameStarted: false,
          selectedDifficulty: currentDifficulty
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
      
      const scoreIncrease = calculateScore(
        prev.tower_height, 
        newCombo, 
        collision.isPerfect, 
        prev.mode, 
        prev.currentBlock.speed, 
        currentDifficulty
      );

      runOnJS(() => {
        const feedback = getCollisionFeedback(
          collision.collisionAccuracy, 
          collision.isPerfect, 
          prev.currentBlock?.speed || 0, 
          currentDifficulty
        );

        if (collision.isPerfect) {
          playSound('chime', Math.min(0.7 + (feedback.feedbackIntensity - 0.5) * 0.6, 1.0));
        } else if (collision.collisionAccuracy > (currentDifficulty === 'hard' ? 0.8 : 0.7)) {
          playSound('drop', Math.min(0.5 + feedback.feedbackIntensity * 0.3, 0.8));
        } else {
          playSound('drop', Math.max(0.2, feedback.feedbackIntensity * 0.4));
        }
      })();

      const isComplete = checkModeCompletion(prev, newBlock);

      if (isComplete) {
        runOnJS(() => {
          playSound('success', 0.8);
        })();

        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
          currentBlock: null,
          score: prev.score + scoreIncrease,
          combo: newCombo,
          perfectBlocks: newPerfectBlocks,
          tower_height: prev.tower_height + 1,
          gameOver: true,
          gameStarted: false,
          selectedDifficulty: currentDifficulty
        };
      }

      // Create next block with current difficulty
      const nextMovingBlock = createNewBlock(
        newBlock,
        prev.tower_height + 1,
        prev.mode,
        prev.level ? CHALLENGE_LEVELS.find(l => l.id === prev.level) : undefined,
        currentDifficulty,
        newCombo
      );

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        currentBlock: nextMovingBlock,
        score: prev.score + scoreIncrease,
        combo: newCombo,
        perfectBlocks: newPerfectBlocks,
        tower_height: prev.tower_height + 1,
        selectedDifficulty: currentDifficulty
      };
    });
  }, [playSound]);

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
      if (prev.mode !== 'timeAttack' && !(prev.mode === 'challenge' && prev.timeRemaining !== undefined)) {
        return prev;
      }

      if (!prev.gameStarted || prev.gameOver) return prev;

      const newTime = Math.max(0, (prev.timeRemaining || 0) - 1);
      const currentDifficulty = currentDifficultyRef.current;

      if (newTime <= 0) {
        runOnJS(() => {
          playSound('failed', 0.8);
        })();

        return {
          ...prev,
          timeRemaining: 0,
          gameOver: true,
          currentBlock: null,
          gameStarted: false,
          selectedDifficulty: currentDifficulty
        };
      }

      const warningTimes = currentDifficulty === 'easy' 
        ? [15, 10, 5, 3, 1] 
        : currentDifficulty === 'hard' 
        ? [8, 5, 3, 2, 1] 
        : [10, 5, 3];

      if (warningTimes.includes(newTime)) {
        runOnJS(() => {
          const intensity = newTime <= 3 ? 0.9 : 0.6;
          playSound('click', intensity);
        })();
      }

      return {
        ...prev,
        timeRemaining: newTime,
        selectedDifficulty: currentDifficulty
      };
    });
  }, [playSound]);

  const resetGame = useCallback(() => {
    soundPlayedRef.current.clear();
    const currentDifficulty = currentDifficultyRef.current;

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
      selectedDifficulty: currentDifficulty,
    }));

    runOnJS(() => {
      saveGameData({
        gameStarted: false,
        gameOver: false,
        score: 0,
        selectedDifficulty: currentDifficulty,
      });
    })();
  }, []);

  const updateCurrentBlockPosition = useCallback((newX: number, newDirection?: 'left' | 'right') => {
    setGameState(prev => {
      if (!prev.currentBlock) return prev;

      const currentDifficulty = currentDifficultyRef.current;
      const positionThreshold = currentDifficulty === 'easy' ? 0.8 : currentDifficulty === 'hard' ? 0.3 : 0.5;
      const positionChanged = Math.abs(prev.currentBlock.x - newX) > positionThreshold;
      const directionChanged = newDirection && prev.currentBlock.direction !== newDirection;

      if (!positionChanged && !directionChanged) return prev;

      return {
        ...prev,
        currentBlock: {
          ...prev.currentBlock,
          x: newX,
          ...(newDirection && { direction: newDirection }),
        },
        selectedDifficulty: currentDifficulty
      };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setGameState(prev => {
      const currentDifficulty = currentDifficultyRef.current;
      
      let coinMultiplier = 1;
      switch (currentDifficulty) {
        case 'easy':
          coinMultiplier = 0.8;
          break;
        case 'medium':
          coinMultiplier = 1.0;
          break;
        case 'hard':
          coinMultiplier = 1.3;
          break;
      }

      const adjustedAmount = Math.floor(amount * coinMultiplier);
      
      return {
        ...prev,
        coins: prev.coins + adjustedAmount,
        selectedDifficulty: currentDifficulty
      };
    });
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

  const calculateChallengeCompletion = useCallback((
    challengeLevel: ChallengeLevel,
    gameState: GameState
  ) => {
    if (!gameState.gameOver || gameState.tower_height < challengeLevel.targetBlocks) {
      return { completed: false, stars: 0 };
    }

    const currentDifficulty = currentDifficultyRef.current;
    const averageSpeed = gameState.currentBlock?.speed || 0;
    const stars = calculateChallengeStars(
      challengeLevel,
      gameState.score,
      gameState.tower_height,
      gameState.perfectBlocks,
      true,
      averageSpeed,
      currentDifficulty
    );

    return { completed: true, stars };
  }, []);

  const updateHighScore = useCallback((newScore: number, mode: GameMode) => {
    setGameState(prev => {
      const currentDifficulty = currentDifficultyRef.current;
      const highScoreKey = `${mode}_${currentDifficulty}`;
      const currentHighScore = prev.highScore || 0;
      
      if (newScore > currentHighScore) {
        runOnJS(() => {
          saveGameData({
            [`highScore_${highScoreKey}`]: newScore,
            selectedDifficulty: currentDifficulty,
          });
        })();

        return {
          ...prev,
          highScore: newScore,
          selectedDifficulty: currentDifficulty
        };
      }
      
      return {
        ...prev,
        selectedDifficulty: currentDifficulty
      };
    });
  }, []);

  // ✅ NEW: Function to handle mid-game difficulty changes
  const applyDifficultyChange = useCallback(() => {
    setGameState(prev => {
      const currentDifficulty = currentDifficultyRef.current;
      
      if (!prev.gameStarted || !prev.currentBlock) {
        return {
          ...prev,
          selectedDifficulty: currentDifficulty
        };
      }

      // If game is in progress, update the current moving block with new difficulty
      const topBlock = prev.blocks[prev.blocks.length - 1];
      const updatedCurrentBlock = createNewBlock(
        topBlock,
        prev.tower_height,
        prev.mode,
        prev.level ? CHALLENGE_LEVELS.find(l => l.id === prev.level) : undefined,
        currentDifficulty,
        prev.combo
      );

      return {
        ...prev,
        currentBlock: updatedCurrentBlock,
        selectedDifficulty: currentDifficulty
      };
    });
  }, []);

  // ✅ Apply difficulty changes immediately when theme context changes
  useEffect(() => {
    applyDifficultyChange();
  }, [themeState.selectedDifficulty, applyDifficultyChange]);

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
    calculateChallengeCompletion,
    updateHighScore,
    applyDifficultyChange,
    currentDifficulty: currentDifficultyRef.current, // Always return current difficulty
  };
};