import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getBackgroundColors } from '../utils/gameLogic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_ANDROID = Platform.OS === 'android';

interface BackgroundProps {
  towerHeight: number;
  themeId?: string;
}

// Reduced particle counts for better performance
const MAX_PARTICLES = IS_ANDROID ? 12 : 25;

// Optimized particle creation with better distribution
const createParticles = (themeId: string) => {
  return Array.from({ length: MAX_PARTICLES }, (_, i) => ({
    id: i,
    x: (i * SCREEN_WIDTH / MAX_PARTICLES) + Math.random() * (SCREEN_WIDTH / MAX_PARTICLES),
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 2 + 1.5,
    speed: Math.random() * 1.5 + 0.8,
    opacity: Math.random() * 0.6 + 0.3,
    delay: i * 0.1,
    active: shouldParticleBeActive(i, themeId),
  }));
};

const shouldParticleBeActive = (index: number, themeId: string): boolean => {
  let activeCount = 0;
  switch (themeId) {
    case 'galaxy':
      activeCount = IS_ANDROID ? 12 : 25;
      break;
    case 'arctic':
      activeCount = IS_ANDROID ? 8 : 18;
      break;
    case 'neon':
      activeCount = IS_ANDROID ? 6 : 15;
      break;
    default:
      activeCount = 0;
  }
  return index < activeCount;
};

// Enhanced Cute Cartoon Sun component like the original - performance optimized
const CuteSun: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  // Original sun rays - optimized from 16 to 12 for performance
  const sunRays = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30), // 30 degrees apart for 12 rays
    length: 25 + (i % 2 === 0 ? 10 : 5), // Alternating lengths for more organic look
    width: 6, // Uniform width for simplicity
  })), []);

  const sunCenterX = SCREEN_WIDTH * 0.50; // Moved to right side
  const sunCenterY = SCREEN_HEIGHT * 0.40;

  // Main sun animation - gentle bobbing (original behavior)
  const sunAnimatedStyle = useAnimatedStyle(() => {
    const bobbing = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [0, -8, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [1, 1.05, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: bobbing }, { scale }],
      opacity: isVisible ? 1 : 0,
    };
  }, [isVisible]);

  // Sun rays animation - gentle rotation (original behavior)
  const raysAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      animationValue.value,
      [0, 1],
      [0, 15], // Gentle rotation
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity: isVisible ? 1 : 0,
    };
  }, [isVisible]);

  // Face animation - blinking effect (original behavior)
  const faceAnimatedStyle = useAnimatedStyle(() => {
    const eyeScale = interpolate(
      animationValue.value,
      [0, 0.1, 0.2, 0.9, 1],
      [1, 0.2, 1, 1, 0.2], // Occasional blink
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scaleY: eyeScale }],
      opacity: isVisible ? 1 : 0,
    };
  }, [isVisible]);

  return (
    <>
      {/* Sun rays */}
      <Animated.View
        style={[
          styles.cuteSunRaysContainer,
          {
            left: sunCenterX,
            top: sunCenterY
          },
          raysAnimatedStyle
        ]}
      >
        {sunRays.map((ray) => {
          const rayStyle = {
            position: 'absolute' as const,
            width: ray.width,
            height: ray.length,
            backgroundColor: '#FFA500',
            borderRadius: ray.width / 2,
            transformOrigin: 'center bottom' as const,
            transform: [
              { rotate: `${ray.angle}deg` },
              { translateY: -60 }, // Position rays outside the sun body
            ],
          };

          return (
            <Animated.View
              key={ray.id}
              style={rayStyle}
            />
          );
        })}
      </Animated.View>

      {/* Main sun body */}
      <Animated.View style={[styles.cuteSunBody, sunAnimatedStyle]}>
        {/* Sun face */}
        <Animated.View style={[styles.cuteSunFace, faceAnimatedStyle]}>
          {/* Eyes */}
          <View style={styles.cuteSunEye} />
          <View style={[styles.cuteSunEye, { marginLeft: 20 }]} />
        </Animated.View>

        {/* Mouth */}
        <View style={styles.cuteSunMouth} />

        {/* Cheeks */}
        <View style={styles.cuteSunCheek} />
        <View style={[styles.cuteSunCheek, styles.cuteSunCheekRight]} />
      </Animated.View>
    </>
  );
});

// Simplified particle component
const Particle: React.FC<{
  particle: any;
  themeId: string;
  animationValue: Animated.SharedValue<number>;
}> = memo(({ particle, themeId, animationValue }) => {
  const particleStyle = useMemo(() => {
    switch (themeId) {
      case 'galaxy':
        return {
          width: particle.size,
          height: particle.size,
          backgroundColor: '#ffffff',
          borderRadius: particle.size / 2,
          shadowColor: '#ffffff',
          shadowOpacity: 0.6,
          shadowRadius: 1,
        };
      case 'arctic':
        return {
          width: particle.size + 1,
          height: particle.size + 1,
          backgroundColor: '#ffffff',
          borderRadius: (particle.size + 1) / 2,
          opacity: 0.8,
        };
      case 'neon':
        const neonColors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000'];
        return {
          width: particle.size,
          height: particle.size,
          backgroundColor: neonColors[particle.id % neonColors.length],
          borderRadius: particle.size / 2,
          shadowColor: neonColors[particle.id % neonColors.length],
          shadowOpacity: 0.6,
          shadowRadius: 2,
        };
      default:
        return {
          width: particle.size,
          height: particle.size,
          backgroundColor: '#ffffff50',
          borderRadius: particle.size / 2,
        };
    }
  }, [themeId, particle.size, particle.id]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animationValue.value,
      [0, 1],
      [0, -SCREEN_HEIGHT - 50],
      Extrapolate.CLAMP
    );

    // Use particle.active to control visibility instead of conditional rendering
    const opacity = interpolate(
      animationValue.value,
      [0, 0.2, 0.8, 1],
      [0, particle.active ? particle.opacity : 0, particle.active ? particle.opacity : 0, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY: translateY + particle.y },
        { translateX: particle.x },
      ],
      opacity,
    };
  }, [particle.active, particle.opacity, particle.x, particle.y]);

  return (
    <Animated.View
      style={[
        styles.particle,
        particleStyle,
        animatedStyle,
      ]}
    />
  );
});

// Enhanced Rainbow arc component - original design, performance optimized
const RainbowArc: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  // Original 7 rainbow layers - keeping all colors for beauty
  const rainbowLayers = useMemo(() => [
    { color: '#ff0000', radius: 0.8, opacity: 0.9 },    // Red - outermost
    { color: '#ff7f00', radius: 0.72, opacity: 0.85 },   // Orange
    { color: '#ffff00', radius: 0.64, opacity: 0.8 },    // Yellow
    { color: '#00ff00', radius: 0.56, opacity: 0.75 },   // Green
    { color: '#0080ff', radius: 0.48, opacity: 0.7 },    // Blue
    { color: '#4b0082', radius: 0.4, opacity: 0.65 },    // Indigo
    { color: '#9400d3', radius: 0.32, opacity: 0.6 },    // Violet - innermost
  ], []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [0, 0.3, 0.7, 1],
      [0.6, 1.0, 1.0, 0.6],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [0.95, 1.08, 0.95],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [5, -10, 5],
      Extrapolate.CLAMP
    );
    return {
      opacity: isVisible ? opacity : 0,
      transform: [{ scale }, { translateY }],
    };
  }, [isVisible]);

  return (
    <Animated.View style={[styles.rainbowContainer, animatedStyle]}>
      {rainbowLayers.map((layer, index) => {
        // Individual layer animations - simplified for performance
        const layerAnimatedStyle = useAnimatedStyle(() => {
          const layerOpacity = interpolate(
            animationValue.value,
            [0, 0.2, 0.8, 1],
            [layer.opacity * 0.7, layer.opacity, layer.opacity, layer.opacity * 0.7],
            Extrapolate.CLAMP
          );
          // Simplified shimmer effect - less complex interpolation
          const shimmer = interpolate(
            animationValue.value,
            [0, 0.5, 1],
            [1, 1.05, 1],
            Extrapolate.CLAMP
          );
          return {
            opacity: layerOpacity,
            transform: [{ scaleX: shimmer }],
          };
        }, [layer.opacity]);

        return (
          <Animated.View
            key={index}
            style={[
              styles.rainbowLayer,
              {
                width: SCREEN_WIDTH * 0.9 * layer.radius,
                height: SCREEN_WIDTH * 0.45 * layer.radius,
                borderRadius: SCREEN_WIDTH * 0.45 * layer.radius,
                backgroundColor: layer.color,
                shadowColor: layer.color,
                shadowOpacity: 0.6,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              },
              layerAnimatedStyle,
            ]}
          />
        );
      })}
    </Animated.View>
  );
});

// Simplified ocean waves
const OceanWaves: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const waves = useMemo(() => Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    baseHeight: 150 + i * 80,
    maxHeight: SCREEN_HEIGHT * 0.7,
  })), []);

  return (
    <>
      {waves.map((wave) => {
        const animatedStyle = useAnimatedStyle(() => {
          const progress = (animationValue.value + wave.delay) % 1;
          const translateY = interpolate(
            progress,
            [0, 1],
            [SCREEN_HEIGHT + 50, -wave.maxHeight],
            Extrapolate.CLAMP
          );
          const height = interpolate(
            progress,
            [0, 0.3, 0.7, 1],
            [wave.baseHeight, wave.baseHeight * 1.4, wave.maxHeight, wave.maxHeight * 1.1],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            progress,
            [0, 0.2, 0.8, 1],
            [0, 0.4, 0.6, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateY }],
            height,
            opacity: isVisible ? opacity : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View
            key={wave.id}
            style={[
              styles.oceanWave,
              {
                backgroundColor: `rgba(116, 185, 255, ${0.3 + wave.id * 0.1})`,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </>
  );
});

// Simplified snowflakes
const Snowflakes: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const snowflakes = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (i * SCREEN_WIDTH / 8) + Math.random() * (SCREEN_WIDTH / 8),
    size: Math.random() * 3 + 2,
    speed: Math.random() * 0.4 + 0.6,
  })), []);

  return (
    <>
      {snowflakes.map((flake) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [-30, SCREEN_HEIGHT + 30],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.2, 0.8, 1],
            [0, 0.8, 0.8, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY: translateY * flake.speed },
              { translateX: flake.x },
            ],
            opacity: isVisible ? opacity : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View
            key={flake.id}
            style={[
              styles.snowflake,
              {
                width: flake.size,
                height: flake.size,
                borderRadius: flake.size / 2,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </>
  );
});

// Simplified trees
const Trees: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const trees = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: (i * SCREEN_WIDTH) / 3.5
  })), []);

  return (
    <>
      {trees.map((tree) => {
        const animatedStyle = useAnimatedStyle(() => {
          const sway = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [-3, 0, 3],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateX: sway + tree.x },
              { rotate: `${sway * 0.3}deg` }
            ],
            opacity: isVisible ? 1 : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View
            key={tree.id}
            style={[styles.tree, animatedStyle]}
          />
        );
      })}
    </>
  );
});

// Simplified fires
const RealisticFires: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const fires = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    size: Math.random() * 20 + 15,
    delay: Math.random(),
    speed: Math.random() * 0.3 + 0.7,
  })), []);

  return (
    <>
      {fires.map((fire) => {
        const animatedStyle = useAnimatedStyle(() => {
          const progress = (animationValue.value * fire.speed + fire.delay) % 1;
          const translateY = interpolate(
            progress,
            [0, 1],
            [SCREEN_HEIGHT + 30, -80],
            Extrapolate.CLAMP
          );

          const scaleY = interpolate(
            progress,
            [0, 0.3, 0.7, 1],
            [0.4, 1.2, 1.0, 0.3],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            progress,
            [0, 0.2, 0.8, 1],
            [0, 0.8, 0.7, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY },
              { translateX: fire.x },
              { scaleY },
            ],
            opacity: isVisible ? opacity : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View key={fire.id} style={[animatedStyle]}>
            <View style={[styles.fireFlame, {
              width: fire.size,
              height: fire.size * 1.6,
            }]}>
              <View style={[styles.fireInner, {
                width: fire.size * 0.6,
                height: fire.size * 1.2,
              }]} />
            </View>
          </Animated.View>
        );
      })}
    </>
  );
});

// Simplified neon streams
const NeonStreams: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const streams = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: (i * SCREEN_WIDTH) / 3,
    color: ['#ff0080', '#00ff80', '#8000ff', '#ff8000'][i],
  })), []);

  return (
    <>
      {streams.map((stream) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [-80, SCREEN_HEIGHT + 80],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.3, 0.7, 1],
            [0, 0.7, 0.7, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateY }],
            opacity: isVisible ? opacity : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View
            key={stream.id}
            style={[
              styles.neonStream,
              {
                left: stream.x,
                backgroundColor: stream.color,
                shadowColor: stream.color,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </>
  );
});

// Simplified floating circles
const FloatingCircles: React.FC<{
  animationValue: Animated.SharedValue<number>;
  isVisible: boolean;
}> = memo(({ animationValue, isVisible }) => {
  const circles = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 25 + 15,
    delay: i * 0.3,
  })), []);

  return (
    <>
      {circles.map((circle) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [0, Math.sin(animationValue.value * Math.PI + circle.delay) * 40],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.5, 1],
            [0.3, 0.5, 0.3],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY: translateY + circle.y },
              { translateX: circle.x },
            ],
            opacity: isVisible ? opacity : 0,
          };
        }, [isVisible]);

        return (
          <Animated.View
            key={circle.id}
            style={[
              styles.floatingCircle,
              {
                width: circle.size,
                height: circle.size,
                borderRadius: circle.size / 2,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </>
  );
});

const BackgroundComponent: React.FC<BackgroundProps> = ({ towerHeight, themeId = 'default' }) => {
  // ✅ ALL HOOKS MUST BE AT THE VERY TOP - NO EARLY RETURNS OR CONDITIONS BEFORE THIS POINT

  // 1. useMemo hook - ALWAYS called first
  const [startColor, endColor] = useMemo(() => getBackgroundColors(themeId), [themeId]);
  
  // 2. useSharedValue hooks - ALWAYS called, no conditions whatsoever
  const opacity = useSharedValue(1);
  const animationValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const waveValue = useSharedValue(0);

  // 3. useMemo hook - ALWAYS called with FIXED particle count
  const particles = useMemo(() => createParticles(themeId), [themeId]);

  // 4. useAnimatedStyle hooks - ALL MUST BE CALLED UNCONDITIONALLY
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), []);

  const galaxyStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }],
    opacity: themeId === 'galaxy' ? 0.2 : 0,
  }), [themeId]);

  const neonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'neon' ? 0.3 : 0,
  }), [themeId]);

  const volcanicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'volcanic' ? 0.4 : 0,
  }), [themeId]);

  const oceanStyle = useAnimatedStyle(() => {
    const wave1 = interpolate(
      waveValue.value,
      [0, 0.5, 1],
      [0, 15, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: wave1 }],
      opacity: themeId === 'ocean' ? 0.25 : 0,
    };
  }, [themeId]);

  const sunsetStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value * 0.3}deg` }],
    opacity: themeId === 'sunset' ? 0.3 : 0,
  }), [themeId]);

  const forestStyle = useAnimatedStyle(() => {
    const sway = interpolate(
      waveValue.value,
      [-1, 0, 1],
      [-3, 0, 3],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX: sway }],
      opacity: themeId === 'forest' ? 0.25 : 0,
    };
  }, [themeId]);

  const rainbowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }],
    opacity: themeId === 'rainbow' ? 0.4 : 0,
  }), [themeId]);

  const goldenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'golden' ? 0.3 : 0,
  }), [themeId]);

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'diamond' ? 0.25 : 0,
  }), [themeId]);

  // 5. useEffect hooks - MUST BE CALLED UNCONDITIONALLY
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [themeId, opacity]);

  useEffect(() => {
    // Cancel all animations to prevent conflicts
    cancelAnimation(animationValue);
    cancelAnimation(rotationValue);
    cancelAnimation(pulseValue);
    cancelAnimation(waveValue);

    // Reset values to prevent animation conflicts
    animationValue.value = 0;
    rotationValue.value = 0;
    pulseValue.value = 1;
    waveValue.value = 0;

    // Optimized animation timings with safer durations
    const baseDuration = IS_ANDROID ? 1.3 : 1.0;
    
    switch (themeId) {
      case 'galaxy':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(6000 * baseDuration) }),
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: Math.floor(15000 * baseDuration) }),
          -1,
          false
        );
        break;
      case 'arctic':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(3000 * baseDuration) }),
          -1,
          false
        );
        break;
      case 'neon':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(2500 * baseDuration) }),
          -1,
          false
        );
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: Math.floor(800 * baseDuration) }),
            withTiming(0.92, { duration: Math.floor(800 * baseDuration) })
          ),
          -1,
          true
        );
        break;
      case 'volcanic':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(2000 * baseDuration) }),
          -1,
          false
        );
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: Math.floor(1200 * baseDuration) }),
            withTiming(0.95, { duration: Math.floor(1200 * baseDuration) })
          ),
          -1,
          true
        );
        break;
      case 'ocean':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(4500 * baseDuration) }),
          -1,
          false
        );
        waveValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(6000 * baseDuration) }),
          -1,
          false
        );
        break;
      case 'sunset':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(4000 * baseDuration) }),
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: Math.floor(16000 * baseDuration) }),
          -1,
          false
        );
        break;
      case 'forest':
        animationValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: Math.floor(2500 * baseDuration) }),
            withTiming(-1, { duration: Math.floor(2500 * baseDuration) })
          ),
          -1,
          true
        );
        waveValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: Math.floor(2500 * baseDuration) }),
            withTiming(-1, { duration: Math.floor(2500 * baseDuration) })
          ),
          -1,
          true
        );
        break;
      case 'rainbow':
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(4000 * baseDuration) }),
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: Math.floor(6000 * baseDuration) }),
          -1,
          false
        );
        break;
      case 'golden':
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(1.04, { duration: Math.floor(1800 * baseDuration) }),
            withTiming(0.96, { duration: Math.floor(1800 * baseDuration) })
          ),
          -1,
          true
        );
        break;
      case 'diamond':
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: Math.floor(1500 * baseDuration) }),
            withTiming(0.97, { duration: Math.floor(1500 * baseDuration) })
          ),
          -1,
          true
        );
        break;
      default:
        animationValue.value = withRepeat(
          withTiming(1, { duration: Math.floor(6000 * baseDuration) }),
          -1,
          false
        );
    }
  }, [themeId, animationValue, rotationValue, pulseValue, waveValue]);

  // ✅ ALL HOOKS DECLARED ABOVE THIS LINE - CONDITIONAL LOGIC STARTS HERE
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Theme-specific animations - ALWAYS render but control visibility through props */}
      <RainbowArc animationValue={animationValue} isVisible={themeId === 'rainbow'} />
      <OceanWaves animationValue={animationValue} isVisible={themeId === 'ocean'} />
      <Snowflakes animationValue={animationValue} isVisible={themeId === 'arctic'} />
      <CuteSun animationValue={animationValue} isVisible={themeId === 'sunset'} />
      <Trees animationValue={waveValue} isVisible={themeId === 'forest'} />
      <RealisticFires animationValue={animationValue} isVisible={themeId === 'volcanic'} />
      <NeonStreams animationValue={animationValue} isVisible={themeId === 'neon'} />
      <FloatingCircles animationValue={animationValue} isVisible={themeId === 'default'} />

      {/* Fixed particle count - ALWAYS render MAX_PARTICLES regardless of theme */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          particle={particle}
          themeId={themeId}
          animationValue={animationValue}
        />
      ))}

      {/* Simplified theme-specific elements - always render but control visibility */}
      <Animated.View style={[styles.galaxyNebula, galaxyStyle]} />
      <Animated.View style={[styles.neonGlow, neonStyle]} />
      <Animated.View style={[styles.volcanicEmbers, volcanicStyle]} />
      <Animated.View style={[styles.oceanWaves, oceanStyle]} />
      <Animated.View style={[styles.sunRays, sunsetStyle]} />
      <Animated.View style={[styles.forestLeaves, forestStyle]} />
      <Animated.View style={[styles.rainbowArcs, rainbowStyle]} />
      <Animated.View style={[styles.goldenSparkles, goldenStyle]} />
      <Animated.View style={[styles.diamondCrystals, diamondStyle]} />
    </Animated.View>
  );
};

// Memoize background with optimized comparison
export const Background = memo(BackgroundComponent, (prevProps, nextProps) => {
  return prevProps.themeId === nextProps.themeId && 
         Math.abs(prevProps.towerHeight - nextProps.towerHeight) < 10;
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
  },
  // Optimized rainbow styles - back to original positioning
  rainbowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    top: SCREEN_HEIGHT * 0.46,
    left: SCREEN_WIDTH * 0.5,
    transform: [{ translateX: -(SCREEN_WIDTH * 0.45) / 2 }], // Center horizontally for smaller rainbow
  },
  rainbowLayer: {
    position: 'absolute',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  // Ocean waves
  oceanWave: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    left: 0,
    bottom: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  // Arctic snowflakes
  snowflake: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
  // Enhanced Realistic Sun Styles - back to original
  cuteSunRaysContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    transform: [{ translateX: -70 }, { translateY: -70 }],
  },
  cuteSunBody: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#FFD700',
    borderRadius: 60,
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.35, // Moved to right with margin
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    marginRight: 10,
    marginTop: 10
  },
  cuteSunFace: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
  },
  cuteSunEye: {
    width: 8,
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  cuteSunMouth: {
    width: 30,
    height: 15,
    borderColor: '#333333',
    borderWidth: 2,
    borderTopWidth: 0,
    borderRadius: 15,
    marginTop: 5,
  },
  cuteSunCheek: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#FFB347',
    borderRadius: 6,
    top: 45,
    left: 20,
  },
  cuteSunCheekRight: {
    left: 88,
  },
  // Forest trees
  tree: {
    position: 'absolute',
    width: 12,
    height: 60,
    backgroundColor: '#2d5016',
    borderRadius: 6,
    bottom: SCREEN_HEIGHT * 0.5,
  },
  // Optimized fire flames
  fireFlame: {
    position: 'absolute',
    borderRadius: 40,
    backgroundColor: '#ff4500',
    shadowColor: '#ff4500',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireInner: {
    position: 'absolute',
    backgroundColor: '#ff8c00',
    borderRadius: 30,
    shadowColor: '#ff8c00',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  // Neon streams
  neonStream: {
    position: 'absolute',
    width: 2,
    height: 150,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  // Floating circles
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Simplified original theme elements
  galaxyNebula: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 1.5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9c27b030',
    borderRadius: SCREEN_WIDTH * 0.75,
    top: -SCREEN_HEIGHT * 0.25,
    left: -SCREEN_WIDTH * 0.25,
  },
  neonGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ff0080',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    borderRadius: 15,
  },
  volcanicEmbers: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ff4500',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  oceanWaves: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    height: 80,
    backgroundColor: 'rgba(116, 185, 255, 0.15)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sunRays: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: SCREEN_WIDTH * 0.6,
    top: -SCREEN_WIDTH * 0.4,
    left: -SCREEN_WIDTH * 0.1,
  },
  forestLeaves: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(34, 139, 34, 0.08)',
  },
  rainbowArcs: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: SCREEN_WIDTH * 0.75,
    top: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.25,
  },
  goldenSparkles: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ffd700',
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
  diamondCrystals: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
});