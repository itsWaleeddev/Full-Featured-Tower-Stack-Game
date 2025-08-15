import React from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Block as BlockType } from '../types/game';
import { getBlockColors } from '../utils/gameLogic';

interface BlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
}

// Memoized style calculations for better performance
const getOptimizedBorderColor = (blockType: BlockType['type'], themeId: string) => {
  if (blockType === 'slippery') {
    return 'rgba(255, 255, 255, 0.6)'; // Slightly reduced opacity for subtler effect
  } else if (blockType === 'heavy') {
    return themeId === 'golden' || themeId === 'diamond' 
      ? 'rgba(255, 215, 0, 0.9)' 
      : 'rgba(255, 215, 0, 0.8)';
  } else {
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

const getOptimizedBorderWidth = (blockType: BlockType['type']) => {
  return blockType === 'heavy' ? 3 : 2;
};

const getOptimizedShadowColor = (themeId: string) => {
  switch (themeId) {
    case 'neon': return '#00ffff';
    case 'volcanic': return '#ff4500';
    case 'golden': return '#ffd700';
    case 'galaxy': return '#9370db';
    default: return '#000';
  }
};

// Pre-calculated shadow styles for performance
const shadowStyles = {
  neon: { shadowOpacity: 0.4, shadowRadius: 8 },
  volcanic: { shadowOpacity: 0.3, shadowRadius: 8 },
  golden: { shadowOpacity: 0.4, shadowRadius: 8 },
  galaxy: { shadowOpacity: 0.3, shadowRadius: 12 },
  diamond: { shadowOpacity: 0.3, shadowRadius: 8 },
  default: { shadowOpacity: 0.3, shadowRadius: 8 },
};

const BlockComponent: React.FC<BlockProps> = ({ 
  block, 
  isDropping = false, 
  themeId = 'default' 
}) => {
  const colorIndex = block.id === 'base' ? 0 : parseInt(block.id.split('-')[1] || '0') % 8;
  const [startColor, endColor] = getBlockColors(colorIndex, themeId);

  // Use shared values with optimized precision for better performance
  const translateX = useSharedValue(block.x);
  const translateY = useSharedValue(block.y);
  const blockWidth = useSharedValue(block.width);
  const blockScale = useSharedValue(1);

  // IMPROVED animation parameters to reduce slippery effect
  const ANIMATION_CONFIG = useMemo(() => ({
    // Reduced duration for faster, less slippery transitions
    duration: block.isMoving ? 0 : 120, // Reduced from 150ms for snappier placement
    // More controlled spring with higher damping to reduce bouncy/slippery feel
    spring: { 
      damping: 22, // Increased from 18 for less bouncy effect
      stiffness: 500, // Increased from 450 for faster settling
      mass: 0.7 // Reduced from 0.8 for lighter, less slippery feel
    },
  }), [block.isMoving]);

  // Ultra-fast position updates with improved transition handling
  React.useEffect(() => {
    if (block.isMoving) {
      // Immediate updates for moving blocks for ultra-smooth movement
      translateX.value = block.x;
      translateY.value = block.y;
      blockWidth.value = block.width;
    } else {
      // IMPROVED: Use easing for smoother, less slippery transitions
      const easingConfig = {
        duration: ANIMATION_CONFIG.duration,
        easing: Easing.out(Easing.quad), // Gentler easing for less jarring effect
      };
      
      translateX.value = withTiming(block.x, easingConfig);
      translateY.value = withTiming(block.y, easingConfig);
      blockWidth.value = withTiming(block.width, easingConfig);
    }
  }, [block.x, block.y, block.width, block.isMoving, ANIMATION_CONFIG.duration]);

  // REDUCED drop animation effect to minimize slippery appearance
  React.useEffect(() => {
    if (isDropping) {
      // Much subtler scale effect to reduce slippery/bouncy feeling
      blockScale.value = withSpring(1.015, { // Reduced from 1.03 for subtler effect
        damping: 25, // Higher damping for quicker settling
        stiffness: 600, // Higher stiffness for faster response
        mass: 0.6, // Lower mass for lighter feel
      }); 
      
      // Shorter duration for quicker return to normal
      const timer = setTimeout(() => {
        blockScale.value = withSpring(1, {
          damping: 25,
          stiffness: 600,
          mass: 0.6,
        });
      }, 80); // Reduced from 120ms for faster effect
      
      return () => clearTimeout(timer);
    }
  }, [isDropping]);

  // Ultra-optimized animated style with minimal calculations
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: blockScale.value },
      ],
      width: blockWidth.value,
      height: block.height,
      // IMPROVED: Slightly higher opacity for slippery blocks to reduce the slippery visual effect
      opacity: block.type === 'slippery' ? 0.92 : 1, // Increased from 0.88 for better visibility
    };
  }, [block.type, block.height]);

  // Memoized style objects for better performance
  const borderColor = useMemo(() => getOptimizedBorderColor(block.type, themeId), [block.type, themeId]);
  const borderWidth = useMemo(() => getOptimizedBorderWidth(block.type), [block.type]);
  const shadowColor = useMemo(() => getOptimizedShadowColor(themeId), [themeId]);
  const shadowConfig = useMemo(() => shadowStyles[themeId as keyof typeof shadowStyles] || shadowStyles.default, [themeId]);

  // Pre-calculated gradient style
  const gradientStyle = useMemo(() => ({
    ...styles.gradient,
    borderWidth,
    borderColor,
  }), [borderWidth, borderColor]);

  // Pre-calculated dynamic shadow styles with reduced intensity for slippery blocks
  const dynamicShadowStyle = useMemo(() => {
    const baseStyle = {
      shadowColor,
      ...shadowConfig,
    };
    
    // Reduce shadow intensity for slippery blocks to minimize visual slippery effect
    if (block.type === 'slippery') {
      return {
        ...baseStyle,
        shadowOpacity: baseStyle.shadowOpacity * 0.8, // Reduced shadow for subtler effect
        shadowRadius: baseStyle.shadowRadius * 0.9,
      };
    }
    
    return baseStyle;
  }, [shadowColor, shadowConfig, block.type]);

  // Determine if special overlay is needed
  const needsSpecialOverlay = useMemo(() => 
    themeId === 'diamond' || themeId === 'golden'
  , [themeId]);

  return (
    <Animated.View style={[styles.block, animatedStyle, dynamicShadowStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={gradientStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Conditionally render special effect overlay only when needed */}
      {needsSpecialOverlay && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'transparent', 'rgba(255, 255, 255, 0.1)']}
          style={styles.shineOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* REDUCED: Less prominent slippery effect overlay */}
      {block.type === 'slippery' && (
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.15)', // Reduced from 0.25 for subtler effect
            'rgba(255, 255, 255, 0.05)', // Reduced from 0.1
            'rgba(255, 255, 255, 0.08)', // Reduced from 0.15
          ]}
          style={styles.slipperyOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </Animated.View>
  );
};

// Enhanced memoization with more specific prop comparison for better performance
export const Block = memo(BlockComponent, (prevProps, nextProps) => {
  // Only re-render if essential properties change
  // Slightly tighter tolerance for position changes to reduce unnecessary re-renders
  return (
    prevProps.block.id === nextProps.block.id &&
    Math.abs(prevProps.block.x - nextProps.block.x) < 0.3 && // Tighter tolerance for smoother animation
    Math.abs(prevProps.block.y - nextProps.block.y) < 0.3 &&
    Math.abs(prevProps.block.width - nextProps.block.width) < 0.3 &&
    prevProps.block.isMoving === nextProps.block.isMoving &&
    prevProps.block.type === nextProps.block.type &&
    prevProps.isDropping === nextProps.isDropping &&
    prevProps.themeId === nextProps.themeId
  );
});

// Optimized styles with reduced complexity and improved slippery effect handling
const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },
  gradient: {
    flex: 1,
    borderRadius: 6,
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    opacity: 0.4, // Slightly reduced for subtler effect
  },
  slipperyOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    opacity: 0.6, // Controlled opacity for subtle slippery indication without being overpowering
  },
});