import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveGameData, loadGameData } from '../utils/storage';

interface ThemeState {
  coins: number;
  currentTheme: string;
  unlockedThemes: string[];
}

interface ThemeContextType {
  themeState: ThemeState;
  spendCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockTheme: (themeId: string) => void;
  setCurrentTheme: (themeId: string) => void;
  updateThemeState: (newState: Partial<ThemeState>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeAction =
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'UNLOCK_THEME'; themeId: string }
  | { type: 'SET_CURRENT_THEME'; themeId: string }
  | { type: 'UPDATE_STATE'; newState: Partial<ThemeState> };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SPEND_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.amount) };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.amount };
    case 'UNLOCK_THEME':
      return {
        ...state,
        unlockedThemes: state.unlockedThemes.includes(action.themeId)
          ? state.unlockedThemes
          : [...state.unlockedThemes, action.themeId],
      };
    case 'SET_CURRENT_THEME':
      return { ...state, currentTheme: action.themeId };
    case 'UPDATE_STATE':
      return { ...state, ...action.newState };
    default:
      return state;
  }
};

const initialState: ThemeState = {
  coins: 0,
  currentTheme: 'default',
  unlockedThemes: ['default'],
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeState, dispatch] = useReducer(themeReducer, initialState);

  // Save theme data when state changes
  useEffect(() => {
    saveGameData({
      coins: themeState.coins,
      currentTheme: themeState.currentTheme,
      unlockedThemes: themeState.unlockedThemes,
      // Add other fields as needed to match your saveGameData interface
      unlockedSkins: [],
      dailyChallengeCompleted: false,
      lastDailyChallengeDate: '',
    });
  }, [themeState.coins, themeState.currentTheme, themeState.unlockedThemes]);

  const spendCoins = (amount: number) => {
    dispatch({ type: 'SPEND_COINS', amount });
  };

  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', amount });
  };

  const unlockTheme = (themeId: string) => {
    dispatch({ type: 'UNLOCK_THEME', themeId });
  };

  const setCurrentTheme = (themeId: string) => {
    dispatch({ type: 'SET_CURRENT_THEME', themeId });
  };

  const updateThemeState = (newState: Partial<ThemeState>) => {
    dispatch({ type: 'UPDATE_STATE', newState });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeState,
        spendCoins,
        addCoins,
        unlockTheme,
        setCurrentTheme,
        updateThemeState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};