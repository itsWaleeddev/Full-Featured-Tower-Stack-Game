import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
  interpolate,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Infinity, Clock, Target, Lock, Palette, Coins, Settings, Zap, Trophy, Star } from 'lucide-react-native';
import { GameMode, GameModeConfig } from '../types/game';
import { GAME_MODES, THEMES } from '../constants/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModeSelectorProps {
  selectedMode: GameMode;
  visible: boolean;
  onModeSelect: (mode: GameMode) => void;
  onClose: () => void;
  coins?: number;
  onThemePress?: () => void;
  showAsMainMenu?: boolean;
  setSelectedMode?: (mode: GameMode) => void;
  currentTheme?: string;
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

// Animated Block Component for Home Screen
const AnimatedBlock = ({ 
  width, 
  height = 32, 
  x, 
  y, 
  colors, 
  delay = 0, 
  themeId = 'default' 
}: {
  width: number;
  height?: number;
  x: number;
  y: number;
  colors: readonly [string, string];
  delay?: number;
  themeId?: string;
}) => {
  const scaleValue = useSharedValue(0);
  const glowValue = useSharedValue(0);

  useEffect(() => {
    scaleValue.value = withDelay(
      delay,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    glowValue.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = scaleValue.value;
    const glow = glowValue.value;
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      shadowOpacity: themeId === 'neon' || themeId === 'galaxy' ? glow * 0.8 : 0.3,
    };
  });

  const getBorderColor = () => {
    switch (themeId) {
      case 'neon': return 'rgba(0, 255, 255, 0.6)';
      case 'volcanic': return 'rgba(255, 69, 0, 0.6)';
      case 'arctic': return 'rgba(135, 206, 235, 0.6)';
      case 'galaxy': return 'rgba(147, 112, 219, 0.6)';
      case 'diamond': return 'rgba(192, 192, 192, 0.8)';
      case 'golden': return 'rgba(255, 215, 0, 0.8)';
      default: return 'rgba(255, 255, 255, 0.4)';
    }
  };

  return (
    <Animated.View
      style={[
        styles.animatedBlock,
        {
          width,
          height,
          shadowColor: themeId === 'neon' ? '#00ffff' : 
                      themeId === 'volcanic' ? '#ff4500' : 
                      themeId === 'golden' ? '#ffd700' : '#000',
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[colors[0], colors[1]]}
        style={[
          styles.blockGradient,
          {
            borderColor: getBorderColor(),
            borderWidth: themeId === 'diamond' || themeId === 'golden' ? 2.5 : 2,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {(themeId === 'diamond' || themeId === 'golden') && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(255, 255, 255, 0.3)']}
          style={styles.blockShine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </Animated.View>
  );
};

// Floating Particles Component
const FloatingParticles = ({ themeId = 'default' }: { themeId?: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <View style={styles.particlesContainer}>
      {particles.map((particle) => {
        const ParticleComponent = () => {
          const translateY = useSharedValue(0);
          const opacity = useSharedValue(0);
          
          useEffect(() => {
            const startAnimation = () => {
              translateY.value = 0;
              opacity.value = 0;
              
              translateY.value = withDelay(
                Math.random() * 3000,
                withTiming(-SCREEN_HEIGHT, { duration: 8000 + Math.random() * 4000 })
              );
              
              opacity.value = withDelay(
                Math.random() * 3000,
                withSequence(
                  withTiming(0.8, { duration: 1000 }),
                  withTiming(0.8, { duration: 6000 }),
                  withTiming(0, { duration: 1000 })
                )
              );
              
              setTimeout(startAnimation, 8000 + Math.random() * 4000);
            };
            
            startAnimation();
          }, []);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
          }));

          const getParticleColor = () => {
            switch (themeId) {
              case 'neon': return '#00ffff';
              case 'volcanic': return '#ff4500';
              case 'galaxy': return '#9370db';
              case 'golden': return '#ffd700';
              case 'diamond': return '#e0e0e0';
              default: return '#ffffff';
            }
          };

          return (
            <Animated.View
              style={[
                styles.particle,
                {
                  left: Math.random() * SCREEN_WIDTH,
                  backgroundColor: getParticleColor(),
                },
                animatedStyle,
              ]}
            />
          );
        };
        
        return <ParticleComponent key={particle} />;
      })}
    </View>
  );
};

const getThemeStyles = (themeId: string = 'default') => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const [primaryColor, secondaryColor] = theme.backgroundColors;
  
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    cardOverlay: themeId === 'diamond' || themeId === 'arctic' 
      ? 'rgba(0, 0, 0, 0.15)' 
      : 'rgba(255, 255, 255, 0.15)',
    textPrimary: themeId === 'diamond' || themeId === 'arctic' ? '#333' : '#fff',
    textSecondary: themeId === 'diamond' || themeId === 'arctic' ? '#666' : '#ccc',
    accent: theme.blockColors[0][0],
    glowColor: themeId === 'neon' ? '#00ffff' : 
               themeId === 'volcanic' ? '#ff4500' : 
               themeId === 'galaxy' ? '#9370db' : 
               themeId === 'golden' ? '#ffd700' : theme.blockColors[0][0],
  };
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  visible,
  onModeSelect,
  onClose,
  coins = 0,
  onThemePress,
  showAsMainMenu = false,
  setSelectedMode,
  currentTheme = 'default',
}) => {
  const [titleScale] = useState(useSharedValue(0));
  const [stackOffset] = useState(useSharedValue(50));

  if (!visible) return null;

  useEffect(() => {
    if (showAsMainMenu) {
      titleScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
      stackOffset.value = withDelay(600, withSpring(0, { damping: 10, stiffness: 80 }));
    }
  }, [showAsMainMenu]);

  const containerStyle = showAsMainMenu ? styles.mainMenuContainer : styles.modalContainer;
  const overlayStyle = showAsMainMenu ? styles.mainMenuOverlay : styles.modalOverlay;
  const themeStyles = getThemeStyles(currentTheme);

  // Get theme-appropriate block colors for the tower display
  const currentThemeData = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const blockColors = currentThemeData.blockColors;

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const stackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stackOffset.value }],
  }));

  return (
    <View style={overlayStyle}>
      {/* Floating Particles */}
      {showAsMainMenu && <FloatingParticles themeId={currentTheme} />}
      
      <View style={containerStyle}>
        {/* Top Bar - Coins and Settings */}
        {showAsMainMenu && (
          <View style={styles.topBar}>
            <View style={styles.coinsContainer}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']}
                style={[
                  styles.coinsDisplay,
                  currentTheme === 'neon' && styles.neonGlow,
                ]}
              >
                <Coins size={22} color="#FFD700" />
                <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
                {currentTheme === 'neon' && (
                  <View style={[styles.glowEffect, { shadowColor: '#FFD700' }]} />
                )}
              </LinearGradient>
            </View>
            
            <View style={styles.topRightButtons}>
              <TouchableOpacity onPress={onThemePress} style={styles.settingsButton}>
                <LinearGradient
                  colors={[themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.05)']}
                  style={styles.settingsGradient}
                >
                  <Palette size={22} color={themeStyles.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsButton}>
                <LinearGradient
                  colors={[themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.05)']}
                  style={styles.settingsGradient}
                >
                  <Trophy size={22} color={themeStyles.accent} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Title with Animated Tower */}
        {showAsMainMenu && (
          <Animated.View style={[styles.titleSection, titleAnimatedStyle]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.gameTitle, { color: themeStyles.textPrimary }]}>
                STACK
              </Text>
              <Text style={[styles.gameTitleSecond, { color: themeStyles.accent }]}>
                TOWER
              </Text>
              
              {/* Animated Block Stack Display */}
              <Animated.View style={[styles.blockStackContainer, stackAnimatedStyle]}>
                <AnimatedBlock
                  width={80}
                  height={24}
                  x={0}
                  y={0}
                  colors={blockColors[0]}
                  delay={800}
                  themeId={currentTheme}
                />
                <AnimatedBlock
                  width={70}
                  height={24}
                  x={5}
                  y={-26}
                  colors={blockColors[1]}
                  delay={1000}
                  themeId={currentTheme}
                />
                <AnimatedBlock
                  width={85}
                  height={24}
                  x={-2.5}
                  y={-52}
                  colors={blockColors[2]}
                  delay={1200}
                  themeId={currentTheme}
                />
                <AnimatedBlock
                  width={60}
                  height={24}
                  x={10}
                  y={-78}
                  colors={blockColors[3]}
                  delay={1400}
                  themeId={currentTheme}
                />
              </Animated.View>
            </View>
            
            <Text style={[styles.gameSubtitle, { color: themeStyles.textSecondary }]}>
              Stack blocks to build the ultimate tower
            </Text>
          </Animated.View>
        )}

        {/* Modal Header */}
        {!showAsMainMenu && (
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Game Mode</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Modes */}
        <ScrollView 
          style={styles.modesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modesContent}
        >
          {GAME_MODES.map((mode, index) => {
            const isSelected = selectedMode === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeCard,
                  isSelected && styles.selectedModeCard,
                  !mode.unlocked && styles.lockedModeCard,
                ]}
                onPress={() => mode.unlocked && (showAsMainMenu ? setSelectedMode?.(mode.id) : onModeSelect(mode.id))}
                disabled={!mode.unlocked}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? [themeStyles.accent, themeStyles.primary]
                      : mode.unlocked
                      ? [themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.05)']
                      : ['rgba(100, 100, 100, 0.2)', 'rgba(60, 60, 60, 0.2)']
                  }
                  style={[
                    styles.modeCardGradient,
                    isSelected && currentTheme === 'neon' && styles.neonModeCard,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.modeCardContent}>
                    <View style={[
                      styles.modeIconContainer,
                      isSelected && styles.selectedIconContainer,
                    ]}>
                      {mode.unlocked ? (
                        <>
                          <ModeIcon 
                            mode={mode.id} 
                            size={42} 
                            color={isSelected ? '#fff' : themeStyles.textPrimary} 
                          />
                          {isSelected && (
                            <View style={[
                              styles.iconGlow,
                              { backgroundColor: themeStyles.glowColor }
                            ]} />
                          )}
                        </>
                      ) : (
                        <Lock size={42} color="#666" />
                      )}
                    </View>
                    
                    <View style={styles.modeInfo}>
                      <View style={styles.modeNameContainer}>
                        <Text style={[
                          styles.modeName, 
                          { color: isSelected ? '#fff' : themeStyles.textPrimary },
                          !mode.unlocked && styles.lockedText
                        ]}>
                          {mode.name}
                        </Text>
                        {mode.unlocked && index === 0 && (
                          <View style={styles.popularBadge}>
                            <Star size={12} color="#FFD700" />
                            <Text style={styles.popularText}>POPULAR</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.modeDescription, 
                        { color: isSelected ? 'rgba(255, 255, 255, 0.9)' : themeStyles.textSecondary },
                        !mode.unlocked && styles.lockedText
                      ]}>
                        {mode.unlocked ? mode.description : 'Locked'}
                      </Text>
                    </View>

                    {/* Enhanced Selection Indicator */}
                    {isSelected && (
                      <View style={styles.selectionIndicator}>
                        <LinearGradient
                          colors={['#fff', 'rgba(255, 255, 255, 0.7)']}
                          style={styles.selectionDot}
                        />
                        <Zap size={16} color="#fff" style={styles.selectionIcon} />
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Enhanced Start Game Button */}
        {showAsMainMenu && (
          <View style={styles.startSection}>
            <TouchableOpacity 
              style={[styles.startButton, !selectedMode && styles.disabledButton]} 
              onPress={() => selectedMode && onModeSelect(selectedMode)}
              disabled={!selectedMode}
            >
              <LinearGradient
                colors={selectedMode 
                  ? [themeStyles.accent, themeStyles.primary, themeStyles.accent] 
                  : ['#666', '#444']
                }
                style={[
                  styles.startButtonGradient,
                  selectedMode && currentTheme === 'neon' && styles.neonStartButton,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.startButtonText, selectedMode && styles.activeStartText]}>
                  {selectedMode ? '🚀 START GAME' : 'SELECT MODE'}
                </Text>
                {selectedMode && (
                  <View style={[
                    styles.startButtonGlow,
                    { shadowColor: themeStyles.glowColor }
                  ]} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mainMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    height: '70%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainMenuContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  // Particles
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
    zIndex: 10,
  },
  coinsContainer: {
    flex: 1,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  settingsButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  settingsGradient: {
    padding: 14,
    borderRadius: 22,
  },

  // Title Section with Tower
  titleSection: {
    alignItems: 'center',
    paddingBottom: 50,
    zIndex: 10,
  },
  titleContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  gameTitleSecond: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    marginTop: -8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  blockStackContainer: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Animated Blocks
  animatedBlock: {
    position: 'absolute',
    borderRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
  },
  blockGradient: {
    flex: 1,
    borderRadius: 6,
  },
  blockShine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    opacity: 0.7,
  },

  // Modal Header
  modalHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Game Modes
  modesContainer: {
    flex: 1,
    zIndex: 5,
  },
  modesContent: {
    gap: 18,
    paddingBottom: 20,
  },
  modeCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  selectedModeCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  lockedModeCard: {
    opacity: 0.5,
  },
  modeCardGradient: {
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  neonModeCard: {
    shadowColor: '#00ffff',
    shadowOpacity: 0.6,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  modeIconContainer: {
    marginRight: 18,
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  selectedIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
  },
  modeInfo: {
    flex: 1,
  },
  modeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modeName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 2,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  selectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectionIcon: {
    position: 'absolute',
  },
  lockedText: {
    color: '#666',
  },

  // Enhanced Start Button
  startSection: {
    paddingTop: 30,
    zIndex: 10,
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  neonStartButton: {
    shadowColor: '#00ffff',
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeStartText: {
    fontSize: 19,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  startButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  // Effects
  neonGlow: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    opacity: 0.3,
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
});