import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Star, Pause } from 'lucide-react-native';
import { ChallengeLevel } from '../types/game';

interface ChallengeUIProps {
  level: ChallengeLevel;
  currentBlocks: number;
  score: number;
  combo: number;
  timeRemaining?: number;
  gameStarted: boolean;
  onPause: () => void;
}

export const ChallengeUI: React.FC<ChallengeUIProps> = ({
  level,
  currentBlocks,
  score,
  combo,
  timeRemaining,
  gameStarted,
  onPause,
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

  return (
    <View style={styles.container}>
      {/* Challenge Info Panel */}
      <View style={styles.challengePanel}>
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

      {/* Combo Display */}
      <Animated.View style={[styles.comboContainer, comboStyle]}>
        <Text style={styles.comboText}>COMBO x{combo}</Text>
      </Animated.View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
          <Pause size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  challengePanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  comboContainer: {
    position: 'absolute',
    top: 220,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  comboText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 20,
  },
});