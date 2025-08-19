import { useSound } from '../contexts/SoundContext';

// Re-export the hook with the same interface for backward compatibility
export const useSoundManager = () => {
  return useSound();
};

export type { SoundType } from '../contexts/SoundContext';