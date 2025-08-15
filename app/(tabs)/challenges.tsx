import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Clock, Target, Zap, Lock, Play, Trophy, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ChallengeLevel } from '@/types/game';
import { CHALLENGE_LEVELS, THEME_UI_COLORS } from '@/constants/game';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { Background } from '@/components/Background';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getDifficultyColor = (level: number) => {
  if (level <= 5) return '#4CAF50'; // Easy - Green
  if (level <= 10) return '#FF9800'; // Medium - Orange
  if (level <= 15) return '#F44336'; // Hard - Red
  return '#9C27B0'; // Expert - Purple
};

const getDifficultyLabel = (level: number) => {
  if (level <= 5) return 'EASY';
  if (level <= 10) return 'MEDIUM';
  if (level <= 15) return 'HARD';
  return 'EXPERT';
};

export default function ChallengesScreen() {
  const router = useRouter();
  const { playSound } = useSoundManager();
  const { themeState, getCurrentUnlockedLevel } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | null>(null);

  const themeColors = THEME_UI_COLORS[themeState.currentTheme as keyof typeof THEME_UI_COLORS] || THEME_UI_COLORS.default;
  const currentUnlockedLevel = getCurrentUnlockedLevel();

  const handleLevelSelect = (level: ChallengeLevel) => {
    // Play button sound for level selection
    playSound('button', 0.6);
    setSelectedLevel(level);
  };

  const handleStartChallenge = (level: ChallengeLevel) => {
    // Play success sound when starting a challenge
    playSound('success', 0.8);
    
    // Navigate to game with challenge mode and auto-start
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
    // Play failed sound when trying to access locked level
    playSound('failed', 0.5);
  };

  const renderStars = (stars: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= stars ? '#FFD700' : '#666'}
            fill={star <= stars ? '#FFD700' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderLevelCard = (level: ChallengeLevel) => {
    const isLocked = level.id > currentUnlockedLevel;
    const challengeProgress = themeState.challengeProgress[level.id];
    const currentStars = challengeProgress?.stars || 0;
    const isCompleted = challengeProgress?.completed || false;
    const difficultyColor = getDifficultyColor(level.id);
    const difficultyLabel = getDifficultyLabel(level.id);

    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelCard,
          selectedLevel?.id === level.id && styles.selectedLevelCard,
          isLocked && styles.lockedLevelCard,
        ]}
        onPress={() => !isLocked ? handleLevelSelect(level) : handleLockedLevel()}
        disabled={isLocked}
      >
        <LinearGradient
          colors={
            isLocked
              ? ['rgba(100, 100, 100, 0.3)', 'rgba(60, 60, 60, 0.3)']
              : selectedLevel?.id === level.id
              ? [themeColors.accent, themeColors.accentSecondary]
              : isCompleted
              ? ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.1)']
              : [themeColors.cardBackground, 'rgba(255, 255, 255, 0.05)']
          }
          style={styles.levelCardGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelNumber}>
              {isLocked ? (
                <Lock size={20} color="#666" />
              ) : isCompleted ? (
                <Trophy size={18} color="#4CAF50" />
              ) : (
                <Text style={[
                  styles.levelNumberText,
                  { color: selectedLevel?.id === level.id ? '#fff' : themeColors.textPrimary }
                ]}>
                  {level.id}
                </Text>
              )}
            </View>
            
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyText}>{difficultyLabel}</Text>
            </View>
          </View>

          <View style={styles.levelContent}>
            <Text style={[
              styles.levelName,
              { color: isLocked ? '#666' : selectedLevel?.id === level.id ? '#fff' : themeColors.textPrimary }
            ]}>
              {level.name}
            </Text>
            
            <Text style={[
              styles.levelDescription,
              { color: isLocked ? '#555' : selectedLevel?.id === level.id ? 'rgba(255, 255, 255, 0.9)' : themeColors.textSecondary }
            ]} numberOfLines={2}>
              {level.description}
            </Text>

            <View style={styles.levelStats}>
              <View style={styles.statItem}>
                <Target size={14} color={isLocked ? '#666' : themeColors.accent} />
                <Text style={[
                  styles.statText,
                  { color: isLocked ? '#666' : themeColors.textTertiary }
                ]}>
                  {level.targetBlocks} blocks
                </Text>
              </View>
              
              {level.timeLimit && (
                <View style={styles.statItem}>
                  <Clock size={14} color={isLocked ? '#666' : themeColors.accent} />
                  <Text style={[
                    styles.statText,
                    { color: isLocked ? '#666' : themeColors.textTertiary }
                  ]}>
                    {level.timeLimit}s
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.levelFooter}>
              {renderStars(currentStars)}
              
              {!isLocked && (
                <TouchableOpacity
                  style={[
                    styles.playButton, 
                    { backgroundColor: isCompleted ? '#4CAF50' : themeColors.accent }
                  ]}
                  onPress={() => handleStartChallenge(level)}
                >
                  <Play size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const completedLevels = Object.values(themeState.challengeProgress).filter(level => level.completed).length;
  const totalStars = Object.values(themeState.challengeProgress).reduce((sum, level) => sum + level.stars, 0);

  return (
    <View style={styles.container}>
      <Background towerHeight={1} themeId={themeState.currentTheme} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Trophy size={28} color={themeColors.accent} />
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Challenges
            </Text>
          </View>
          
          <View style={styles.headerStats}>
            <TouchableOpacity 
              style={[styles.statBadge, { backgroundColor: themeColors.cardBackground }]}
              onPress={() => playSound('click', 0.5)}
            >
              <Award size={16} color={themeColors.accent} />
              <Text style={[styles.statBadgeText, { color: themeColors.textPrimary }]}>
                {completedLevels}/{CHALLENGE_LEVELS.length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statBadge, { backgroundColor: themeColors.cardBackground }]}
              onPress={() => playSound('click', 0.5)}
            >
              <Star size={16} color="#FFD700" />
              <Text style={[styles.statBadgeText, { color: themeColors.textPrimary }]}>
                {totalStars}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Selected Level Details */}
      {selectedLevel && (
        <View style={[styles.detailsPanel, { backgroundColor: themeColors.cardBackground }]}>
          <LinearGradient
            colors={[themeColors.accent, themeColors.accentSecondary]}
            style={styles.detailsGradient}
          >
            <View style={styles.detailsContent}>
              <Text style={styles.detailsTitle}>{selectedLevel.name}</Text>
              <Text style={styles.detailsObjective}>{selectedLevel.objective}</Text>
              
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartChallenge(selectedLevel)}
              >
                <Play size={20} color="#fff" />
                <Text style={styles.startButtonText}>START CHALLENGE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  levelCard: {
    width: (SCREEN_WIDTH - 55) / 2,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  selectedLevelCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lockedLevelCard: {
    opacity: 0.6,
  },
  levelCardGradient: {
    padding: 15,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelContent: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  levelStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  detailsGradient: {
    padding: 20,
  },
  detailsContent: {
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailsObjective: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 100,
  },
});