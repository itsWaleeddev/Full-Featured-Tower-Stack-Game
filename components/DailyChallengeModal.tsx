import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Coins, Target } from 'lucide-react-native';
import { DailyChallenge } from '../types/game';

interface DailyChallengeModalProps {
  visible: boolean;
  challenge: DailyChallenge | null;
  onAccept: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  visible,
  challenge,
  onAccept,
  onClose,
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

  if (!visible || !challenge) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
          style={styles.background}
        />
        
        <View style={styles.header}>
          <Calendar size={32} color="#fff" />
          <Text style={styles.title}>Daily Challenge</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.challengeName}>{challenge.description}</Text>
          <Text style={styles.objective}>{challenge.objective}</Text>
          
          <View style={styles.rewardContainer}>
            <Coins size={24} color="#FFD700" />
            <Text style={styles.rewardText}>+{challenge.reward} coins</Text>
          </View>

          <View style={styles.targetContainer}>
            <Target size={20} color="#4facfe" />
            <Text style={styles.targetText}>
              Target: {challenge.targetBlocks} blocks
              {challenge.perfectBlocksRequired && 
                ` (${challenge.perfectBlocksRequired} perfect)`
              }
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Later</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.acceptButtonGradient}
            >
              <Text style={styles.acceptButtonText}>Accept Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 20,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  objective: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  targetText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});