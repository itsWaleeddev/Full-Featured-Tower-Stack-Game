import { Tabs } from 'expo-router';
import { Gamepad2, Store, Target, Trophy, Settings } from 'lucide-react-native';
import { View } from 'react-native';

function TabBarIcon({ Icon, color, size, focused }: any) {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        borderRadius: 12,
        backgroundColor: focused ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
      }}>
      <Icon size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stack Tower',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon Icon={Gamepad2} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon Icon={Target} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon Icon={Trophy} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon Icon={Store} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon Icon={Settings} size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
