import { Tabs } from 'expo-router';
import { Gamepad2, Store, Target, Trophy, Settings } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/GameContext'; // Update this path
import { THEMES } from '@/constants/game'; // Update this path

function TabBarIcon({ Icon, color, size, focused, theme }: any) {
  // Get theme-specific colors for the focused state
  const focusedBackgroundColor = theme.blockColors[0] ? 
    `${theme.blockColors[0][0]}20` : // Add transparency to first block color
    'rgba(102, 126, 234, 0.15)';

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        borderRadius: 12,
        backgroundColor: focused ? focusedBackgroundColor : 'transparent',
        // Add subtle glow effect for certain themes
        shadowColor: focused && (theme.id === 'neon' || theme.id === 'galaxy') ? color : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: focused && (theme.id === 'neon' || theme.id === 'galaxy') ? 4 : 0,
      }}>
      <Icon size={size} color={color} />
    </View>
  );
}

// Helper function to determine tab bar colors based on theme
function getThemeTabBarColors(theme: any) {
  const isDarkTheme = ['neon', 'volcanic', 'galaxy', 'forest'].includes(theme.id);
  const isLightTheme = ['arctic', 'diamond'].includes(theme.id);
  
  let backgroundColor, borderColor, activeTintColor, inactiveTintColor;

  switch (theme.id) {
    case 'neon':
      backgroundColor = '#0a0a15';
      borderColor = '#1a1a2e';
      activeTintColor = theme.blockColors[0][0]; // Use first neon color
      inactiveTintColor = '#4a4a6a';
      break;
    
    case 'ocean':
      backgroundColor = '#1a2a4a';
      borderColor = '#2a3a5a';
      activeTintColor = theme.blockColors[0][0];
      inactiveTintColor = '#6a7a9a';
      break;
    
    case 'sunset':
      backgroundColor = '#2a1a10';
      borderColor = '#4a3a30';
      activeTintColor = theme.blockColors[1][0]; // Use orange color
      inactiveTintColor = '#8a7a6a';
      break;
    
    case 'forest':
      backgroundColor = '#0f1a0f';
      borderColor = '#2a3a2a';
      activeTintColor = theme.blockColors[1][0];
      inactiveTintColor = '#5a6a5a';
      break;
    
    case 'volcanic':
      backgroundColor = '#1a0a0a';
      borderColor = '#3a1a1a';
      activeTintColor = theme.blockColors[0][0];
      inactiveTintColor = '#6a4a4a';
      break;
    
    case 'arctic':
      backgroundColor = '#f0f8ff';
      borderColor = '#d0e8f0';
      activeTintColor = theme.blockColors[4][0]; // Use blue tone
      inactiveTintColor = '#8aa0b0';
      break;
    
    case 'galaxy':
      backgroundColor = '#0a0a1a';
      borderColor = '#1a1a3a';
      activeTintColor = theme.blockColors[0][0];
      inactiveTintColor = '#5a5a7a';
      break;
    
    case 'rainbow':
      backgroundColor = '#2a2a2a';
      borderColor = '#4a4a4a';
      activeTintColor = theme.blockColors[0][1]; // Use blue from rainbow
      inactiveTintColor = '#8a8a8a';
      break;
    
    case 'golden':
      backgroundColor = '#2a2010';
      borderColor = '#4a4030';
      activeTintColor = theme.blockColors[0][0];
      inactiveTintColor = '#8a7050';
      break;
    
    case 'diamond':
      backgroundColor = '#ffffff';
      borderColor = '#e0e0e0';
      activeTintColor = theme.blockColors[1][0]; // Use light blue
      inactiveTintColor = '#a0a0a0';
      break;
    
    default: // classic theme
      backgroundColor = '#1a1a1a';
      borderColor = '#333';
      activeTintColor = '#FFEAA7';
      inactiveTintColor = '#666';
  }

  return {
    backgroundColor,
    borderColor,
    activeTintColor,
    inactiveTintColor
  };
}

export default function TabLayout() {
  const { themeState } = useTheme();
  const insets = useSafeAreaInsets();
  const currentTheme = THEMES.find(theme => theme.id === themeState.currentTheme) || THEMES[0];
  const themeColors = getThemeTabBarColors(currentTheme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.backgroundColor,
          borderTopColor: themeColors.borderColor,
          borderTopWidth: 1,
          // Add safe area bottom padding
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
          // Add subtle gradient effect for special themes
          ...(currentTheme.id === 'galaxy' && {
            shadowColor: themeColors.activeTintColor,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }),
          // Add special styling for diamond theme
          ...(currentTheme.id === 'diamond' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }),
        },
        tabBarActiveTintColor: themeColors.activeTintColor,
        tabBarInactiveTintColor: themeColors.inactiveTintColor,
        // Add label styling for better theme integration
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Game',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              Icon={Gamepad2} 
              size={size} 
              color={color} 
              focused={focused} 
              theme={currentTheme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              Icon={Target} 
              size={size} 
              color={color} 
              focused={focused} 
              theme={currentTheme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              Icon={Trophy} 
              size={size} 
              color={color} 
              focused={focused} 
              theme={currentTheme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              Icon={Store} 
              size={size} 
              color={color} 
              focused={focused} 
              theme={currentTheme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              Icon={Settings} 
              size={size} 
              color={color} 
              focused={focused} 
              theme={currentTheme}
            />
          ),
        }}
      />
    </Tabs>
  );
}