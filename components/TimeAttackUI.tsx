import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Coins } from 'lucide-react-native';

interface TimeAttackUIProps {
  timeRemaining: number;
  totalTime: number;
  score: number;
  combo: number;
  gameStarted: boolean;
  onStart: () => void;
  coins?: number;
  onThemePress?: () => void; 
}

export const TimeAttackUI: React.FC<TimeAttackUIProps> = ({
  timeRemaining,
  totalTime,
  score,
  combo,
  gameStarted,
  onStart,
  coins = 0,
  onThemePress,          
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

  if (!gameStarted) {
    return (
      <View style={styles.startScreen}>
        <Text style={styles.titleText}>Time Attack Mode</Text>
        <Text style={styles.instructionText}>
          Stack as many blocks as you can{'\n'}before time runs out!
        </Text>
        
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Time Attack</Text>
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
