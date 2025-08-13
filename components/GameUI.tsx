import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Coins } from 'lucide-react-native';
import { GAME_CONFIG } from '../constants/game';

interface GameUIProps {
  score: number;
  combo: number;
  gameStarted: boolean;
  onStart: () => void;
  coins?: number;
  onThemePress?: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  combo,
  gameStarted,
  onStart,
  coins = 0,
  onThemePress,
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

  if (!gameStarted) {
    return (
      <View style={styles.startScreen}>
        <Text style={styles.titleText}>Stack Tower</Text>
        <Text style={styles.instructionText}>Tap to drop blocks{'\n'}Stack them perfectly for bonus points!</Text>
        
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
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
    <View style={styles.gameUI}>
      <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </Animated.View>
      
      <Animated.View style={[styles.comboContainer, comboAnimatedStyle]}>
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
  gameUI: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
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
});