import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pause } from 'lucide-react-native';

interface GameUIProps {
  score: number;
  combo: number;
  gameStarted: boolean;
  onPause: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  combo,
  gameStarted,
  onPause,
}) => {
  
  const scoreAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(1.1, { damping: 10, stiffness: 300 }),
        },
      ],
    };
  });

  const comboAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: combo > 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
      transform: [
        {
          translateY: combo > 0 ? withSpring(0, { damping: 8, stiffness: 100 }) : withTiming(-10, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <View style={styles.gameUI}>
      {/* Top UI */}
      <View style={styles.topUI}>
        <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </Animated.View>
        
        <Animated.View style={[styles.comboContainer, comboAnimatedStyle]}>
          <Text style={styles.comboText}>COMBO x{combo}</Text>
        </Animated.View>
      </View>

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
  gameUI: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  topUI: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  comboContainer: {
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