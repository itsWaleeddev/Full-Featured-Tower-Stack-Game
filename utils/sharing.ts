import { Share, Alert } from 'react-native';
import { ScoreRecord } from '../types/game';

export const shareScore = async (scoreRecord: ScoreRecord): Promise<void> => {
  try {
    const modeNames = {
      classic: 'Classic Mode',
      timeAttack: 'Time Attack',
      challenge: 'Challenge Mode',
    };

    const message = `🏗️ Just scored ${scoreRecord.score.toLocaleString()} points in Stack Tower ${modeNames[scoreRecord.mode]}! 
    
Stacked ${scoreRecord.blocks} blocks like a pro! 🎯
    
Can you beat my score? Download Stack Tower and find out!`;

    const result = await Share.share({
      message,
      title: 'Check out my Stack Tower score!',
    });

    if (result.action === Share.sharedAction) {
      console.log('Score shared successfully');
    }
  } catch (error) {
    console.error('Error sharing score:', error);
    Alert.alert('Error', 'Failed to share score. Please try again.');
  }
};

export const shareScreenshot = async (uri: string, score: number): Promise<void> => {
  try {
    const message = `🏗️ Check out my epic Stack Tower! Scored ${score.toLocaleString()} points! 🎯`;

    await Share.share({
      message,
      url: uri, // For iOS
      title: 'My Stack Tower Achievement!',
    });
  } catch (error) {
    console.error('Error sharing screenshot:', error);
    Alert.alert('Error', 'Failed to share screenshot. Please try again.');
  }
};

export const formatScoreForSharing = (score: number, mode: string, blocks: number): string => {
  const modeEmojis = {
    classic: '♾️',
    timeAttack: '⏱️',
    challenge: '🎯',
  };

  return `${modeEmojis[mode as keyof typeof modeEmojis] || '🏗️'} Stack Tower ${mode.charAt(0).toUpperCase() + mode.slice(1)}
    
🏆 Score: ${score.toLocaleString()}
📦 Blocks: ${blocks}
    
Think you can do better? 🤔`;
};