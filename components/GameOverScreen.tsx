import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Home, Share, Trophy, Coins } from 'lucide-react-native';
import { GameMode } from '../types/game';

interface GameOverScreenProps {
  visible: boolean;
  score: number;
  highScore: number;
  mode: GameMode;
  coinsEarned?: number;
  onPlayAgain: () => void;
  onModeSelect: () => void;
  onShare: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  visible,
  score,
  highScore,
  mode,
  coinsEarned = 0,
  onPlayAgain,
  onModeSelect,
  onShare,
}) => {
  const isNewHighScore = score > 0 && score >= highScore;
  
  const getModeDisplayName = (mode: GameMode): string => {
    switch (mode) {
      case 'classic':
        return 'Classic Mode';
      case 'timeAttack':
        return 'Time Attack';
      case 'challenge':
        return 'Challenge Mode';
      default:
        return 'Game';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
            style={styles.background}
          />
          
          {/* Header */}
          <View style={styles.header}>
            {isNewHighScore ? (
              <>
                <Trophy size={40} color="#FFD700" />
                <Text style={styles.newRecordText}>New High Score!</Text>
              </>
            ) : (
              <Text style={styles.gameOverText}>Game Over</Text>
            )}
            <Text style={styles.modeText}>{getModeDisplayName(mode)}</Text>
          </View>

          {/* Score Section */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Final Score</Text>
              <Text style={[styles.scoreValue, isNewHighScore && styles.newRecordScore]}>
                {score.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.highScoreContainer}>
              <Text style={styles.highScoreLabel}>High Score</Text>
              <Text style={styles.highScoreValue}>{highScore.toLocaleString()}</Text>
            </View>
          </View>

          {/* Coins Earned */}
          {coinsEarned > 0 && (
            <View style={styles.coinsSection}>
              <View style={styles.coinsEarned}>
                <Coins size={20} color="#FFD700" />
                <Text style={styles.coinsText}>+{coinsEarned} coins earned!</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.buttonGradient}
              >
                <RotateCcw size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={onModeSelect}>
                <Home size={18} color="#fff" />
                <Text style={styles.secondaryButtonText}>Mode Select</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={onShare}>
                <Share size={18} color="#fff" />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  newRecordText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
    marginBottom: 5,
  },
  modeText: {
    fontSize: 16,
    color: '#ccc',
  },
  scoreSection: {
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  newRecordScore: {
    color: '#FFD700',
  },
  highScoreContainer: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  highScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
  },
  coinsSection: {
    marginBottom: 20,
  },
  coinsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionsContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});