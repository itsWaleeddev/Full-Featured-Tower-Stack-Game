import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface TimeAttackUIProps {
  timeRemaining: number;
  totalTime: number;
  score: number;
  combo: number;
}

export const TimeAttackUI: React.FC<TimeAttackUIProps> = ({
  timeRemaining,
  totalTime,
  score,
  combo,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  topRow: {
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
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  comboContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  comboText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});