import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import React from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, FeMorphology, FeColorMatrix } from 'react-native-svg';
import { Block as BlockType } from '../types/game';
import { getBlockColors } from '../utils/gameLogic';

interface BlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
}

// Facial expression types
const EXPRESSIONS = ['cute'] as const;
type Expression = typeof EXPRESSIONS[number];

// Helper function to get random expression based on block ID for consistency
const getExpressionForBlock = (blockId: string): Expression => {
  const hash = blockId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return EXPRESSIONS[hash % EXPRESSIONS.length];
};

// Optimized border color calculations with premium effects
const getOptimizedBorderColor = (blockType: BlockType['type'], themeId: string) => {
  if (blockType === 'slippery') {
    return 'rgba(255, 255, 255, 0.9)';
  } else if (blockType === 'heavy') {
    switch (themeId) {
      case 'golden': return 'rgba(255, 215, 0, 1)';
      case 'diamond': return 'rgba(255, 255, 255, 0.95)';
      default: return 'rgba(255, 215, 0, 0.9)';
    }
  } else {
    switch (themeId) {
      case 'neon': return 'rgba(0, 255, 255, 0.8)';
      case 'volcanic': return 'rgba(255, 69, 0, 0.7)';
      case 'arctic': return 'rgba(200, 230, 255, 0.8)';
      case 'galaxy': return 'rgba(147, 112, 219, 0.7)';
      case 'diamond': return 'rgba(220, 220, 220, 0.9)';
      case 'golden': return 'rgba(255, 215, 0, 0.8)';
      default: return 'rgba(255, 255, 255, 0.4)';
    }
  }
};

const getOptimizedBorderWidth = (blockType: BlockType['type'], themeId: string) => {
  if (blockType === 'heavy') return 3;
  if (themeId === 'diamond' || themeId === 'golden') return 2.5;
  return 2;
};

// Enhanced Kawaii Rectangle component with premium theme effects
const KawaiiRectangle: React.FC<{
  width: number;
  height: number;
  colors: [string, string];
  borderColor: string;
  borderWidth: number;
  themeId: string;
  blockType: BlockType['type'];
  expression: Expression;
  glowAnimation: Animated.SharedValue<number>;
}> = ({ width, height, colors, borderColor, borderWidth, themeId, blockType, expression, glowAnimation }) => {

  // Face element calculations
  const eyeSize = Math.min(width * 0.08, height * 0.12, 8);
  const eyeOffsetX = width * 0.28;
  const eyeY = height * 0.35;

  // Eyes positions
  const leftEyeX = width * 0.5 - eyeOffsetX;
  const rightEyeX = width * 0.5 + eyeOffsetX;

  // Mouth calculations
  const mouthY = height * 0.65;
  const mouthWidth = width * 0.25;
  const mouthX = (width - mouthWidth) / 2;

  // Blush calculations
  const blushSize = Math.min(width * 0.12, height * 0.08, 10);
  const blushY = height * 0.55;
  const leftBlushX = width * 0.15;
  const rightBlushX = width * 0.85;

  // Enhanced colors based on theme
  const eyeColor = useMemo(() => {
    switch (themeId) {
      case 'golden': return '#8B4513';
      case 'diamond': return '#4A4A4A';
      case 'neon': return '#000000';
      case 'arctic': return '#2F4F4F';
      case 'volcanic': return '#8B0000';
      case 'galaxy': return '#191970';
      default: return '#000000';
    }
  }, [themeId]);

  const blushColor = useMemo(() => {
    switch (themeId) {
      case 'neon': return '#ff1493';
      case 'volcanic': return '#ff6b6b';
      case 'golden': return '#ffa500';
      case 'galaxy': return '#dda0dd';
      case 'diamond': return '#ffb6c1';
      case 'arctic': return '#87ceeb';
      default: return '#ffb6c1';
    }
  }, [themeId]);

  const mouthColor = useMemo(() => {
    switch (themeId) {
      case 'neon':
        // Purple lips only for specific pink colors
        const isPinkBlock = colors[0] === '#ff0080' || colors[0] === '#ff0040';
        return isPinkBlock ? '#8000ff' : '#ff1493';
      case 'volcanic':
        // Use darker mouth color for better contrast on red block colors
        const isRedBlock = colors[0] === '#dc143c' || colors[0] === '#ff1493' ||
          colors[0] === '#b22222' || colors[0] === '#8b0000' ||
          colors[0] === '#ff0000';
        return isRedBlock ? '#4a0e0e' : '#dc143c';
      case 'golden': return '#b8860b';
      case 'galaxy': return '#4b0082';
      case 'diamond': return '#696969';
      case 'arctic': return '#4682b4';
      default: return '#333333';
    }
  }, [themeId, colors]);

  // Get eye elements with theme-specific enhancements
  const getEyeElements = () => {
    const baseEyes = (
      <>
        <Circle cx={leftEyeX} cy={eyeY} r={eyeSize} fill={eyeColor} />
        <Circle cx={rightEyeX} cy={eyeY} r={eyeSize} fill={eyeColor} />
        {/* Heart-shaped highlights */}
        <Path
          d={`M ${leftEyeX - eyeSize * 0.2} ${eyeY - eyeSize * 0.3} 
              C ${leftEyeX - eyeSize * 0.4} ${eyeY - eyeSize * 0.5} ${leftEyeX - eyeSize * 0.4} ${eyeY - eyeSize * 0.1} ${leftEyeX} ${eyeY - eyeSize * 0.1}
              C ${leftEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.1} ${leftEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.5} ${leftEyeX + eyeSize * 0.2} ${eyeY - eyeSize * 0.3} Z`}
          fill="white"
          opacity={themeId === 'diamond' ? 0.9 : 1}
        />
        <Path
          d={`M ${rightEyeX - eyeSize * 0.2} ${eyeY - eyeSize * 0.3} 
              C ${rightEyeX - eyeSize * 0.4} ${eyeY - eyeSize * 0.5} ${rightEyeX - eyeSize * 0.4} ${eyeY - eyeSize * 0.1} ${rightEyeX} ${eyeY - eyeSize * 0.1}
              C ${rightEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.1} ${rightEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.5} ${rightEyeX + eyeSize * 0.2} ${eyeY - eyeSize * 0.3} Z`}
          fill="white"
          opacity={themeId === 'diamond' ? 0.9 : 1}
        />
      </>
    );

    // Theme-specific eye enhancements
    switch (themeId) {
      case 'golden':
        return (
          <>
            {baseEyes}
            {/* Golden sparkles */}
            <Circle cx={leftEyeX + eyeSize * 0.6} cy={eyeY - eyeSize * 0.6} r={2} fill="#FFD700" opacity={0.8} />
            <Circle cx={rightEyeX + eyeSize * 0.6} cy={eyeY - eyeSize * 0.6} r={2} fill="#FFD700" opacity={0.8} />
            <Circle cx={leftEyeX - eyeSize * 0.5} cy={eyeY + eyeSize * 0.7} r={1.5} fill="#FFA500" opacity={0.6} />
            <Circle cx={rightEyeX + eyeSize * 0.5} cy={eyeY + eyeSize * 0.7} r={1.5} fill="#FFA500" opacity={0.6} />
          </>
        );

      case 'diamond':
        return (
          <>
            {baseEyes}
            {/* Diamond crystal sparkles */}
            <Path d={`M ${leftEyeX + eyeSize * 0.7} ${eyeY - eyeSize * 0.8} L ${leftEyeX + eyeSize * 0.9} ${eyeY - eyeSize * 0.6} L ${leftEyeX + eyeSize * 0.7} ${eyeY - eyeSize * 0.4} L ${leftEyeX + eyeSize * 0.5} ${eyeY - eyeSize * 0.6} Z`}
              fill="white" opacity={0.9} />
            <Path d={`M ${rightEyeX + eyeSize * 0.7} ${eyeY - eyeSize * 0.8} L ${rightEyeX + eyeSize * 0.9} ${eyeY - eyeSize * 0.6} L ${rightEyeX + eyeSize * 0.7} ${eyeY - eyeSize * 0.4} L ${rightEyeX + eyeSize * 0.5} ${eyeY - eyeSize * 0.6} Z`}
              fill="white" opacity={0.9} />
          </>
        );

      case 'neon':
        return (
          <>
            {baseEyes}
            {/* Neon glow effects */}
            <Circle cx={leftEyeX} cy={eyeY} r={eyeSize * 1.3} fill="none" stroke="#00FFFF" strokeWidth={1} opacity={0.6} />
            <Circle cx={rightEyeX} cy={eyeY} r={eyeSize * 1.3} fill="none" stroke="#00FFFF" strokeWidth={1} opacity={0.6} />
          </>
        );

      case 'arctic':
        return (
          <>
            {baseEyes}
            {/* Frost crystals */}
            <Path d={`M ${leftEyeX + eyeSize * 0.8} ${eyeY - eyeSize * 0.8} L ${leftEyeX + eyeSize * 0.6} ${eyeY - eyeSize * 0.4} M ${leftEyeX + eyeSize * 1.0} ${eyeY - eyeSize * 0.6} L ${leftEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.6}`}
              stroke="#B0E0E6" strokeWidth={1.5} opacity={0.7} />
            <Path d={`M ${rightEyeX + eyeSize * 0.8} ${eyeY - eyeSize * 0.8} L ${rightEyeX + eyeSize * 0.6} ${eyeY - eyeSize * 0.4} M ${rightEyeX + eyeSize * 1.0} ${eyeY - eyeSize * 0.6} L ${rightEyeX + eyeSize * 0.4} ${eyeY - eyeSize * 0.6}`}
              stroke="#B0E0E6" strokeWidth={1.5} opacity={0.7} />
          </>
        );

      default:
        return (
          <>
            {baseEyes}
            <Circle cx={leftEyeX + eyeSize * 0.6} cy={eyeY - eyeSize * 0.6} r={1.5} fill="white" />
            <Circle cx={rightEyeX + eyeSize * 0.6} cy={eyeY - eyeSize * 0.6} r={1.5} fill="white" />
          </>
        );
    }
  };

  const getMouthElement = () => {
    return (
      <Path
        d={`M ${mouthX + mouthWidth * 0.2} ${mouthY} Q ${mouthX + mouthWidth / 2} ${mouthY + 6} ${mouthX + mouthWidth * 0.8} ${mouthY}`}
        stroke={mouthColor}
        strokeWidth={themeId === 'diamond' ? 1.5 : 2}
        fill="none"
        strokeLinecap="round"
        opacity={themeId === 'diamond' ? 0.8 : 1}
      />
    );
  };

  // Premium background gradients
  const getPremiumBackground = () => {
    switch (themeId) {
      case 'golden':
        return (
          <Defs>
            <RadialGradient id="goldenGrad" cx="50%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity={0.9} />
              <Stop offset="30%" stopColor={colors[0]} stopOpacity={1} />
              <Stop offset="70%" stopColor={colors[1]} stopOpacity={1} />
              <Stop offset="100%" stopColor="#B8860B" stopOpacity={0.8} />
            </RadialGradient>
          </Defs>
        );

      case 'diamond':
        return (
          <Defs>
            <RadialGradient id="diamondGrad" cx="30%" cy="30%" r="80%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.9)" stopOpacity={1} />
              <Stop offset="40%" stopColor={colors[0]} stopOpacity={0.95} />
              <Stop offset="80%" stopColor={colors[1]} stopOpacity={1} />
              <Stop offset="100%" stopColor="rgba(200,200,200,0.8)" stopOpacity={1} />
            </RadialGradient>
          </Defs>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.rectangleContainer}>
      {/* Enhanced background gradient */}
      <LinearGradient
        colors={[colors[0], colors[1]]}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {getPremiumBackground()}

        {/* Premium background fill */}
        {(themeId === 'golden' || themeId === 'diamond') && (
          <Rect
            x={borderWidth}
            y={borderWidth}
            width={width - borderWidth * 2}
            height={height - borderWidth * 2}
            fill={themeId === 'golden' ? "url(#goldenGrad)" : "url(#diamondGrad)"}
            rx={6}
          />
        )}

        {/* Main rectangle border */}
        <Rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={width - borderWidth}
          height={height - borderWidth}
          fill="transparent"
          stroke={borderColor}
          strokeWidth={borderWidth}
          rx={8}
        />

        {/* Theme-specific premium effects */}
        {themeId === 'golden' && (
          <>
            {/* Golden brick lines */}
            <Path d={`M ${width * 0.1} ${height * 0.33} L ${width * 0.9} ${height * 0.33}`} stroke="rgba(184, 134, 11, 0.4)" strokeWidth={1} />
            <Path d={`M ${width * 0.1} ${height * 0.67} L ${width * 0.9} ${height * 0.67}`} stroke="rgba(184, 134, 11, 0.4)" strokeWidth={1} />
            <Path d={`M ${width * 0.33} ${height * 0.1} L ${width * 0.33} ${height * 0.33}`} stroke="rgba(184, 134, 11, 0.4)" strokeWidth={1} />
            <Path d={`M ${width * 0.67} ${height * 0.33} L ${width * 0.67} ${height * 0.9}`} stroke="rgba(184, 134, 11, 0.4)" strokeWidth={1} />

            {/* Golden glow inner border */}
            <Rect
              x={borderWidth * 2}
              y={borderWidth * 2}
              width={width - borderWidth * 4}
              height={height - borderWidth * 4}
              fill="none"
              stroke="rgba(255, 215, 0, 0.6)"
              strokeWidth={1}
              rx={4}
            />
          </>
        )}

        {themeId === 'diamond' && (
          <>
            {/* Enhanced diamond facet pattern */}
            <Path d={`M ${width * 0.5} ${borderWidth * 3} L ${width * 0.15} ${height * 0.5} L ${width * 0.5} ${height - borderWidth * 3} L ${width * 0.85} ${height * 0.5} Z`}
              fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1.5} />
            <Path d={`M ${width * 0.5} ${borderWidth * 3} L ${width * 0.85} ${height * 0.5}`} stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1} />
            <Path d={`M ${width * 0.5} ${height - borderWidth * 3} L ${width * 0.15} ${height * 0.5}`} stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1} />
            <Path d={`M ${width * 0.15} ${height * 0.5} L ${width * 0.85} ${height * 0.5}`} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1} />

            {/* Additional diamond sparkle lines */}
            <Path d={`M ${width * 0.3} ${height * 0.25} L ${width * 0.7} ${height * 0.75}`} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={0.8} />
            <Path d={`M ${width * 0.7} ${height * 0.25} L ${width * 0.3} ${height * 0.75}`} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={0.8} />

            {/* Crystal reflection spots */}
            <Circle cx={width * 0.35} cy={height * 0.35} r={2} fill="rgba(255, 255, 255, 0.6)" />
            <Circle cx={width * 0.65} cy={height * 0.65} r={1.5} fill="rgba(255, 255, 255, 0.5)" />
            <Circle cx={width * 0.25} cy={height * 0.6} r={1} fill="rgba(255, 255, 255, 0.4)" />
          </>
        )}

        {/* Neon theme - no inner lines, glow handled by outer shadow */}

        {themeId === 'arctic' && (
          <>
            {/* Snow crystal patterns */}
            <Circle cx={width * 0.8} cy={height * 0.2} r={3} fill="rgba(255, 255, 255, 0.4)" />
            <Circle cx={width * 0.2} cy={height * 0.8} r={2.5} fill="rgba(255, 255, 255, 0.3)" />
            <Path d={`M ${width * 0.75} ${height * 0.15} L ${width * 0.85} ${height * 0.25} M ${width * 0.85} ${height * 0.15} L ${width * 0.75} ${height * 0.25}`}
              stroke="rgba(255, 255, 255, 0.5)" strokeWidth={1} />
          </>
        )}

        {/* Eyes */}
        {getEyeElements()}

        {/* Mouth */}
        {getMouthElement()}

        {/* Enhanced blush circles */}
        <Circle
          cx={leftBlushX}
          cy={blushY}
          r={blushSize}
          fill={blushColor}
          opacity={themeId === 'diamond' ? 0.6 : 0.8}
        />
        <Circle
          cx={rightBlushX}
          cy={blushY}
          r={blushSize}
          fill={blushColor}
          opacity={themeId === 'diamond' ? 0.6 : 0.8}
        />

        {/* Block type specific effects */}
        {blockType === 'slippery' && (
          <>
            <Circle cx={width * 0.8} cy={height * 0.25} r={2} fill="rgba(135, 206, 235, 0.8)" />
            <Circle cx={width * 0.85} cy={height * 0.3} r={1.5} fill="rgba(135, 206, 235, 0.8)" />
            <Circle cx={width * 0.9} cy={height * 0.2} r={1} fill="rgba(135, 206, 235, 0.6)" />
          </>
        )}

        {blockType === 'heavy' && (
          <>
            <Path d={`M ${width * 0.05} ${height * 0.2} L ${width * 0.15} ${height * 0.15} L ${width * 0.1} ${height * 0.25} Z`}
              fill={borderColor} opacity={0.4} />
            <Path d={`M ${width * 0.9} ${height * 0.2} L ${width * 0.95} ${height * 0.15} L ${width * 0.85} ${height * 0.25} Z`}
              fill={borderColor} opacity={0.4} />
          </>
        )}
      </Svg>

      {/* Enhanced overlay effects */}
      {(themeId === 'diamond' || themeId === 'golden') && (
        <View style={[StyleSheet.absoluteFillObject, styles.shineOverlay, { borderRadius: 8 }]}>
          <LinearGradient
            colors={
              themeId === 'golden'
                ? ['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(255, 215, 0, 0.2)']
                : ['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(255, 255, 255, 0.2)']
            }
            style={[StyleSheet.absoluteFillObject, { borderRadius: 8 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}
    </View>
  );
};

const BlockComponent: React.FC<BlockProps> = ({
  block,
  isDropping = false,
  themeId = 'default'
}) => {
  const colorIndex = block.id === 'base' ? 0 : parseInt(block.id.split('-')[1] || '0') % 8;
  const [startColor, endColor] = getBlockColors(colorIndex, themeId);

  // Get consistent expression for this block
  const expression = useMemo(() => getExpressionForBlock(block.id), [block.id]);

  // Enhanced shared values for premium animations
  const translateX = useSharedValue(block.x);
  const translateY = useSharedValue(block.y);
  const blockWidth = useSharedValue(block.width);
  const blockScale = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  // Minimal glow animation - only for essential themes with reduced frequency
  React.useEffect(() => {
    if (themeId === 'neon' || themeId === 'diamond') {
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        true
      );
    } else {
      glowAnimation.value = 0.5; // Static glow for other premium themes
    }
  }, [themeId]);

  // Ultra-fast animation config - reduced complexity
  const ANIMATION_CONFIG = useMemo(() => ({
    duration: block.isMoving ? 0 : 120, // Faster transitions
    spring: { damping: 25, stiffness: 500, mass: 0.6 }, // Snappier spring
  }), [block.isMoving]);

  // Position updates
  React.useEffect(() => {
    if (block.isMoving) {
      translateX.value = block.x;
      translateY.value = block.y;
      blockWidth.value = block.width;
    } else {
      translateX.value = withTiming(block.x, { duration: ANIMATION_CONFIG.duration });
      translateY.value = withTiming(block.y, { duration: ANIMATION_CONFIG.duration });
      blockWidth.value = withTiming(block.width, { duration: ANIMATION_CONFIG.duration });
    }
  }, [block.x, block.y, block.width, block.isMoving, ANIMATION_CONFIG.duration]);

  // Faster drop animation with reduced duration
  React.useEffect(() => {
    if (isDropping) {
      blockScale.value = withSpring(1.03, { damping: 30, stiffness: 600, mass: 0.5 });

      const timer = setTimeout(() => {
        blockScale.value = withSpring(1, { damping: 30, stiffness: 600, mass: 0.5 });
      }, 80); // Reduced from 120ms

      return () => clearTimeout(timer);
    }
  }, [isDropping]);

  // Ultra-optimized animated style - minimal calculations
  const animatedStyle = useAnimatedStyle(() => {
    const baseOpacity = block.type === 'slippery' ? 0.88 : 1;

    // Only neon and diamond get dynamic effects for performance
    if (themeId === 'neon') {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: blockScale.value },
        ],
        width: blockWidth.value,
        height: block.height,
        opacity: baseOpacity,
        shadowOpacity: 0.6 + (glowAnimation.value * 0.4),
        shadowRadius: 15 + (glowAnimation.value * 5),
      };
    }

    if (themeId === 'diamond') {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: blockScale.value },
        ],
        width: blockWidth.value,
        height: block.height,
        opacity: baseOpacity,
        shadowOpacity: 0.4 + (glowAnimation.value * 0.3),
        shadowRadius: 12 + (glowAnimation.value * 4),
      };
    }

    // Static style for other themes - no glow calculations
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: blockScale.value },
      ],
      width: blockWidth.value,
      height: block.height,
      opacity: baseOpacity,
      shadowOpacity: 0.3,
      shadowRadius: 8,
    };
  }, [block.type, block.height, themeId]);

  // Enhanced style calculations
  const borderColor = useMemo(() => getOptimizedBorderColor(block.type, themeId), [block.type, themeId]);
  const borderWidth = useMemo(() => getOptimizedBorderWidth(block.type, themeId), [block.type, themeId]);

  // Enhanced shadow color with glow support for neon theme
  const shadowColor = useMemo(() => {
    switch (themeId) {
      case 'neon':
        // Use block color for glow effect
        return startColor;
      case 'volcanic': return '#ff4500';
      case 'golden': return '#ffd700';
      case 'galaxy': return '#9370db';
      case 'diamond': return '#ffffff';
      case 'arctic': return '#87ceeb';
      default: return '#000';
    }
  }, [themeId, startColor]);

  // Premium shadow configuration
  const dynamicShadowStyle = useMemo(() => ({
    shadowColor,
    shadowOffset: {
      width: 0,
      height: themeId === 'golden' ? 4 : 3,
    },
    elevation: ['golden', 'diamond'].includes(themeId) ? 8 : 6,
  }), [shadowColor, themeId]);

  return (
    <Animated.View style={[styles.block, animatedStyle, dynamicShadowStyle]}>
      <KawaiiRectangle
        width={block.width}
        height={block.height}
        colors={[startColor, endColor]}
        borderColor={borderColor}
        borderWidth={borderWidth}
        themeId={themeId}
        blockType={block.type}
        expression={expression}
        glowAnimation={glowAnimation}
      />
    </Animated.View>
  );
};

// Enhanced memoization
export const Block = memo(BlockComponent, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    Math.abs(prevProps.block.x - nextProps.block.x) < 0.5 &&
    Math.abs(prevProps.block.y - nextProps.block.y) < 0.5 &&
    Math.abs(prevProps.block.width - nextProps.block.width) < 0.5 &&
    prevProps.block.isMoving === nextProps.block.isMoving &&
    prevProps.block.type === nextProps.block.type &&
    prevProps.isDropping === nextProps.isDropping &&
    prevProps.themeId === nextProps.themeId
  );
});

// Enhanced styles
const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },
  rectangleContainer: {
    flex: 1,
    overflow: 'visible',
  },
  shineOverlay: {
    opacity: 0.6,
  },
});