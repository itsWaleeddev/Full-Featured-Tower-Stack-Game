import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Background } from '../../components/Background';
import { Block } from '../../components/Block';
import { GameUI } from '../../components/GameUI';
import { TimeAttackUI } from '../../components/TimeAttackUI';
import { ChallengeUI } from '../../components/ChallengeUI';
import { GameOverScreen } from '../../components/GameOverScreen';
import { ModeSelector } from '../../components/ModeSelector';
import { PauseMenu } from '../../components/PauseMenu';
import { DailyChallengeModal } from '../../components/DailyChallengeModal';
import { ThemeSelector } from '../../components/ThemeSelector';
import { useGameState } from '../../hooks/useGameState';
import { useHighScore } from '../../hooks/useHighScore';
import { useTheme } from '../../contexts/GameContext';
import { GAME_CONFIG, ANIMATION_CONFIG, CHALLENGE_LEVELS, THEMES } from '../../constants/game';
import { GameMode, ChallengeLevel, DailyChallenge } from '../../types/game';
import { generateDailyChallenge } from '../../utils/gameLogic';
import { saveGameData, loadGameData, saveScore } from '../../utils/storage';

// Game flow states
type GameFlow = 'mode_select' | 'playing' | 'paused' | 'game_over';

export default function StackTowerGame() {
  const {
    gameState,
    startGame,
    dropBlock,
    resetGame,
    updateCurrentBlockPosition,
    updateTimer,
    setGameState,
  } = useGameState();

  const { highScore, updateHighScore } = useHighScore();
  const {
    themeState,
    spendCoins,
    addCoins,
    unlockTheme,
    setCurrentTheme,
    updateThemeState
  } = useTheme();

  // Refs and animated values
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | null>(null);
  const cameraY = useSharedValue(0);
  const cameraScale = useSharedValue(1);

  // UI State
  const [gameFlow, setGameFlow] = useState<GameFlow>('mode_select');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | undefined>(undefined);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [coinsEarnedThisGame, setCoinsEarnedThisGame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Load saved game data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadGameData();
      if (Object.keys(savedData).length > 0) {
        setGameState(prev => ({ ...prev, ...savedData }));
        updateThemeState({
          coins: savedData.coins || 0,
          currentTheme: savedData.currentTheme || 'default',
          unlockedThemes: savedData.unlockedThemes || ['default'],
        });
      }

      // Check for daily challenge
      const today = new Date().toDateString();
      if (savedData.lastDailyChallengeDate !== today) {
        const challenge = generateDailyChallenge();
        setDailyChallenge(challenge);
        setShowDailyChallenge(true);
      }
    };

    loadSavedData();
  }, []);

  // Save game data when relevant state changes
  useEffect(() => {
    saveGameData({
      coins: themeState.coins,
      currentTheme: themeState.currentTheme,
      unlockedThemes: themeState.unlockedThemes,
      unlockedSkins: gameState.unlockedSkins,
      dailyChallengeCompleted: gameState.dailyChallengeCompleted,
      lastDailyChallengeDate: gameState.lastDailyChallengeDate,
    });
  }, [
    themeState.coins,
    themeState.currentTheme,
    themeState.unlockedThemes,
    gameState.dailyChallengeCompleted,
    gameState.lastDailyChallengeDate,
  ]);

  // Handle game state changes and flow transitions
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !isPaused) {
      setGameFlow('playing');
    } else if (gameState.gameStarted && !gameState.gameOver && isPaused) {
      setGameFlow('paused');
    } else if (gameState.gameOver) {
      setGameFlow('game_over');
      setIsPaused(false); // Reset pause state when game ends
    } else {
      setGameFlow('mode_select');
      setIsPaused(false); // Reset pause state when returning to menu
    }
  }, [gameState.gameStarted, gameState.gameOver, isPaused]);

  // Timer for time attack mode
  useEffect(() => {
    if (gameState.mode === 'timeAttack' && gameState.gameStarted && !gameState.gameOver && !isPaused) {
      timerRef.current = setInterval(updateTimer, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState.mode, gameState.gameStarted, gameState.gameOver, isPaused, updateTimer]);

  // Animate moving block
  useEffect(() => {
    if (!gameState.currentBlock || !gameState.currentBlock.isMoving) return;

    const animateBlock = () => {
      const block = gameState.currentBlock!;
      let newX = block.x;
      let newDirection = block.direction;

      if (block.direction === 'right') {
        newX += block.speed;
        if (newX + block.width >= GAME_CONFIG.SCREEN_WIDTH) {
          newDirection = 'left';
          newX = GAME_CONFIG.SCREEN_WIDTH - block.width;
        }
      } else {
        newX -= block.speed;
        if (newX <= 0) {
          newDirection = 'right';
          newX = 0;
        }
      }

      updateCurrentBlockPosition(newX, newDirection);

      if (gameState.gameStarted && !gameState.gameOver && !isPaused) {
        animationRef.current = requestAnimationFrame(animateBlock);
      }
    };

    animationRef.current = requestAnimationFrame(animateBlock);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.currentBlock, gameState.gameStarted, gameState.gameOver, isPaused, updateCurrentBlockPosition]);

  // Camera animation based on tower height
  // useEffect(() => {
  //   const blockHeight = 40; // Adjust this to match your actual block height
  //   const screenHeight = GAME_CONFIG.SCREEN_HEIGHT || 800;
  //   const halfScreenHeight = screenHeight / 2;

  //   // Calculate current tower height in pixels
  //   const currentTowerHeightPixels = gameState.tower_height * blockHeight;

  //   let targetY = 0;
  //   let targetScale = 1;

  //   // When tower reaches half screen height, start moving it down
  //   if (currentTowerHeightPixels > halfScreenHeight) {
  //     // Move the entire stack down so top blocks remain visible
  //     const excessHeight = currentTowerHeightPixels - halfScreenHeight;
  //     // Instead of moving camera up, move the game area down
  //     targetY = excessHeight;

  //     // Optional: Scale down slightly
  //     targetScale = Math.max(0.8, 1 - (excessHeight / screenHeight) * 0.2);
  //   }

  //   cameraY.value = withTiming(targetY, { duration: 800 });
  //   cameraScale.value = withTiming(targetScale, { duration: 800 });
  // }, [gameState.tower_height]);

  //more slower version
  useEffect(() => {
    const blockHeight = 40; // Adjust this to match your actual block height
    const screenHeight = GAME_CONFIG.SCREEN_HEIGHT || 800;
    const halfScreenHeight = screenHeight / 2;

    // Calculate current tower height in pixels
    const currentTowerHeightPixels = gameState.tower_height * blockHeight;

    let targetY = 0;
    let targetScale = 1;

    // When tower reaches half screen height, start moving it down slowly
    if (currentTowerHeightPixels > halfScreenHeight) {
      // Move the entire stack down slowly - only move a fraction of the excess height
      const excessHeight = currentTowerHeightPixels - halfScreenHeight;

      // Slow movement: only move down by 30% of the excess height
      // This creates a gradual downward drift as the tower grows
      const slowMovementFactor = 0.5; // Adjust this value to control speed (0.1 = very slow, 0.5 = moderate)
      targetY = excessHeight * slowMovementFactor;

      // Optional: Very subtle scale adjustment
      targetScale = Math.max(0.9, 1 - (excessHeight / screenHeight) * 0.1);
    }

    // Slower, smoother animation duration for gradual movement
    cameraY.value = withTiming(targetY, {
      duration: 1000 // Increased from 800 for smoother, slower movement 1200
    });
    cameraScale.value = withTiming(targetScale, {
      duration: 1000
    });
  }, [gameState.tower_height]);

  // Update high score and save score when game ends
  useEffect(() => {
    if (gameState.gameOver && gameState.score > 0 && !gameState.rewardsGranted) {
      updateHighScore(gameState.score);

      // Save score record
      saveScore({
        mode: gameState.mode,
        score: gameState.score,
        date: new Date().toISOString(),
        level: gameState.level,
        blocks: gameState.tower_height - 1,
      });

      // Award coins based on performance
      const coinsEarned = Math.floor(gameState.score / 1000) + gameState.combo;
      if (coinsEarned > 0) {
        addCoins(coinsEarned);
        setCoinsEarnedThisGame(coinsEarned);
      }

      // Check daily challenge completion
      if (dailyChallenge && !gameState.dailyChallengeCompleted) {
        const challengeMet = checkDailyChallengeCompletion();
        if (challengeMet) {
          addCoins(dailyChallenge.reward);
          setCoinsEarnedThisGame(prev => prev + dailyChallenge.reward);
        }
      }

      // Mark rewards as granted
      setGameState(prev => ({ ...prev, rewardsGranted: true }));
    }
  }, [gameState.gameOver, gameState.score, updateHighScore, addCoins]);

  const checkDailyChallengeCompletion = (): boolean => {
    if (!dailyChallenge) return false;
    const blocksStacked = gameState.tower_height - 1;

    if (blocksStacked >= dailyChallenge.targetBlocks) {
      if (dailyChallenge.perfectBlocksRequired) {
        return gameState.combo >= dailyChallenge.perfectBlocksRequired;
      }
      return true;
    }
    return false;
  };

  const cameraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cameraY.value },
        { scale: cameraScale.value },
      ],
    };
  });

  // Game flow handlers
  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);

    if (mode === 'challenge') {
      const firstLevel = CHALLENGE_LEVELS[0];
      setSelectedLevel(firstLevel);
      startGame(mode, firstLevel);
    } else {
      setSelectedLevel(undefined);
      startGame(mode);
    }
  };

  const handlePlayAgain = () => {
    // Reset camera
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });

    // Reset coins earned counter
    setCoinsEarnedThisGame(0);

    // Start same game mode
    if (selectedMode === 'challenge' && selectedLevel) {
      startGame(selectedMode, selectedLevel);
    } else {
      startGame(selectedMode);
    }
  };

  const handleBackToModeSelect = () => {
    // Reset everything
    resetGame();
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });
    setCoinsEarnedThisGame(0);
    setGameFlow('mode_select');
  };

  const handleScreenTap = () => {
    if (gameFlow === 'playing' && gameState.currentBlock && gameState.currentBlock.isMoving && !isPaused) {
      dropBlock();
    }
  };

  // Pause/Resume handlers
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handlePauseRestart = () => {
    // Reset camera
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });

    // Reset coins earned counter
    setCoinsEarnedThisGame(0);

    // Reset pause state
    setIsPaused(false);

    // Start same game mode
    if (selectedMode === 'challenge' && selectedLevel) {
      startGame(selectedMode, selectedLevel);
    } else {
      startGame(selectedMode);
    }
  };

  const handlePauseHome = () => {
    // Reset everything
    resetGame();
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });
    setCoinsEarnedThisGame(0);
    setIsPaused(false);
    setGameFlow('mode_select');
  };

  const handleThemePurchase = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme && themeState.coins >= theme.cost) {
      spendCoins(theme.cost);
      unlockTheme(themeId);
      setCurrentTheme(themeId);
    }
  };

  const handleDailyChallengeAccept = () => {
    if (dailyChallenge) {
      setSelectedMode('classic');
      startGame('classic');
      setShowDailyChallenge(false);
    }
  };

  const getCurrentChallengeLevel = (): ChallengeLevel | undefined => {
    if (gameState.mode === 'challenge' && gameState.level) {
      return CHALLENGE_LEVELS.find(l => l.id === gameState.level);
    }
    return undefined;
  };

  const unlockedThemesList = THEMES.filter(theme =>
    themeState.unlockedThemes.includes(theme.id)
  ).map(theme => ({
    ...theme,
    unlocked: true,
  }));

  const renderGameUI = () => {
    const commonProps = {
      gameStarted: true, // Always true during playing state
      onPause: handlePause,
    };

    switch (gameState.mode) {
      case 'timeAttack':
        return (
          <TimeAttackUI
            timeRemaining={gameState.timeRemaining || 0}
            totalTime={GAME_CONFIG.TIME_ATTACK_DURATION}
            score={gameState.score}
            combo={gameState.combo}
            {...commonProps}
          />
        );
      case 'challenge':
        const challengeLevel = getCurrentChallengeLevel();
        if (challengeLevel) {
          return (
            <ChallengeUI
              level={challengeLevel}
              currentBlocks={gameState.tower_height - 1}
              score={gameState.score}
              combo={gameState.combo}
              timeRemaining={gameState.timeRemaining}
              {...commonProps}
            />
          );
        }
        break;
      default:
        return (
          <GameUI
            score={gameState.score}
            combo={gameState.combo}
            {...commonProps}
          />
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={styles.container}>
        <Background towerHeight={gameState.tower_height} themeId={themeState.currentTheme} />

        <Animated.View style={[styles.gameArea, cameraStyle]}>
          {/* Static blocks */}
          {gameState.blocks.map((block) => (
            <Block key={block.id} block={block} themeId={themeState.currentTheme} />
          ))}

          {/* Moving block */}
          {gameState.currentBlock && (
            <Block block={gameState.currentBlock} themeId={themeState.currentTheme} />
          )}
        </Animated.View>

        {/* Render UI based on game flow */}
        {gameFlow === 'mode_select' && (
          <ModeSelector
            visible={true}
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
            onClose={() => { }} // No close needed since this is the main state
            coins={themeState.coins}
            onThemePress={() => setShowThemeSelector(true)}
            showAsMainMenu={true}
            setSelectedMode={setSelectedMode}
          />
        )}

        {gameFlow === 'playing' && renderGameUI()}

        {gameFlow === 'paused' && (
          <PauseMenu
            visible={true}
            onResume={handleResume}
            onRestart={handlePauseRestart}
            onHome={handlePauseHome}
          />
        )}

        {gameFlow === 'game_over' && (
          <GameOverScreen
            visible={true}
            score={gameState.score}
            highScore={highScore}
            mode={gameState.mode}
            coinsEarned={coinsEarnedThisGame}
            onPlayAgain={handlePlayAgain}
            onModeSelect={handleBackToModeSelect}
            onShare={() => {/* Implement sharing */ }}
          />
        )}

        <ThemeSelector
          visible={showThemeSelector}
          themes={unlockedThemesList}
          currentTheme={themeState.currentTheme}
          coins={themeState.coins}
          onThemeSelect={setCurrentTheme}
          onThemePurchase={handleThemePurchase}
          onClose={() => setShowThemeSelector(false)}
        />

        <DailyChallengeModal
          visible={showDailyChallenge}
          challenge={dailyChallenge}
          onAccept={handleDailyChallengeAccept}
          onClose={() => setShowDailyChallenge(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
});