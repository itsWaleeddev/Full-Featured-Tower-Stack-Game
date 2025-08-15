import React from 'react';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getBackgroundColors } from '../utils/gameLogic';

interface BackgroundProps {
  towerHeight: number;
  themeId?: string;
}

const BackgroundComponent: React.FC<BackgroundProps> = ({ towerHeight, themeId = 'default' }) => {
  const [startColor, endColor] = React.useMemo(() => getBackgroundColors(themeId), [themeId]);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [themeId]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

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

// Memoize background to prevent unnecessary re-renders
export const Background = memo(BackgroundComponent, (prevProps, nextProps) => {
  return prevProps.themeId === nextProps.themeId && prevProps.towerHeight === nextProps.towerHeight;
});
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
});