import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, RotateCcw, Home } from 'lucide-react-native';

interface PauseMenuProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  visible,
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <View style ={{flex:1}}>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
              style={styles.background}
            />

            <Text style={styles.title}>Game Paused</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={onResume}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.buttonGradient}
                >
                  <Play size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Resume</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={onRestart}>
                <RotateCcw size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Restart</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
                <Home size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Main Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 30,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 15,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
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
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});