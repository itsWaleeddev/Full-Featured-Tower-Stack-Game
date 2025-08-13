import { useState, useEffect } from 'react';
import { getHighScore, saveHighScore } from '../utils/storage';

export const useHighScore = () => {
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    const score = await getHighScore();
    setHighScore(score);
  };

  const updateHighScore = async (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await saveHighScore(newScore);
    }
  };

  return {
    highScore,
    updateHighScore,
  };
};