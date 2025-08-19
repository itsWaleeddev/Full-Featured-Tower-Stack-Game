import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Lock, Trophy, Award, Play, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ChallengeLevel } from '@/types/game';
import { CHALLENGE_LEVELS } from '@/constants/game';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium color scheme - independent of app themes
const PREMIUM_COLORS = {
  background: ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)'] as const,
  cardBackground: 'rgba(0, 0, 0, 0.4)',
  cardBorder: 'rgba(59, 130, 246, 0.3)',
  cardBorderHover: 'rgba(59, 130, 246, 0.6)',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#1d4ed8',
  accent: '#60a5fa',
  textPrimary: '#ffffff',
  textSecondary: '#e5e7eb',
  textTertiary: '#9ca3af',
  coin: '#fbbf24',
  success: '#10b981',
  locked: '#6b7280',
  lockedBackground: 'rgba(107, 114, 128, 0.2)',
  // New colors for current level
  currentLevel: '#10b981',
  currentLevelGlow: 'rgba(16, 185, 129, 0.3)',
  currentLevelBorder: 'rgba(16, 185, 129, 0.6)',
};

const getDifficultyColor = (level: number) => {
  if (level <= 5) return '#10b981'; // Easy - Green
  if (level <= 10) return '#f59e0b'; // Medium - Amber
  if (level <= 15) return '#ef4444'; // Hard - Red
  return '#8b5cf6'; // Expert - Purple
};

const getDifficultyLabel = (level: number) => {
  if (level <= 5) return 'EASY';
  if (level <= 10) return 'MEDIUM';
  if (level <= 15) return 'HARD';
  return 'EXPERT';
};

const getCoinsForLevel = (levelId: number) => {
  return 100 + (levelId - 1) * 50; // Level 1: 100, Level 2: 150, etc.
};

export default function ChallengesScreen() {
  const router = useRouter();
  const { playSound } = useSoundManager();
  const { themeState, getCurrentUnlockedLevel } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | null>(null);

  const currentUnlockedLevel = getCurrentUnlockedLevel();

  const handleLevelSelect = (level: ChallengeLevel) => {
    playSound('button', 0.6);
    setSelectedLevel(level);
  };

  const handleStartChallenge = (level: ChallengeLevel) => {
    playSound('success', 0.8);

    router.push({
      pathname: '/',
      params: {
        mode: 'challenge',
        levelId: level.id.toString(),
        autoStart: 'true'
      }
    });
  };

  const handleLockedLevel = () => {
    playSound('failed', 0.5);
  };

  const closeLevelSelection = () => {
    setSelectedLevel(null);
  };

  const renderStars = (stars: number, isCurrentLevel: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= stars ? PREMIUM_COLORS.coin : (isCurrentLevel ? PREMIUM_COLORS.currentLevel : PREMIUM_COLORS.locked)}
            fill={star <= stars ? PREMIUM_COLORS.coin : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const CoinIcon = () => (
    <View style={styles.coinIcon}>
      <Text style={styles.coinText}>🪙</Text>
    </View>
  );

  const renderLevelCard = (level: ChallengeLevel) => {
    const isLocked = level.id > currentUnlockedLevel;
    const challengeProgress = themeState.challengeProgress[level.id];
    const currentStars = challengeProgress?.stars || 0;
    const isCompleted = challengeProgress?.completed || false;
    const difficultyColor = getDifficultyColor(level.id);
    const difficultyLabel = getDifficultyLabel(level.id);
    const coins = getCoinsForLevel(level.id);
    
    // Check if this is the current level (unlocked with 0 stars)
    const isCurrentLevel = !isLocked && currentStars === 0 && !isCompleted;

    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelCard,
          isLocked && styles.lockedLevelCard,
          isCurrentLevel && styles.currentLevelCard,
          selectedLevel?.id === level.id && { borderWidth: 2, borderColor: PREMIUM_COLORS.primary },
        ]}
        onPress={() => !isLocked ? handleLevelSelect(level) : handleLockedLevel()}
        disabled={isLocked}
      >
        <LinearGradient
          colors={
            isLocked
              ? [PREMIUM_COLORS.lockedBackground, PREMIUM_COLORS.lockedBackground]
              : isCurrentLevel
              ? ['rgba(16, 185, 129, 0.15)', 'rgba(0, 0, 0, 0.6)']
              : [PREMIUM_COLORS.cardBackground, 'rgba(0, 0, 0, 0.6)']
          }
          style={styles.levelCardGradient}
        >
          {/* Current Level Indicator */}
          {isCurrentLevel && (
            <View style={styles.currentLevelIndicator}>
              <Text style={styles.currentLevelText}>NEXT</Text>
            </View>
          )}

          {/* Level Number */}
          <View style={styles.levelHeader}>
            <View style={[
              styles.levelNumber,
              { 
                backgroundColor: isLocked 
                  ? PREMIUM_COLORS.locked 
                  : isCurrentLevel 
                  ? PREMIUM_COLORS.currentLevel 
                  : PREMIUM_COLORS.primary 
              }
            ]}>
              {isLocked ? (
                <Lock size={16} color="#ffffff" />
              ) : (
                <Text style={styles.levelNumberText}>{level.id}</Text>
              )}
            </View>

            {/* Coins Display */}
            <View style={styles.coinsContainer}>
              <CoinIcon />
              <Text style={[
                styles.coinsText,
                { color: isLocked ? PREMIUM_COLORS.locked : PREMIUM_COLORS.coin }
              ]}>
                {coins}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.levelContent}>
            <Text style={[
              styles.levelName,
              { 
                color: isLocked 
                  ? PREMIUM_COLORS.locked 
                  : isCurrentLevel 
                  ? PREMIUM_COLORS.currentLevel 
                  : PREMIUM_COLORS.textPrimary 
              }
            ]}>
              {level.name}
            </Text>

            <Text style={[
              styles.difficultyLabel,
              { color: isLocked ? PREMIUM_COLORS.locked : difficultyColor }
            ]}>
              {difficultyLabel}
            </Text>

            {/* Stars */}
            <View style={styles.levelFooter}>
              {renderStars(currentStars, isCurrentLevel)}

              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: isLocked 
                    ? PREMIUM_COLORS.locked 
                    : isCurrentLevel 
                    ? PREMIUM_COLORS.currentLevel 
                    : PREMIUM_COLORS.primary 
                }
              ]}>
                <Text style={styles.statusText}>
                  {isLocked ? 'Locked' : isCurrentLevel ? 'Start!' : 'Available'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const completedLevels = Object.values(themeState.challengeProgress).filter(level => level.completed).length;
  const totalStars = Object.values(themeState.challengeProgress).reduce((sum, level) => sum + level.stars, 0);

  return (
    <LinearGradient colors={PREMIUM_COLORS.background} style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Trophy size={28} color={PREMIUM_COLORS.primary} />
            <Text style={styles.title}>Challenges</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Test your skills and earn rewards</Text>
      </View>

      {/* Challenge Grid */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.levelsGrid}>
          {CHALLENGE_LEVELS.map(renderLevelCard)}
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Level Selection Modal */}
      {selectedLevel && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={closeLevelSelection}
            activeOpacity={1}
          />

          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[PREMIUM_COLORS.cardBackground, 'rgba(0, 0, 0, 0.9)']}
              style={styles.modalContent}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeLevelSelection}
              >
                <X size={20} color={PREMIUM_COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={[styles.modalLevelNumber, { backgroundColor: PREMIUM_COLORS.primary }]}>
                  <Text style={styles.modalLevelNumberText}>{selectedLevel.id}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedLevel.name}</Text>
                <Text style={[styles.modalDifficulty, { color: getDifficultyColor(selectedLevel.id) }]}>
                  {getDifficultyLabel(selectedLevel.id)}
                </Text>
              </View>

              {/* Reward Info */}
              <View style={styles.rewardInfo}>
                <View style={styles.rewardContainer}>
                  <CoinIcon />
                  <Text style={styles.rewardText}>{getCoinsForLevel(selectedLevel.id)} Coins</Text>
                </View>
                <Text style={styles.rewardSubtext}>Complete this challenge to earn coins</Text>
              </View>

              {/* Stars Display */}
              <View style={styles.modalStars}>
                {[...Array(3)].map((_, i) => {
                  const starsEarned = themeState.challengeProgress[selectedLevel.id]?.stars || 0;
                  const isEarned = i < starsEarned;
                  return (
                    <Star
                      key={i}
                      size={24}
                      color={isEarned ? PREMIUM_COLORS.coin : PREMIUM_COLORS.textSecondary}
                      fill={isEarned ? PREMIUM_COLORS.coin : "none"}
                    />
                  );
                })}
              </View>
              {/* Start Button */}
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: PREMIUM_COLORS.primary }]}
                onPress={() => handleStartChallenge(selectedLevel)}
              >
                <Play size={20} color="#ffffff" />
                <Text style={styles.startButtonText}>Start Challenge</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 35,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 12,
    color: PREMIUM_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 18,
    color: PREMIUM_COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  levelCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.cardBorder,
  },
  lockedLevelCard: {
    opacity: 0.6,
  },
  currentLevelCard: {
    borderColor: PREMIUM_COLORS.currentLevelBorder,
    borderWidth: 2,
    shadowColor: PREMIUM_COLORS.currentLevel,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: -2,
  },
  currentLevelIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: PREMIUM_COLORS.currentLevel,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  currentLevelText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  levelCardGradient: {
    padding: 16,
    position: 'relative',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    marginRight: 4,
  },
  coinText: {
    fontSize: 16,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelContent: {
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', //0.7
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PREMIUM_COLORS.cardBorder,
  },
  modalContent: {
    padding: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    zIndex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalLevelNumber: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLevelNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDifficulty: {
    fontSize: 18,
    fontWeight: '600',
  },
  rewardInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.coin,
    marginLeft: 8,
  },
  rewardSubtext: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    textAlign: 'center',
  },
  modalStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 100,
  },
});