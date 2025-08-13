import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getBackgroundColors } from '../utils/gameLogic';

interface BackgroundProps {
  towerHeight: number;
  themeId?: string;
}

export const Background: React.FC<BackgroundProps> = ({ towerHeight, themeId = 'default' }) => {
  const [startColor, endColor] = getBackgroundColors(themeId);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 500 }),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
});