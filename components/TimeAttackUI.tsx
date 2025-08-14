import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Pause } from 'lucide-react-native';

interface TimeAttackUIProps {
  timeRemaining: number;
  totalTime: number;
  score: number;
  combo: number;
  gameStarted: boolean;
  onPause: () => void;
}

export const TimeAttackUI: React.FC<TimeAttackUIProps> = ({
  timeRemaining,
  totalTime,
  score,
  combo,
  gameStarted,
  onPause,
}) => {
  const progress = timeRemaining / totalTime;
  const isLowTime = timeRemaining <= 10;

  const timerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress,
      [0, 0.3, 1],
      ['#ff4757', '#ffa502', '#2ed573']
    );

    return {
      backgroundColor: withTiming(backgroundColor, { duration: 200 }),
      transform: [
        {
          scale: isLowTime
            ? withTiming(1.1, { duration: 100 })
            : withTiming(1, { duration: 100 }),
        },
      ],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress * 100}%`, { duration: 200 }),
    };
  });

  const comboStyle = useAnimatedStyle(() => {
    return {
      opacity: combo > 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
      transform: [
        {
          scale: combo > 0 ? withTiming(1.1, { duration: 200 }) : withTiming(1, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Top UI */}
      <View style={styles.topRow}>
        <Animated.View style={[styles.timerContainer, timerStyle]}>
          <Text style={styles.timerText}>
            {Math.ceil(timeRemaining)}s
          </Text>
        </Animated.View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>

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
  topRow: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    minWidth: 120,
  },
  scoreLabel: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  comboContainer: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  comboText: {
    color: '#000',
    fontSize: 16,
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