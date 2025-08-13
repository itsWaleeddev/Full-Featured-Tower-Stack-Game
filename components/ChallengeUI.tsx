import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { ChallengeLevel } from '../types/game';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Coins } from 'lucide-react-native';

interface ChallengeUIProps {
  level: ChallengeLevel;
  currentBlocks: number;
  score: number;
  combo: number;
  timeRemaining?: number;
  gameStarted: boolean;
  onStart: () => void;
  coins?: number;
  onThemePress?: () => void;
}

export const ChallengeUI: React.FC<ChallengeUIProps> = ({
  level,
  currentBlocks,
  score,
  combo,
  timeRemaining,
  gameStarted,
  onStart,
  coins = 0,
  onThemePress,
}) => {

  const progress = Math.min(currentBlocks / level.targetBlocks, 1);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress * 100}%`, { duration: 300 }),
    };
  });

  const comboStyle = useAnimatedStyle(() => {
    return {
      opacity: combo > 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
    };
  });

  if (!gameStarted) {
    return (
      <View style={styles.startScreen}>
        <Text style={styles.titleText}>Challenge Mode</Text>
        <Text style={styles.instructionText}>
          Complete the target blocks to win the challenge!
        </Text>

        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomControls}>
          <View style={styles.coinsDisplay}>
            <Coins size={20} color="#FFD700" />
            <Text style={styles.coinsText}>{coins}</Text>
          </View>

          {onThemePress && (
            <TouchableOpacity style={styles.themeButton} onPress={onThemePress}>
              <Palette size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.objective}>{level.objective}</Text>
        </View>

        {timeRemaining !== undefined && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{Math.ceil(timeRemaining)}s</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentBlocks} / {level.targetBlocks} blocks
          </Text>
          <Text style={styles.scoreText}>Score: {score.toLocaleString()}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>

      <Animated.View style={[styles.comboContainer, comboStyle]}>
        <Text style={styles.comboText}>COMBO x{combo}</Text>
      </Animated.View>

      <View style={styles.starsContainer}>
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={20}
            color={star <= level.stars ? '#FFD700' : '#666'}
            fill={star <= level.stars ? '#FFD700' : 'transparent'}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  startScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 100,
  },
  titleText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonGradient: {
    paddingHorizontal: 50,
    paddingVertical: 18,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  themeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 20,
  },
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  levelInfo: {
    flex: 1,
    marginRight: 10,
  },
  levelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  objective: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 18,
  },
  timerContainer: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreText: {
    color: '#ccc',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 3,
  },
  comboContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  comboText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
});