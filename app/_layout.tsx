import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform, View, StatusBar as RNStatusBar, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/GameContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { flushPendingWrites } from '@/utils/storage';

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
    <>
      {/* Cross-platform safe status bar background */}
      {Platform.OS === 'android' && (
        <View style={{ height: RNStatusBar.currentHeight, backgroundColor: 'transparent' }} />
      )}

      {/* SafeAreaView ensures proper layout for iOS notch */}
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* Status bar icons: dark by default */}
        <StatusBar style="dark" translucent={true} />

        <SoundProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </SoundProvider>
      </SafeAreaView>
    </>
  );
}
