import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScoreRecord, GameState } from '../types/game';

const HIGH_SCORE_KEY = '@stack_tower_high_score';
const GAME_DATA_KEY = '@stack_tower_game_data';
const SCORES_KEY = '@stack_tower_scores';

export const getHighScore = async (): Promise<number> => {
  try {
    const score = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

export const saveHighScore = async (score: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

export const saveGameData = async (gameData: Partial<GameState>): Promise<void> => {
  try {
    const dataToSave = {
      coins: gameData.coins || 0,
      currentTheme: gameData.currentTheme || 'default',
      unlockedThemes: gameData.unlockedThemes || ['default'],
      unlockedSkins: gameData.unlockedSkins || [],
      dailyChallengeCompleted: gameData.dailyChallengeCompleted || false,
      lastDailyChallengeDate: gameData.lastDailyChallengeDate || '',
      challengeProgress: gameData.challengeProgress || {},
      currentUnlockedLevel: gameData.currentUnlockedLevel || 1,
      highScores: gameData.highScores || { classic: 0, timeAttack: 0, challenge: 0 },
      totalGamesPlayed: gameData.totalGamesPlayed || 0,
    };
    
    await AsyncStorage.setItem(GAME_DATA_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};

export const loadGameData = async (): Promise<Partial<GameState>> => {
  try {
    const data = await AsyncStorage.getItem(GAME_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading game data:', error);
    return {};
  }
};

export const saveScore = async (scoreRecord: ScoreRecord): Promise<void> => {
  try {
    const existingScores = await getScores();
    const updatedScores = [...existingScores, scoreRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Keep top 50 scores
    
    await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const getScores = async (): Promise<ScoreRecord[]> => {
  try {
    const scores = await AsyncStorage.getItem(SCORES_KEY);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
};

export const getTopScores = async (mode?: string, limit: number = 10): Promise<ScoreRecord[]> => {
  try {
    const allScores = await getScores();
    const filteredScores = mode 
      ? allScores.filter(score => score.mode === mode)
      : allScores;
    
    return filteredScores.slice(0, limit);
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([HIGH_SCORE_KEY, GAME_DATA_KEY, SCORES_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};