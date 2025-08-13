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
interface BlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
}

export const Block: React.FC<BlockProps> = ({ 
  block, 
  isDropping = false, 
  themeId = 'default' 
}) => {
  const colorIndex = block.id === 'base' ? 0 : parseInt(block.id.split('-')[1] || '0') % 8;
  const [startColor, endColor] = getBlockColors(colorIndex, themeId);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = isDropping 
      ? withSpring(1.1, { damping: 10, stiffness: 300 })
      : withTiming(1, { duration: 200 });

    // Enhanced visual effects for different block types
    const opacity = block.type === 'slippery' ? 0.85 : 1;
    
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

  // Enhanced border effects based on block type and theme
  const getBorderColor = () => {
    if (block.type === 'slippery') {
      return 'rgba(255, 255, 255, 0.7)';
    } else if (block.type === 'heavy') {
      return themeId === 'golden' || themeId === 'diamond' 
        ? 'rgba(255, 215, 0, 0.9)' 
        : 'rgba(255, 215, 0, 0.8)';
    } else {
      // Theme-appropriate border colors
      switch (themeId) {
        case 'neon': return 'rgba(0, 255, 255, 0.4)';
        case 'volcanic': return 'rgba(255, 69, 0, 0.4)';
        case 'arctic': return 'rgba(135, 206, 235, 0.4)';
        case 'galaxy': return 'rgba(147, 112, 219, 0.4)';
        case 'diamond': return 'rgba(192, 192, 192, 0.6)';
        default: return 'rgba(255, 255, 255, 0.3)';
      }
    }
  };

  const getBorderWidth = () => {
    return block.type === 'heavy' ? 3 : 2;
  };

  const gradientStyle = {
    ...styles.gradient,
    borderWidth: getBorderWidth(),
    borderColor: getBorderColor(),
  };

  // Add special shadow effects for premium themes
  const getShadowColor = () => {
    switch (themeId) {
      case 'neon': return '#00ffff';
      case 'volcanic': return '#ff4500';
      case 'golden': return '#ffd700';
      case 'galaxy': return '#9370db';
      default: return '#000';
    }
  };

  const dynamicStyles = {
    shadowColor: getShadowColor(),
    shadowOpacity: themeId === 'neon' || themeId === 'golden' ? 0.4 : 0.3,
    shadowRadius: themeId === 'galaxy' ? 12 : 8,
  };

  return (
    <Animated.View style={[styles.block, animatedStyle, dynamicStyles]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={gradientStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Special effect overlay for premium themes */}
      {(themeId === 'diamond' || themeId === 'golden') && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(255, 255, 255, 0.2)']}
          style={styles.shineOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
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
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    opacity: 0.6,
  },
});