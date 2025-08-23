import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SoundType =
  | 'click'
  | 'chime'
  | 'success'
  | 'failed'
  | 'purchase'
  | 'button'
  | 'drop';

interface SoundMap {
  [key: string]: Audio.Sound;
}

interface SoundState {
  soundEnabled: boolean;
  isLoading: boolean;
  volume: number;
}

interface SoundContextType {
  soundState: SoundState;
  playSound: (soundType: SoundType, volume?: number) => Promise<void>;
  stopSound: (soundType: SoundType) => Promise<void>;
  stopAllSounds: () => Promise<void>;
  setVolume: (soundType: SoundType, volume: number) => Promise<void>;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  isLoading: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_FILES: Record<SoundType, any> = {
  click: require('../assets/sounds/click.mp3'),
  chime: require('../assets/sounds/chime.mp3'),
  success: require('../assets/sounds/success.mp3'),
  failed: require('../assets/sounds/failed.mp3'),
  purchase: require('../assets/sounds/purchase.mp3'),
  button: require('../assets/sounds/button.mp3'),
  drop: require('../assets/sounds/drop.mp3'),
};

const SOUND_SETTINGS_KEY = '@stack_tower_sound_settings';

type SoundAction =
  | { type: 'SET_SOUND_ENABLED'; enabled: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_VOLUME'; volume: number };

const soundReducer = (state: SoundState, action: SoundAction): SoundState => {
  switch (action.type) {
    case 'SET_SOUND_ENABLED':
      return { ...state, soundEnabled: action.enabled };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume };
    default:
      return state;
  }
};

const initialState: SoundState = {
  soundEnabled: true,
  isLoading: true,
  volume: 0.7,
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundState, dispatch] = useReducer(soundReducer, initialState);
  const soundsRef = useRef<SoundMap>({});
  const isInitializedRef = useRef(false);
  const soundEnabledRef = useRef(initialState.soundEnabled);


  // Keep ref in sync with reducer
  useEffect(() => {
    soundEnabledRef.current = soundState.soundEnabled;
  }, [soundState.soundEnabled]);

  // Load sound settings from storage
  useEffect(() => {
    const loadSoundSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
        if (savedSettings !== null) {
          const enabled = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SOUND_ENABLED', enabled });
        }
      } catch (error) {
        console.warn('Failed to load sound settings:', error);
      }
    };

    loadSoundSettings();
  }, []);

  // Save sound settings when changed
  useEffect(() => {
    const saveSoundSettings = async () => {
      try {
        await AsyncStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(soundState.soundEnabled));
      } catch (error) {
        console.warn('Failed to save sound settings:', error);
      }
    };

    saveSoundSettings();
  }, [soundState.soundEnabled]);

  // Load all sounds on mount
  // Load all sounds on mount - FIXED VERSION
  useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      if (isInitializedRef.current) return;

      try {
        // Set audio mode for better performance
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const soundPromises = Object.entries(SOUND_FILES).map(async ([key, source]) => {
          try {
            const { sound } = await Audio.Sound.createAsync(
              source,
              {
                shouldPlay: false,
                volume: 0.7, // ✅ Use fixed initial volume
                rate: 1.0,
                shouldCorrectPitch: true,
              }
            );

            if (isMounted) {
              soundsRef.current[key as SoundType] = sound;
            }
          } catch (error) {
            console.warn(`Failed to load sound ${key}:`, error);
          }
        });

        await Promise.all(soundPromises);

        if (isMounted) {
          dispatch({ type: 'SET_LOADING', loading: false });
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.warn('Failed to setup audio mode:', error);
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', loading: false });
        }
      }
    };

    loadSounds();

    return () => {
      isMounted = false;
    };
  }, []); // ✅ Remove soundState.volume dependency - only run once on mount

  // ✅ Add separate effect to update volume of already loaded sounds
  useEffect(() => {
    const updateSoundVolumes = async () => {
      if (!isInitializedRef.current) return;

      const volumePromises = Object.values(soundsRef.current).map(async (sound) => {
        try {
          await sound.setVolumeAsync(soundState.volume);
        } catch (error) {
          console.warn('Failed to update sound volume:', error);
        }
      });

      await Promise.allSettled(volumePromises);
    };

    updateSoundVolumes();
  }, [soundState.volume]); // ✅ Separate effect for volume changes

  // Handle app state changes to manage audio properly
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Stop all sounds when app goes to background
        Object.values(soundsRef.current).forEach(async (sound) => {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await sound.stopAsync();
            }
          } catch (error) {
            // Ignore errors when stopping sounds
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach(async (sound) => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, []);

  const playSound = async (soundType: SoundType, volume: number = soundState.volume, force: boolean = false) => {
    if ((!soundEnabledRef.current && !force) || soundState.isLoading || !isInitializedRef.current) return;

    const sound = soundsRef.current[soundType];
    if (!sound) {
      console.warn(`Sound ${soundType} not found`);
      return;
    }

    try {
      // Get current status
      const status = await sound.getStatusAsync();

      if (!status.isLoaded) {
        console.warn(`Sound ${soundType} not loaded`);
        return;
      }

      // Always stop and rewind for consistent playback
      if (status.isPlaying) {
        await sound.stopAsync();
      }
      await sound.setPositionAsync(0);

      // Set volume and play
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  };

  const stopSound = async (soundType: SoundType) => {
    const sound = soundsRef.current[soundType];
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.warn(`Failed to stop sound ${soundType}:`, error);
    }
  };

  const stopAllSounds = async () => {
    const stopPromises = Object.values(soundsRef.current).map(async (sound) => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.stopAsync();
        }
      } catch (error) {
        // Ignore individual stop errors
      }
    });

    await Promise.allSettled(stopPromises);
  };

  const setVolume = async (soundType: SoundType, volume: number) => {
    const sound = soundsRef.current[soundType];
    if (!sound) return;

    try {
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.warn(`Failed to set volume for ${soundType}:`, error);
    }
  };

  const toggleSound = () => {
    const newEnabled = !soundState.soundEnabled;

    // Immediately stop all sounds if disabling
    if (!newEnabled) {
      stopAllSounds();
    }

    dispatch({ type: 'SET_SOUND_ENABLED', enabled: newEnabled });

    if (newEnabled) {
      playSound('button', 0.7, true);
    }
  };

  const setSoundEnabled = (enabled: boolean) => {
    if (!enabled) {
      stopAllSounds();
    }
    dispatch({ type: 'SET_SOUND_ENABLED', enabled });

    // if (enabled) {
    //   playSound('button', 0.7, true);
    // }

  };

  return (
    <SoundContext.Provider
      value={{
        soundState,
        playSound,
        stopSound,
        stopAllSounds,
        setVolume,
        toggleSound,
        setSoundEnabled,
        soundEnabled: soundState.soundEnabled,
        isLoading: soundState.isLoading,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};