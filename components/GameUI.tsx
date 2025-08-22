import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import React from 'react';
import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pause } from 'lucide-react-native';

interface GameUIProps {
  score: number;
  combo: number;
  gameStarted: boolean;
  onPause: () => void;
}

const GameUIComponent: React.FC<GameUIProps> = ({
  score,
  combo,
  gameStarted,
  onPause,
}) => {
  
  const scoreScale = useSharedValue(1);
  const comboOpacity = useSharedValue(combo > 0 ? 1 : 0);
  const comboTranslateY = useSharedValue(combo > 0 ? 0 : -10);

  React.useEffect(() => {
    scoreScale.value = withSpring(1.05, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scoreScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
  }, [score]);

  React.useEffect(() => {
    comboOpacity.value = withTiming(combo > 0 ? 1 : 0, { duration: 200 });
    comboTranslateY.value = combo > 0 
      ? withSpring(0, { damping: 8, stiffness: 100 }) 
      : withTiming(-10, { duration: 200 });
  }, [combo]);

  const scoreAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scoreScale.value },
      ],
    };
  }, []);

  const comboAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: comboOpacity.value,
      transform: [
        { translateY: comboTranslateY.value },
      ],
    };
  }, []);

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
        
        <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
          <Pause size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Memoize GameUI to prevent unnecessary re-renders
export const GameUI = memo(GameUIComponent, (prevProps, nextProps) => {
  return (
    prevProps.score === nextProps.score &&
    prevProps.combo === nextProps.combo &&
    prevProps.gameStarted === nextProps.gameStarted
  );
});

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
    top: 35,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});