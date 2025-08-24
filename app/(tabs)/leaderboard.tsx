import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Crown, Star, Target, Clock, Infinity, TrendingUp, Calendar, Award, Zap, Gamepad as GamepadIcon, Shield, Flame, Swords } from 'lucide-react-native';
import { useTheme } from '@/contexts/GameContext';
import { useSound } from '@/contexts/SoundContext';
import { GameMode, ScoreRecord } from '@/types/game';
import { getTopScores } from '@/utils/storage';
import { CHALLENGE_LEVELS } from '@/constants/game';
import { useFocusEffect } from "expo-router";

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
  // Difficulty colors
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
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

const getDifficultyIcon = (difficulty: string, size: number = 16) => {
  switch (difficulty) {
    case 'easy':
      return <Shield size={size} color={PREMIUM_COLORS.easy} />;
    case 'medium':
      return <Flame size={size} color={PREMIUM_COLORS.medium} />;
    case 'hard':
      return <Swords size={size} color={PREMIUM_COLORS.hard} />;
    default:
      return <Shield size={size} color={PREMIUM_COLORS.easy} />;
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return PREMIUM_COLORS.easy;
    case 'medium':
      return PREMIUM_COLORS.medium;
    case 'hard':
      return PREMIUM_COLORS.hard;
    default:
      return PREMIUM_COLORS.easy;
  }
};

const getDifficultyDisplayName = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    default:
      return 'Easy';
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
  const { playSound } = useSound();
  const { themeState } = useTheme();
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);
  const [modeStats, setModeStats] = useState<{
    classic: { gamesPlayed: number; averageScore: number; bestStreak: number; difficultyBreakdown: Record<string, number> };
    timeAttack: { gamesPlayed: number; averageScore: number; bestTime: number; difficultyBreakdown: Record<string, number> };
    challenge: { gamesPlayed: number; levelsCompleted: number; totalStars: number; averageStars: number; difficultyBreakdown: Record<string, number> };
    totalGamesPlayed: number;
    overallDifficultyBreakdown: Record<string, number>;
  }>({
    classic: { gamesPlayed: 0, averageScore: 0, bestStreak: 0, difficultyBreakdown: {} },
    timeAttack: { gamesPlayed: 0, averageScore: 0, bestTime: 0, difficultyBreakdown: {} },
    challenge: { gamesPlayed: 0, levelsCompleted: 0, totalStars: 0, averageStars: 0, difficultyBreakdown: {} },
    totalGamesPlayed: 0,
    overallDifficultyBreakdown: {},
  });

  useFocusEffect(
    useCallback(() => {
      loadRecentScores();
      calculateModeStats();

      // optional cleanup
      return () => {
        //console.log("Leaderboard unfocused");
      };
    }, [selectedMode])
  );

  const loadRecentScores = async () => {
    try {
      const scores = await getTopScores(selectedMode === 'all' ? undefined : selectedMode, 10);
      setRecentScores(scores);
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  const calculateModeStats = async () => {
    try {
      // Get all scores for each mode
      const classicScores = await getTopScores('classic', 100);
      const timeAttackScores = await getTopScores('timeAttack', 100);
      const challengeScores = await getTopScores('challenge', 100);

      // Helper function to calculate difficulty breakdown
      const calculateDifficultyBreakdown = (scores: ScoreRecord[]) => {
        const breakdown: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
        scores.forEach(score => {
          console.log(score.difficulty)
          const difficulty = score.difficulty || 'medium'; // Default to medium if not specified
          breakdown[difficulty] = (breakdown[difficulty] || 0) + 1;
        });
        return breakdown;
      };

      // Calculate classic mode stats
      const classicDifficultyBreakdown = calculateDifficultyBreakdown(classicScores);
      const classicStats = {
        gamesPlayed: classicScores.length,
        averageScore: classicScores.length > 0
          ? Math.floor(classicScores.reduce((sum, score) => sum + score.score, 0) / classicScores.length)
          : 0,
        bestStreak: classicScores.length > 0
          ? Math.max(...classicScores.map(score => score.blocks))
          : 0,
        difficultyBreakdown: classicDifficultyBreakdown,
      };

      // Calculate time attack mode stats
      const timeAttackDifficultyBreakdown = calculateDifficultyBreakdown(timeAttackScores);
      const timeAttackStats = {
        gamesPlayed: timeAttackScores.length,
        averageScore: timeAttackScores.length > 0
          ? Math.floor(timeAttackScores.reduce((sum, score) => sum + score.score, 0) / timeAttackScores.length)
          : 0,
        bestTime: timeAttackScores.length > 0
          ? Math.max(...timeAttackScores.map(score => score.blocks)) // Using blocks as time indicator
          : 0,
        difficultyBreakdown: timeAttackDifficultyBreakdown,
      };

      // Calculate challenge mode stats
      const challengeProgress = themeState.challengeProgress;
      const completedLevels = Object.values(challengeProgress).filter(level => level.completed);
      const totalStars = Object.values(challengeProgress).reduce((sum, level) => sum + level.stars, 0);
      const challengeDifficultyBreakdown = calculateDifficultyBreakdown(challengeScores);

      const challengeStats = {
        gamesPlayed: challengeScores.length,
        levelsCompleted: completedLevels.length,
        totalStars,
        averageStars: completedLevels.length > 0
          ? Math.round((totalStars / completedLevels.length) * 10) / 10
          : 0,
        difficultyBreakdown: challengeDifficultyBreakdown,
      };

      // Calculate overall difficulty breakdown
      const allScores = [...classicScores, ...timeAttackScores, ...challengeScores];
      const overallDifficultyBreakdown = calculateDifficultyBreakdown(allScores);

      const totalGamesPlayed =
        classicStats.gamesPlayed +
        timeAttackStats.gamesPlayed +
        challengeStats.gamesPlayed;

      setModeStats({
        classic: classicStats,
        timeAttack: timeAttackStats,
        challenge: challengeStats,
        totalGamesPlayed,
        overallDifficultyBreakdown,
      });
    } catch (error) {
      console.error('Failed to calculate mode stats:', error);
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

  // Helper function to render difficulty breakdown
  const renderDifficultyBreakdown = (breakdown: Record<string, number>) => {
    const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
    if (total === 0) return null;

    return (
      <View style={styles.difficultyBreakdown}>
        {Object.entries(breakdown)
          .filter(([_, count]) => count > 0)
          .map(([difficulty, count]) => (
            <View key={difficulty} style={styles.difficultyChip}>
              <LinearGradient
                colors={[getDifficultyColor(difficulty) + '20', getDifficultyColor(difficulty) + '10']}
                style={styles.difficultyChipGradient}
              >
                {getDifficultyIcon(difficulty, 14)}
                <Text style={[styles.difficultyChipText, { color: getDifficultyColor(difficulty) }]}>
                  {count}
                </Text>
              </LinearGradient>
            </View>
          ))}
      </View>
    );
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
                <Text style={styles.secondaryStatValue}>{modeStats.totalGamesPlayed}</Text>
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

        {/* Overall Difficulty Breakdown */}
        {modeStats.totalGamesPlayed > 0 && (
          <View style={styles.overallDifficultySection}>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
            <View style={styles.overallDifficultyCard}>
              <LinearGradient
                colors={PREMIUM_COLORS.cardGradient}
                style={styles.overallDifficultyGradient}
              >
                <View style={styles.overallDifficultyHeader}>
                  <Text style={styles.overallDifficultyTitle}>Games by Difficulty</Text>
                  <Text style={styles.overallDifficultySubtitle}>
                    {modeStats.totalGamesPlayed} total games played
                  </Text>
                </View>
                {renderDifficultyBreakdown(modeStats.overallDifficultyBreakdown)}
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Game Mode Stats */}
        <View style={styles.gameModeStats}>
          <Text style={styles.sectionTitle}>Game Modes</Text>

          <View style={styles.modeStatsGrid}>
            {/* Classic Mode Stats */}
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
                <View style={styles.modeStatSecondary}>
                  <Text style={styles.modeStatSecondaryValue}>
                    {modeStats.classic.gamesPlayed} games
                  </Text>
                  <Text style={styles.modeStatSecondaryValue}>
                    Avg: {modeStats.classic.averageScore.toLocaleString()}
                  </Text>
                </View>
                {modeStats.classic.gamesPlayed > 0 && renderDifficultyBreakdown(modeStats.classic.difficultyBreakdown)}
              </LinearGradient>
            </View>

            {/* Time Attack Mode Stats */}
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
                <View style={styles.modeStatSecondary}>
                  <Text style={styles.modeStatSecondaryValue}>
                    {modeStats.timeAttack.gamesPlayed} games
                  </Text>
                  <Text style={styles.modeStatSecondaryValue}>
                    Best: {modeStats.timeAttack.bestTime} blocks
                  </Text>
                </View>
                {modeStats.timeAttack.gamesPlayed > 0 && renderDifficultyBreakdown(modeStats.timeAttack.difficultyBreakdown)}
              </LinearGradient>
            </View>

            {/* Challenge Mode Stats */}
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
                <View style={styles.modeStatSecondary}>
                  <Text style={styles.modeStatSecondaryValue}>
                    {totalStars} total stars
                  </Text>
                  <Text style={styles.modeStatSecondaryValue}>
                    Avg: {modeStats.challenge.averageStars} stars
                  </Text>
                </View>
                {modeStats.challenge.gamesPlayed > 0 && renderDifficultyBreakdown(modeStats.challenge.difficultyBreakdown)}
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
                  {selectedMode === 'all'
                    ? 'Start playing to build your leaderboard!'
                    : `Play ${getModeDisplayName(selectedMode as GameMode)} to see scores here!`
                  }
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
                        <View style={{ flexDirection: "column" }} >
                          <Text style={styles.scoreValue}>
                            {score.score.toLocaleString()}
                          </Text>
                          {score.mode === 'challenge' && score.level && (
                            <Text style={styles.challengeLevelText}>
                              {CHALLENGE_LEVELS.find(l => l.id === score.level)?.name || `Level ${score.level}`}
                            </Text>
                          )}
                        </View>
                        <View style={styles.scoreChips}>
                          <View style={styles.modeChip}>
                            <LinearGradient
                              colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.1)']}
                              style={styles.modeChipGradient}
                            >
                              {getModeIcon(score.mode, 16, PREMIUM_COLORS.primary)}
                              <Text style={styles.modeChipText}>
                                {getModeDisplayName(score.mode)}
                              </Text>
                              {/* Show level for challenge mode */}
                              {score.mode === 'challenge' && score.level && (
                                <Text style={styles.levelChipText}>
                                  L{score.level}
                                </Text>
                              )}
                            </LinearGradient>
                          </View>

                          {/* Difficulty Chip */}
                          <View style={styles.difficultyChipSmall}>
                            <LinearGradient
                              colors={[getDifficultyColor(score.difficulty || 'medium') + '20', getDifficultyColor(score.difficulty || 'medium') + '10']}
                              style={styles.difficultyChipSmallGradient}
                            >
                              {getDifficultyIcon(score.difficulty || 'medium', 14)}
                              <Text style={[styles.difficultyChipSmallText, { color: getDifficultyColor(score.difficulty || 'medium') }]}>
                                {getDifficultyDisplayName(score.difficulty || 'medium')}
                              </Text>
                            </LinearGradient>
                          </View>
                        </View>
                      </View>

                      <View style={styles.scoreFooter}>
                        <View style={styles.scoreDetail}>
                          <Text style={styles.scoreBlocks}>
                            {score.blocks} blocks
                          </Text>
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
    paddingTop: 10,
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

  // Overall Difficulty Section
  overallDifficultySection: {
    marginBottom: 14,
  },
  overallDifficultyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    overflow: 'hidden',
  },
  overallDifficultyGradient: {
    padding: 20,
  },
  overallDifficultyHeader: {
    marginBottom: 16,
  },
  overallDifficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 4,
  },
  overallDifficultySubtitle: {
    fontSize: 14,
    color: PREMIUM_COLORS.textSecondary,
    fontWeight: '500',
  },

  // Difficulty Breakdown Styles
  difficultyBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  difficultyChip: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  difficultyChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  difficultyChipText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  modeStatSecondary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  modeStatSecondaryValue: {
    fontSize: 12,
    color: PREMIUM_COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: 2,
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
    overflow: "hidden"
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
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: PREMIUM_COLORS.textPrimary,
    letterSpacing: -0.5,
    flex: 1,
  },
  scoreChips: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
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
  levelChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PREMIUM_COLORS.primaryLight,
    marginLeft: 4,
    opacity: 0.8,
  },

  // Small difficulty chip for score cards
  difficultyChipSmall: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  difficultyChipSmallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  difficultyChipSmallText: {
    fontSize: 10,
    fontWeight: 'bold',
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
  challengeLevelText: {
    fontSize: 13,
    fontWeight: '700',
    color: PREMIUM_COLORS.bronze,
    textAlign: "center",
    opacity: 0.9
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