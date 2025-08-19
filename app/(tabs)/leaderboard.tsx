import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Crown, Star, Target, Clock, Infinity, TrendingUp, Calendar, Award, Zap, GamepadIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { GameMode, ScoreRecord } from '@/types/game';
import { getTopScores } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium color scheme with enhanced gradients
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
  border: 'rgba(148, 163, 184, 0.1)',
  borderLight: 'rgba(148, 163, 184, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const getModeIcon = (mode: GameMode, size: number = 20, color: string = '#fff') => {
  switch (mode) {
    case 'classic':
      return <Infinity size={size} color={color} />;
    case 'timeAttack':
      return <Clock size={size} color={color} />;
    case 'challenge':
      return <Target size={size} color={color} />;
    default:
      return <Trophy size={size} color={color} />;
  }
};

const getModeDisplayName = (mode: GameMode): string => {
  switch (mode) {
    case 'classic':
      return 'Classic';
    case 'timeAttack':
      return 'Time Attack';
    case 'challenge':
      return 'Challenge';
    default:
      return 'Unknown';
  }
};

const getRankIcon = (rank: number, size: number = 24) => {
  switch (rank) {
    case 1:
      return <Crown size={size} color={PREMIUM_COLORS.gold} />;
    case 2:
      return <Medal size={size} color={PREMIUM_COLORS.silver} />;
    case 3:
      return <Medal size={size} color={PREMIUM_COLORS.bronze} />;
    default:
      return <Trophy size={size} color={PREMIUM_COLORS.textTertiary} />;
  }
};

const getRankGradient = (rank: number): [string, string] => {
  switch (rank) {
    case 1:
      return ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)'];
    case 2:
      return ['rgba(226, 232, 240, 0.15)', 'rgba(226, 232, 240, 0.05)'];
    case 3:
      return ['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)'];
    default:
      return ['rgba(100, 116, 139, 0.1)', 'rgba(100, 116, 139, 0.05)'];
  }
};

export default function LeaderboardScreen() {
  const { playSound } = useSoundManager();
  const { themeState } = useTheme();
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);

  useEffect(() => {
    loadRecentScores();
  }, [selectedMode]);

  const loadRecentScores = async () => {
    try {
      const scores = await getTopScores(selectedMode === 'all' ? undefined : selectedMode, 10);
      setRecentScores(scores);
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  const handleModeSelect = (mode: GameMode | 'all') => {
    playSound('button', 0.6);
    setSelectedMode(mode);
  };

  const modes: Array<{ id: GameMode | 'all'; name: string; icon: React.ReactNode; color: string }> = [
    { id: 'all', name: 'All Modes', icon: <Trophy size={18} color="#fff" />, color: PREMIUM_COLORS.primary },
    { id: 'classic', name: 'Classic', icon: getModeIcon('classic', 18), color: PREMIUM_COLORS.success },
    { id: 'timeAttack', name: 'Time Attack', icon: getModeIcon('timeAttack', 18), color: PREMIUM_COLORS.accent },
    { id: 'challenge', name: 'Challenge', icon: getModeIcon('challenge', 18), color: PREMIUM_COLORS.bronze },
  ];

  const completedLevels = Object.values(themeState.challengeProgress).filter(level => level.completed).length;
  const totalStars = Object.values(themeState.challengeProgress).reduce((sum, level) => sum + level.stars, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <Trophy size={32} color={PREMIUM_COLORS.primary} />
                <View style={styles.iconGlow} />
              </View>
              <View>
                <Text style={styles.title}>Leaderboard</Text>
                <Text style={styles.subtitle}>Your gaming achievements</Text>
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
        {/* Hero Stats */}
        <View style={styles.heroStats}>
          <View style={styles.primaryStatCard}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.primaryStatGradient}
            >
              <View style={styles.primaryStatContent}>
                <View style={styles.primaryStatIcon}>
                  <Zap size={28} color={PREMIUM_COLORS.primary} />
                </View>
                <Text style={styles.primaryStatValue}>
                  {Math.max(
                    themeState.highScores.classic,
                    themeState.highScores.timeAttack,
                    themeState.highScores.challenge
                  ).toLocaleString()}
                </Text>
                <Text style={styles.primaryStatLabel}>Personal Best</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.secondaryStats}>
            <View style={styles.secondaryStatCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.secondaryStatGradient}
              >
                <GamepadIcon size={20} color={PREMIUM_COLORS.success} />
                <Text style={styles.secondaryStatValue}>{themeState.totalGamesPlayed}</Text>
                <Text style={styles.secondaryStatLabel}>Games</Text>
              </LinearGradient>
            </View>

            <View style={styles.secondaryStatCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.secondaryStatGradient}
              >
                <Star size={20} color={PREMIUM_COLORS.gold} />
                <Text style={styles.secondaryStatValue}>{totalStars}</Text>
                <Text style={styles.secondaryStatLabel}>Stars</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Game Mode Stats */}
        <View style={styles.gameModeStats}>
          <Text style={styles.sectionTitle}>Game Modes</Text>
          
          <View style={styles.modeStatsGrid}>
            <View style={styles.modeStatCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.modeStatGradient}
              >
                <View style={styles.modeStatHeader}>
                  <View style={[styles.modeStatIcon, { backgroundColor: PREMIUM_COLORS.success }]}>
                    <Infinity size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.modeStatTitle}>Classic Mode</Text>
                </View>
                <Text style={styles.modeStatValue}>
                  {themeState.highScores.classic.toLocaleString()}
                </Text>
                <Text style={styles.modeStatLabel}>Best Score</Text>
              </LinearGradient>
            </View>

            <View style={styles.modeStatCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.modeStatGradient}
              >
                <View style={styles.modeStatHeader}>
                  <View style={[styles.modeStatIcon, { backgroundColor: PREMIUM_COLORS.accent }]}>
                    <Clock size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.modeStatTitle}>Time Attack</Text>
                </View>
                <Text style={styles.modeStatValue}>
                  {themeState.highScores.timeAttack.toLocaleString()}
                </Text>
                <Text style={styles.modeStatLabel}>Best Score</Text>
              </LinearGradient>
            </View>

            <View style={styles.modeStatCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.modeStatGradient}
              >
                <View style={styles.modeStatHeader}>
                  <View style={[styles.modeStatIcon, { backgroundColor: PREMIUM_COLORS.bronze }]}>
                    <Target size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.modeStatTitle}>Challenge</Text>
                </View>
                <Text style={styles.modeStatValue}>{completedLevels}/20</Text>
                <Text style={styles.modeStatLabel}>Completed</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Mode Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Recent Scores</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.modeFilter}
            contentContainerStyle={styles.modeFilterContent}
          >
            {modes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={styles.modeButton}
                onPress={() => handleModeSelect(mode.id)}
              >
                <LinearGradient
                  colors={
                    selectedMode === mode.id 
                      ? [mode.color, mode.color + '80']
                      : ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']
                  }
                  style={styles.modeButtonGradient}
                >
                  <View style={[
                    styles.modeButtonIcon,
                    selectedMode === mode.id && { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  ]}>
                    {mode.icon}
                  </View>
                  <Text style={[
                    styles.modeButtonText,
                    { color: selectedMode === mode.id ? '#ffffff' : PREMIUM_COLORS.textSecondary }
                  ]}>
                    {mode.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scores List */}
        <View style={styles.scoresContainer}>
          {recentScores.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.emptyStateGradient}
              >
                <View style={styles.emptyStateIcon}>
                  <Trophy size={56} color={PREMIUM_COLORS.textTertiary} />
                </View>
                <Text style={styles.emptyStateTitle}>No scores yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Start playing to build your leaderboard!
                </Text>
              </LinearGradient>
            </View>
          ) : (
            recentScores.map((score, index) => (
              <View key={`${score.date}-${index}`} style={styles.scoreCard}>
                <LinearGradient
                  colors={getRankGradient(index + 1)}
                  style={styles.scoreCardGlow}
                >
                  <LinearGradient
                    colors={PREMIUM_COLORS.cardGradient}
                    style={styles.scoreCardGradient}
                  >
                    {/* Rank Section */}
                    <View style={styles.scoreRank}>
                      <View style={styles.rankIconContainer}>
                        {getRankIcon(index + 1, 28)}
                      </View>
                      <Text style={[
                        styles.rankNumber,
                        { 
                          color: index < 3 
                            ? [PREMIUM_COLORS.gold, PREMIUM_COLORS.silver, PREMIUM_COLORS.bronze][index]
                            : PREMIUM_COLORS.textSecondary
                        }
                      ]}>
                        #{index + 1}
                      </Text>
                    </View>

                    {/* Score Info */}
                    <View style={styles.scoreInfo}>
                      <View style={styles.scoreHeader}>
                        <Text style={styles.scoreValue}>
                          {score.score.toLocaleString()}
                        </Text>
                        <View style={styles.modeChip}>
                          <LinearGradient
                            colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.1)']}
                            style={styles.modeChipGradient}
                          >
                            {getModeIcon(score.mode, 16, PREMIUM_COLORS.primary)}
                            <Text style={styles.modeChipText}>
                              {getModeDisplayName(score.mode)}
                            </Text>
                          </LinearGradient>
                        </View>
                      </View>
                      
                      <View style={styles.scoreFooter}>
                        <View style={styles.scoreDetail}>
                          <Text style={styles.scoreBlocks}>{score.blocks} blocks</Text>
                        </View>
                        <Text style={styles.scoreDate}>
                          {formatDate(score.date)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </LinearGradient>
              </View>
            ))
          )}
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
    fontSize: 28,
    fontWeight: '700',
    color: PREMIUM_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  heroStats: {
    marginBottom: 14,
  },
  primaryStatCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.borderLight,
    marginBottom: 10,
    overflow: 'hidden',
  },
  primaryStatGradient: {
    padding: 20,
    alignItems: 'center',
  },
  primaryStatContent: {
    alignItems: 'center',
  },
  primaryStatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryStatValue: {
    fontSize: 36,
    fontWeight: '800',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  primaryStatLabel: {
    fontSize: 16,
    color: PREMIUM_COLORS.textSecondary,
    fontWeight: '600',
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryStatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
  },
  secondaryStatGradient: {
    padding: 20,
    alignItems: 'center',
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: PREMIUM_COLORS.textTertiary,
    fontWeight: '600',
  },
  gameModeStats: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  modeStatsGrid: {
    gap: 12,
  },
  modeStatCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modeStatGradient: {
    padding: 20,
  },
  modeStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeStatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
  },
  modeStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modeStatLabel: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 24,
  },
  modeFilter: {
    maxHeight: 60,
  },
  modeFilterContent: {
    paddingRight: 24,
  },
  modeButton: {
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
  },
  modeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  modeButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow:"hidden"
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoresContainer: {
    gap: 12,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: PREMIUM_COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  scoreCardGlow: {
    padding: 1,
  },
  scoreCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
  },
  scoreRank: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  rankIconContainer: {
    marginBottom: 8,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: PREMIUM_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  modeChip: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  modeChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.primary,
  },
  scoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBlocks: {
    fontSize: 14,
    fontWeight: '600',
    color: PREMIUM_COLORS.textSecondary,
  },
  scoreDate: {
    fontSize: 12,
    color: PREMIUM_COLORS.textTertiary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});