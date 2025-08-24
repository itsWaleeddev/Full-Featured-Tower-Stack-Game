import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform, View, StatusBar as RNStatusBar, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/GameContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { flushPendingWrites } from '@/utils/storage';
import { THEMES } from '@/constants/game'; // Import your themes

// Theme-aware status bar component
function ThemedStatusBar() {
  const { themeState } = useTheme();

  // Find the current theme
  const currentTheme = THEMES.find(theme => theme.id === themeState.currentTheme);
  const backgroundColors = currentTheme?.backgroundColors || ['#667eea', '#764ba2'];

  // Determine if the theme is light or dark based on the first background color
  const isLightTheme = (color: string): boolean => {
    // Convert hex to RGB and calculate luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6; // Threshold for light vs dark
  };

  const statusBarStyle = isLightTheme(backgroundColors[0]) ? 'dark' : 'light';

  return (
    <>
      {/* Android status bar background with theme gradient */}
      {Platform.OS === 'android' && (
        <LinearGradient
          colors={[backgroundColors[0], backgroundColors[1]]}
          style={{
            height: RNStatusBar.currentHeight,
            opacity: 0.8 // Slight transparency for better readability
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* iOS status bar background overlay */}
      {Platform.OS === 'ios' && (
        <LinearGradient
          colors={[backgroundColors[0], 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 50, // Covers the status bar area
            opacity: 0.3,
            zIndex: -1
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}

      {/* Status bar with dynamic styling */}
      <StatusBar
        style={statusBarStyle}
        translucent={true}
        {...(Platform.OS === 'android' ? {} : { backgroundColor: 'transparent' })}
      />
    </>
  );
}

// Wrapper component for themed layout
function ThemedLayoutContent() {
  const { themeState } = useTheme();
  const currentTheme = THEMES.find(theme => theme.id === themeState.currentTheme);
  const backgroundColors = currentTheme?.backgroundColors || ['#667eea', '#764ba2'];

  return (
    <>
      <ThemedStatusBar />

      {/* Background gradient for the entire app */}
      <LinearGradient
        colors={[backgroundColors[0], backgroundColors[1]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05 // Very subtle background tint
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        flushPendingWrites().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SoundProvider>
        <ThemeProvider>
          <ThemedLayoutContent />
        </ThemeProvider>
      </SoundProvider>
    </SafeAreaView>
  );
}