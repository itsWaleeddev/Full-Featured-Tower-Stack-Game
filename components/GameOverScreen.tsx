import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2 } from 'lucide-react-native';
import { GameMode } from '../types/game';
import { GAME_CONFIG } from '../constants/game';

interface GameOverScreenProps {
  visible: boolean;
  score: number;
  highScore: number;
  mode: GameMode;
  onRestart: () => void;
  onShare: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  visible,
  score,
  highScore,
  mode,
  onRestart,
  onShare,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 300 }),
      transform: [
        {
          scale: visible
            ? withSpring(1, { damping: 10, stiffness: 100 })
            : withTiming(0.8, { duration: 200 }),
        },
      ],
    };
  });

  if (!visible) return null;

  const isNewHighScore = score > highScore;
  
  const modeNames = {
    classic: 'Classic Mode',
    timeAttack: 'Time Attack',
    challenge: 'Challenge Mode',
  };

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.background}
        />
        
        <View style={styles.content}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.modeText}>{modeNames[mode]}</Text>
          
          {isNewHighScore && (
            <Text style={styles.newHighScoreText}>New High Score! 🎉</Text>
          )}
          
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.highScoreText}>Best: {Math.max(score, highScore)}</Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
              <Share2 size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: GAME_CONFIG.SCREEN_WIDTH * 0.8,
    padding: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeText: {
    fontSize: 16,
    color: '#4facfe',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  newHighScoreText: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 15,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '600',
  },
  highScoreText: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 30,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 25,
  },
  restartButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});