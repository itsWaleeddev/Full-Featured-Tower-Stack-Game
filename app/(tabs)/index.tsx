import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
import { generateDailyChallenge, calculateChallengeStars } from '../../utils/gameLogic';
import { saveGameData, loadGameData, saveScore } from '../../utils/storage';

// Game flow states
type GameFlow = 'mode_select' | 'playing' | 'paused' | 'game_over';

export default function StackTowerGame() {
  const params = useLocalSearchParams();
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
    updateThemeState,
    completeChallengeLevel,
    getCurrentUnlockedLevel
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
  const [challengeStarsEarned, setChallengeStarsEarned] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Handle navigation from challenges screen
  useEffect(() => {
  if (params.mode === 'challenge' && params.levelId && params.autoStart === 'true') {
    const levelId = parseInt(params.levelId as string);
    const challengeLevel = CHALLENGE_LEVELS.find(l => l.id === levelId);
    
    if (challengeLevel) {
      setSelectedMode('challenge');
      setSelectedLevel(challengeLevel);
      startGame('challenge', challengeLevel);
    }
  }
  // only run when these specific values change
}, [params.mode, params.levelId, params.autoStart]);


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
  useEffect(() => {
    const blockHeight = 40;
    const screenHeight = GAME_CONFIG.SCREEN_HEIGHT || 800;
    const halfScreenHeight = screenHeight / 2;
    const currentTowerHeightPixels = gameState.tower_height * blockHeight;

    let targetY = 0;
    let targetScale = 1;

    if (currentTowerHeightPixels > halfScreenHeight) {
      const excessHeight = currentTowerHeightPixels - halfScreenHeight;
      const slowMovementFactor = 0.5;
      targetY = excessHeight * slowMovementFactor;
      targetScale = Math.max(0.9, 1 - (excessHeight / screenHeight) * 0.1);
    }

    cameraY.value = withTiming(targetY, { duration: 1000 });
    cameraScale.value = withTiming(targetScale, { duration: 1000 });
  }, [gameState.tower_height]);

  // Update high score and handle challenge completion
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

      let totalCoinsEarned = 0;
      let starsEarned = 0;

      // Handle challenge mode completion
      if (gameState.mode === 'challenge' && selectedLevel) {
        const blocksStacked = gameState.tower_height - 1;
        const perfectBlocks = gameState.combo; // This should be tracked properly
        const completed = blocksStacked >= selectedLevel.targetBlocks;
        
        if (completed) {
          starsEarned = calculateChallengeStars(
            selectedLevel,
            gameState.score,
            blocksStacked,
            perfectBlocks,
            completed
          );

          const previousStars = themeState.challengeProgress[selectedLevel.id]?.stars || 0;
          const isNewStars = starsEarned > previousStars;
          
          const challengeCoins = completeChallengeLevel(
            selectedLevel.id,
            starsEarned,
            gameState.score,
            isNewStars
          );
          
          totalCoinsEarned += challengeCoins;
          setChallengeStarsEarned(starsEarned);
        }
      } else {
        // Award coins for other modes
        const coinsEarned = Math.floor(gameState.score / 1000) + Math.floor(gameState.combo / 2);
        if (coinsEarned > 0) {
          addCoins(coinsEarned);
          totalCoinsEarned += coinsEarned;
        }
      }

      // Check daily challenge completion
      if (dailyChallenge && !gameState.dailyChallengeCompleted) {
        const challengeMet = checkDailyChallengeCompletion();
        if (challengeMet) {
          addCoins(dailyChallenge.reward);
          totalCoinsEarned += dailyChallenge.reward;
        }
      }

      setCoinsEarnedThisGame(totalCoinsEarned);
      setGameState(prev => ({ ...prev, rewardsGranted: true }));
    }
  }, [gameState.gameOver, gameState.score, updateHighScore, addCoins, completeChallengeLevel]);

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
      const currentUnlockedLevel = getCurrentUnlockedLevel();
      const firstAvailableLevel = CHALLENGE_LEVELS.find(l => l.id === currentUnlockedLevel) || CHALLENGE_LEVELS[0];
      setSelectedLevel(firstAvailableLevel);
      startGame(mode, firstAvailableLevel);
    } else {
      setSelectedLevel(undefined);
      startGame(mode);
    }
  };

  const handlePlayAgain = () => {
    // Reset camera
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });

    // Reset coins and stars earned counters
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);

    // Start same game mode
    if (selectedMode === 'challenge' && selectedLevel) {
      startGame(selectedMode, selectedLevel);
    } else {
      startGame(selectedMode);
    }
  };

  const handlePlayNextLevel = () => {
    if (selectedMode === 'challenge' && selectedLevel) {
      const nextLevel = CHALLENGE_LEVELS.find(l => l.id === selectedLevel.id + 1);
      if (nextLevel) {
        setSelectedLevel(nextLevel);
        
        // Reset camera
        cameraY.value = withTiming(0, { duration: 500 });
        cameraScale.value = withTiming(1, { duration: 500 });

        // Reset counters
        setCoinsEarnedThisGame(0);
        setChallengeStarsEarned(0);

        startGame(selectedMode, nextLevel);
      }
    }
  };

  const handleBackToModeSelect = () => {
    // Reset everything
    resetGame();
    cameraY.value = withTiming(0, { duration: 500 });
    cameraScale.value = withTiming(1, { duration: 500 });
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);
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
    setChallengeStarsEarned(0);

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
    setChallengeStarsEarned(0);
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
      gameStarted: true,
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

  // Determine if challenge level was completed
  const isChallengeCompleted = () => {
    if (gameState.mode === 'challenge' && selectedLevel) {
      return (gameState.tower_height - 1) >= selectedLevel.targetBlocks;
    }
    return false;
  };

  // Check if next level exists
  const hasNextLevel = () => {
    if (selectedMode === 'challenge' && selectedLevel) {
      return CHALLENGE_LEVELS.some(l => l.id === selectedLevel.id + 1);
    }
    return false;
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={styles.container}>
        <Background towerHeight={gameState.tower_height} themeId={themeState.currentTheme} />

        <Animated.View style={[styles.gameArea, cameraStyle]}>
          {/* Static blocks */}
          {gameState.currentBlock && gameState.blocks.map((block) => (
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
            onClose={() => { }}
            coins={themeState.coins}
            onThemePress={() => setShowThemeSelector(true)}
            showAsMainMenu={true}
            setSelectedMode={setSelectedMode}
            currentTheme={themeState.currentTheme}
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
            challengeStars={challengeStarsEarned}
            challengeCompleted={isChallengeCompleted()}
            hasNextLevel={hasNextLevel()}
            onPlayAgain={handlePlayAgain}
            onPlayNextLevel={handlePlayNextLevel}
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