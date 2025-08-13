import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Infinity, Clock, Target, Lock } from 'lucide-react-native';
import { GameMode, GameModeConfig } from '../types/game';
import { GAME_MODES } from '../constants/game';

interface ModeSelectorProps {
  selectedMode: GameMode;
  visible: boolean;
  onModeSelect: (mode: GameMode) => void;
  onClose: () => void;
}

const ModeIcon = ({ mode, size = 32, color = '#fff' }: { mode: GameMode; size?: number; color?: string }) => {
  switch (mode) {
    case 'classic':
      return <Infinity size={size} color={color} />;
    case 'timeAttack':
      return <Clock size={size} color={color} />;
    case 'challenge':
      return <Target size={size} color={color} />;
    default:
      return <Infinity size={size} color={color} />;
  }
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  visible,
  onModeSelect,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.background}
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>Select Game Mode</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modesContainer} showsVerticalScrollIndicator={false}>
          {GAME_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                selectedMode === mode.id && styles.selectedModeCard,
                !mode.unlocked && styles.lockedModeCard,
              ]}
              onPress={() => mode.unlocked && onModeSelect(mode.id)}
              disabled={!mode.unlocked}
            >
              <LinearGradient
                colors={
                  selectedMode === mode.id
                    ? ['#667eea', '#764ba2']
                    : mode.unlocked
                    ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    : ['rgba(100, 100, 100, 0.3)', 'rgba(80, 80, 80, 0.3)']
                }
                style={styles.modeCardGradient}
              >
                <View style={styles.modeCardContent}>
                  <View style={styles.modeIconContainer}>
                    {mode.unlocked ? (
                      <ModeIcon mode={mode.id} size={40} color="#fff" />
                    ) : (
                      <Lock size={40} color="#666" />
                    )}
                  </View>
                  
                  <View style={styles.modeInfo}>
                    <Text style={[styles.modeName, !mode.unlocked && styles.lockedText]}>
                      {mode.name}
                    </Text>
                    <Text style={[styles.modeDescription, !mode.unlocked && styles.lockedText]}>
                      {mode.unlocked ? mode.description : 'Locked'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* <TouchableOpacity style={styles.startButton} onPress={onClose}>
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </LinearGradient>
        </TouchableOpacity> */}
      </View>
    </View>
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
    width: '90%',
    maxWidth: 400,
    height: '60%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  modesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modeCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedModeCard: {
    transform: [{ scale: 1.02 }],
  },
  lockedModeCard: {
    opacity: 0.6,
  },
  modeCardGradient: {
    padding: 20,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIconContainer: {
    marginRight: 15,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  modeDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  lockedText: {
    color: '#666',
  },
  startButton: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});