import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Volume2, VolumeX, Trash2, Info, Target, Zap, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/GameContext';
import { useSound } from '@/contexts/SoundContext';
import { clearAllData } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium color scheme matching leaderboard
const PREMIUM_COLORS = {
  background: ['#0a0a0a', '#1a1a1a'] as const,
  surfaceGradient: ['rgba(15, 23, 42, 0.8)', 'rgba(30, 41, 59, 0.4)'] as const,
  cardGradient: ['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)'] as const,
  glowGradient: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)'] as const,
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  accent: '#8b5cf6',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#64748b',
  gold: '#fbbf24',
  silver: '#e2e8f0',
  bronze: '#f97316',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  border: 'rgba(148, 163, 184, 0.1)',
  borderLight: 'rgba(148, 163, 184, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultyOption {
  id: DifficultyLevel;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: [string, string];
}

export default function SettingsScreen() {
  const { playSound, soundEnabled, toggleSound } = useSound();
  const { themeState, updateThemeState, setDifficulty } = useTheme();
  const [isResetting, setIsResetting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  const difficultyOptions: DifficultyOption[] = [
    {
      id: 'easy',
      name: 'Easy',
      description: '25% slower block speed • 3 extra seconds per level',
      icon: <Shield size={20} color={PREMIUM_COLORS.success} />,
      color: PREMIUM_COLORS.success,
      gradient: ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)'],
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Default block speed • Standard time limits',
      icon: <Target size={20} color={PREMIUM_COLORS.warning} />,
      color: PREMIUM_COLORS.warning,
      gradient: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)'],
    },
    {
      id: 'hard',
      name: 'Hard',
      description: '35% faster blocks • 2 seconds less per level',
      icon: <Zap size={20} color={PREMIUM_COLORS.danger} />,
      color: PREMIUM_COLORS.danger,
      gradient: ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)'],
    },
  ];

  const handleSoundToggle = async () => {
    //playSound('button', 0.6);
    toggleSound();
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    playSound('button', 0.6);
    setSelectedDifficulty(difficulty);
    // Here you would typically save this to storage or context
    setDifficulty(difficulty); // ← updates global context
  };

  const handleResetData = () => {
    playSound('button', 0.6);

    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, scores, and unlocked themes. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => playSound('click', 0.5),
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              setSelectedDifficulty('medium');
              await clearAllData();

              // Reset theme state to initial values
              updateThemeState({
                coins: 0,
                currentTheme: 'default',
                unlockedThemes: ['default'],
                challengeProgress: {},
                currentUnlockedLevel: 1,
                highScores: { classic: 0, timeAttack: 0, challenge: 0 },
                totalGamesPlayed: 0,
              });

              playSound('success', 0.8);
              Alert.alert('Success', 'All data has been reset successfully.');
            } catch (error) {
              playSound('failed', 0.8);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleTestSound = () => {
    playSound('chime', 0.8);
  };

  return (
    <LinearGradient colors={PREMIUM_COLORS.background} style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={PREMIUM_COLORS.surfaceGradient}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <View style={styles.iconWrapper}>
                <Settings size={32} color={PREMIUM_COLORS.primary} />
                <View style={styles.iconGlow} />
              </View>
              <View>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Customize your experience</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>

          {/* Sound Settings */}
          <View style={styles.settingCard}>
            <LinearGradient
              colors={PREMIUM_COLORS.cardGradient}
              style={styles.settingCardGradient}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  {soundEnabled ? (
                    <Volume2 size={24} color={PREMIUM_COLORS.primary} />
                  ) : (
                    <VolumeX size={24} color={PREMIUM_COLORS.textTertiary} />
                  )}
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Sound Effects</Text>
                  <Text style={styles.settingDescription}>
                    Enable or disable game sound effects
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{
                    false: 'rgba(100, 116, 139, 0.3)',
                    true: PREMIUM_COLORS.primary + '80'
                  }}
                  thumbColor={soundEnabled ? PREMIUM_COLORS.primary : PREMIUM_COLORS.textTertiary}
                  ios_backgroundColor="rgba(100, 116, 139, 0.3)"
                />
              </View>

              {/* {soundEnabled && (
                <View style={styles.settingActions}>
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={handleTestSound}
                  >
                    <LinearGradient
                      colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.1)']}
                      style={styles.testButtonGradient}
                    >
                      <Volume2 size={16} color={PREMIUM_COLORS.primary} />
                      <Text style={styles.testButtonText}>Test Sound</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )} */}
            </LinearGradient>
          </View>

          {/* Difficulty Setting */}
          <View style={styles.settingCard}>
            <LinearGradient
              colors={PREMIUM_COLORS.cardGradient}
              style={styles.settingCardGradient}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  <Target size={24} color={PREMIUM_COLORS.accent} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Difficulty Level</Text>
                  <Text style={styles.settingDescription}>
                    Choose your preferred game difficulty
                  </Text>
                </View>
              </View>

              <View style={styles.difficultyOptions}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.difficultyOption}
                    onPress={() => handleDifficultySelect(option.id)}
                  >
                    <LinearGradient
                      colors={
                        selectedDifficulty === option.id
                          ? option.gradient
                          : ['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.6)']
                      }
                      style={[
                        styles.difficultyOptionGradient,
                        selectedDifficulty === option.id && {
                          borderColor: option.color,
                          borderWidth: 1,
                        }
                      ]}
                    >
                      <View style={[
                        styles.difficultyIcon,
                        { backgroundColor: selectedDifficulty === option.id ? option.color + '20' : 'rgba(100, 116, 139, 0.2)' }
                      ]}>
                        {option.icon}
                      </View>
                      <View style={styles.difficultyInfo}>
                        <Text style={[
                          styles.difficultyName,
                          { color: selectedDifficulty === option.id ? PREMIUM_COLORS.textPrimary : PREMIUM_COLORS.textSecondary }
                        ]}>
                          {option.name}
                        </Text>
                        <Text style={[
                          styles.difficultyDesc,
                          { color: selectedDifficulty === option.id ? PREMIUM_COLORS.textSecondary : PREMIUM_COLORS.textTertiary }
                        ]}>
                          {option.description}
                        </Text>
                      </View>
                      {selectedDifficulty === option.id && (
                        <View style={[styles.selectedIndicator, { backgroundColor: option.color }]} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <View style={styles.settingCard}>
            <LinearGradient
              colors={PREMIUM_COLORS.cardGradient}
              style={styles.settingCardGradient}
            >
              <View style={styles.settingHeader}>
                <View style={[styles.settingIcon, styles.dangerIcon]}>
                  <Trash2 size={24} color={PREMIUM_COLORS.danger} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: PREMIUM_COLORS.danger }]}>
                    Reset All Data
                  </Text>
                  <Text style={styles.settingDescription}>
                    Clear all progress, scores, and settings permanently
                  </Text>
                </View>
              </View>

              <View style={styles.settingActions}>
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleResetData}
                  disabled={isResetting}
                >
                  <LinearGradient
                    colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.1)']}
                    style={styles.dangerButtonGradient}
                  >
                    <Trash2 size={16} color={PREMIUM_COLORS.danger} />
                    <Text style={styles.dangerButtonText}>
                      {isResetting ? 'Resetting...' : 'Reset Data'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.appInfo}>
          <LinearGradient
            colors={PREMIUM_COLORS.cardGradient}
            style={styles.appInfoGradient}
          >
            <View style={styles.appInfoHeader}>
              <View style={styles.appIcon}>
                <Info size={24} color={PREMIUM_COLORS.primary} />
              </View>
              <View style={styles.appDetails}>
                <Text style={styles.appName}>Stack Tower</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
                <Text style={styles.appTech}>Built with React Native & Expo</Text>
              </View>
            </View>


          </LinearGradient>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 35,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  headerGradient: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.borderLight,
    padding: 10
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: PREMIUM_COLORS.primary,
    opacity: 0.2,
  },
  title: {
    fontSize: 28, //32
    fontWeight: '700', //800
    color: PREMIUM_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, //16
    color: PREMIUM_COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingCardGradient: {
    padding: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    lineHeight: 20,
  },
  settingActions: {
    marginTop: 16,
    paddingTop: 16,
    flex:1,
    borderTopWidth: 1,
    borderTopColor: PREMIUM_COLORS.border,
  },
  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.primary,
  },
  difficultyOptions: {
    marginTop: 16,
    gap: 12,
  },
  difficultyOption: {
    borderRadius: 12,
    //overflow: 'visible',
  },
  difficultyOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  difficultyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  difficultyDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -6 }],
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dangerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent:"center"
  },
  dangerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.danger,
  },
  appInfo: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  appInfoGradient: {
    padding: 20,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    marginBottom: 2,
  },
  appTech: {
    fontSize: 12,
    color: PREMIUM_COLORS.textTertiary,
  },

  bottomSpacer: {
    height: 40,
  },
});