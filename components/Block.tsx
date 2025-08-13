import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Block as BlockType } from '../types/game';
import { getBlockColors } from '../utils/gameLogic';
import {COLORS} from '../constants/game'
interface BlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
}

export const Block: React.FC<BlockProps> = ({ block, isDropping = false, themeId = 'default' }) => {
  const colorIndex = block.id === 'base' ? 0 : parseInt(block.id.split('-')[1] || '0') % COLORS.blocks.length;
  const [startColor, endColor] = getBlockColors(colorIndex, themeId);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = isDropping 
      ? withSpring(1.1, { damping: 10, stiffness: 300 })
      : withTiming(1, { duration: 200 });

    // Add special effects for different block types
    const opacity = block.type === 'slippery' ? 0.8 : 1;
    const borderWidth = block.type === 'heavy' ? 3 : 2;
    return {
      transform: [
        { translateX: withTiming(block.x, { duration: block.isMoving ? 0 : 300 }) },
        { translateY: withTiming(block.y, { duration: block.isMoving ? 0 : 300 }) },
        { scale },
      ],
      width: withTiming(block.width, { duration: 300 }),
      height: block.height,
      opacity,
    };
  });

  const gradientStyle = {
    ...styles.gradient,
    borderWidth: block.type === 'heavy' ? 3 : 2,
    borderColor: block.type === 'slippery' 
      ? 'rgba(255, 255, 255, 0.6)' 
      : block.type === 'heavy'
      ? 'rgba(255, 215, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.3)',
  };
  return (
    <Animated.View style={[styles.block, animatedStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={gradientStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});