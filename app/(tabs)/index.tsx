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
import { DailyChallengeModal } from '../../components/DailyChallengeModal';
import { ThemeSelector } from '../../components/ThemeSelector';
import { useGameState } from '../../hooks/useGameState';
import { useHighScore } from '../../hooks/useHighScore';
import { useTheme } from '../../contexts/GameContext'; // Import the theme context
import { GAME_CONFIG, ANIMATION_CONFIG, CHALLENGE_LEVELS, THEMES } from '../../constants/game';
import { GameMode, ChallengeLevel, DailyChallenge } from '../../types/game';
import { generateDailyChallenge } from '../../utils/gameLogic';
import { saveGameData, loadGameData, saveScore } from '../../utils/storage';

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

  // Use global theme context instead of local state
  const {
    themeState,
    spendCoins,
    addCoins,
    unlockTheme,              
    setCurrentTheme,
    updateThemeState
  } = useTheme();

  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | null>(null);
  const cameraY = useSharedValue(0);
  const cameraScale = useSharedValue(1);

  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);

  // Load saved game data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadGameData();
      if (Object.keys(savedData).length > 0) {
        // Update game state
        setGameState(prev => ({ ...prev, ...savedData }));

        // Update theme context with saved data
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

  // Timer for time attack mode
  useEffect(() => {
    if (gameState.mode === 'timeAttack' && gameState.gameStarted && !gameState.gameOver) {
      timerRef.current = setInterval(updateTimer, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState.mode, gameState.gameStarted, gameState.gameOver, updateTimer]);

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

      if (gameState.gameStarted && !gameState.gameOver) {
        animationRef.current = requestAnimationFrame(animateBlock);
      }
    };

    animationRef.current = requestAnimationFrame(animateBlock);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.currentBlock, gameState.gameStarted, gameState.gameOver, updateCurrentBlockPosition]);

  // Camera animation based on tower height
  useEffect(() => {
    const targetY = -gameState.tower_height * ANIMATION_CONFIG.CAMERA_PAN_FACTOR;
    const targetScale = Math.max(0.7, 1 - gameState.tower_height * ANIMATION_CONFIG.CAMERA_SCALE_FACTOR);

    cameraY.value = withTiming(targetY, { duration: 800 });
    cameraScale.value = withTiming(targetScale, { duration: 800 });
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
      }

      // Check daily challenge completion
      if (dailyChallenge && !gameState.dailyChallengeCompleted) {
        const challengeMet = checkDailyChallengeCompletion();
        if (challengeMet) {
          addCoins(dailyChallenge.reward);
          // You'll need to add completeDailyChallenge to your game state or handle it separately
        }
      }
      // Mark rewards as granted so effect doesn't loop
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

  const handleScreenTap = () => {
    if (!gameState.gameStarted) {
      setShowModeSelector(true);
    } else if (gameState.currentBlock && gameState.currentBlock.isMoving && !gameState.gameOver) {
      dropBlock();
    }
  };

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'challenge') {
      const firstLevel = CHALLENGE_LEVELS[0];
      startGame(mode, firstLevel);
    } else {
      startGame(mode);
    }
    setShowModeSelector(false);
  };

  const handleRestart = () => {
    resetGame();
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });
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

  // Filter themes to only show unlocked ones for ThemeSelector
  const unlockedThemesList = THEMES.filter(theme =>
    themeState.unlockedThemes.includes(theme.id)
  ).map(theme => ({
    ...theme,
    unlocked: true, // All themes in this list are unlocked
  }));

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

        {/* UI based on game mode */}
        {gameState.mode === 'classic' && (
          <GameUI
            score={gameState.score}
            combo={gameState.combo}
            gameStarted={gameState.gameStarted}
            onStart={() => setShowModeSelector(true)}
            coins={themeState.coins}
            onThemePress={() => setShowThemeSelector(true)}
          />
        )}

        {gameState.mode === 'timeAttack' && (
          <TimeAttackUI
            timeRemaining={gameState.timeRemaining || 0}
            totalTime={GAME_CONFIG.TIME_ATTACK_DURATION}
            score={gameState.score}
            combo={gameState.combo}
            gameStarted={gameState.gameStarted}
            onStart={() => setShowModeSelector(true)}
            coins={themeState.coins}
            onThemePress={() => setShowThemeSelector(true)}
          />
        )}

        {gameState.mode === 'challenge' && getCurrentChallengeLevel() && (
          <ChallengeUI
            level={getCurrentChallengeLevel()!}
            currentBlocks={gameState.tower_height - 1}
            score={gameState.score}
            combo={gameState.combo}
            timeRemaining={gameState.timeRemaining}
            gameStarted={gameState.gameStarted}
            onStart={() => setShowModeSelector(true)}
            coins={themeState.coins}
            onThemePress={() => setShowThemeSelector(true)}
          />
        )}

        <GameOverScreen
          visible={gameState.gameOver}
          score={gameState.score}
          highScore={highScore}
          mode={gameState.mode}
          onRestart={handleRestart}
          onShare={() => {/* Implement sharing */ }}
        />

        <ModeSelector
          visible={showModeSelector}
          selectedMode={gameState.mode}
          onModeSelect={handleModeSelect}
          onClose={() => setShowModeSelector(false)}
        />

        <ThemeSelector
          visible={showThemeSelector}
          themes={unlockedThemesList} // Only pass unlocked themes
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