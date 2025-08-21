import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Platform } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { getBackgroundColors } from '../utils/gameLogic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_ANDROID = Platform.OS === 'android';

interface BackgroundProps {
  towerHeight: number;
  themeId?: string;
}

// Optimized particle system for different themes
const createParticles = (count: number, themeId: string) => {
  // Android optimization: Reduce particle count
  const adjustedCount = IS_ANDROID ? Math.floor(count * 0.6) : count;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 1,
    opacity: Math.random() * 0.8 + 0.2,
    delay: Math.random() * 2000,
  }));
};

// Enhanced Cute Cartoon Sun component like the image
const CuteSun: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  // Create simple sun rays - fewer rays, more cartoon-like
  const sunRays = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i * 22.5), // 22.5 degrees apart for 16 rays
    length: 25 + (i % 2 === 0 ? 10 : 5), // Alternating lengths for more organic look
    width: 6, // Uniform width for simplicity
  })), []);

  const sunCenterX = SCREEN_WIDTH * 0.50; // Moved to right side
  const sunCenterY = SCREEN_HEIGHT * 0.40;

  // Main sun animation - gentle bobbing
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
    };
  }, []);

  // Sun rays animation - gentle rotation
  const raysAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      animationValue.value,
      [0, 1],
      [0, 15], // Gentle rotation
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  }, []);

  // Face animation - blinking effect
  const faceAnimatedStyle = useAnimatedStyle(() => {
    const eyeScale = interpolate(
      animationValue.value,
      [0, 0.1, 0.2, 0.9, 1],
      [1, 0.2, 1, 1, 0.2], // Occasional blink
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scaleY: eyeScale }],
    };
  }, []);

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

// Individual particle component for better performance
const Particle: React.FC<{
  particle: any;
  themeId: string;
  animationValue: Animated.SharedValue<number>;
}> = memo(({ particle, themeId, animationValue }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animationValue.value,
      [0, 1],
      [0, -SCREEN_HEIGHT - 100],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      animationValue.value,
      [0, 1],
      [0, Math.sin(animationValue.value * Math.PI * 2) * 20],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      animationValue.value,
      [0, 0.1, 0.9, 1],
      [0, particle.opacity, particle.opacity, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY: translateY + particle.y },
        { translateX: translateX + particle.x },
      ],
      opacity,
    };
  }, [particle.opacity, particle.x, particle.y]);

  const getParticleStyle = useMemo(() => {
    switch (themeId) {
      case 'galaxy':
        return {
          width: particle.size,
          height: particle.size,
          backgroundColor: '#ffffff',
          borderRadius: particle.size / 2,
          shadowColor: '#ffffff',
          shadowOpacity: 0.8,
          shadowRadius: 2,
        };
      case 'arctic':
        return {
          width: particle.size + 2,
          height: particle.size + 2,
          backgroundColor: '#ffffff',
          borderRadius: (particle.size + 2) / 2,
          opacity: 0.9,
        };
      case 'neon':
        const neonColors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000'];
        return {
          width: particle.size,
          height: particle.size,
          backgroundColor: neonColors[particle.id % neonColors.length],
          borderRadius: particle.size / 2,
          shadowColor: neonColors[particle.id % neonColors.length],
          shadowOpacity: 0.8,
          shadowRadius: 3,
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

  return (
    <Animated.View
      style={[
        styles.particle,
        getParticleStyle,
        animatedStyle,
      ]}
    />
  );
});

// Enhanced Rainbow arc component - smaller, more beautiful and animated
const RainbowArc: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
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
      opacity,
      transform: [{ scale }, { translateY }],
    };
  }, []);

  return (
    <Animated.View style={[styles.rainbowContainer, animatedStyle]}>
      {rainbowLayers.map((layer, index) => {
        const layerAnimatedStyle = useAnimatedStyle(() => {
          const layerOpacity = interpolate(
            animationValue.value,
            [0, 0.2, 0.8, 1],
            [layer.opacity * 0.7, layer.opacity, layer.opacity, layer.opacity * 0.7],
            Extrapolate.CLAMP
          );
          const shimmer = interpolate(
            animationValue.value,
            [0, 0.25, 0.5, 0.75, 1],
            [1, 1.1, 1, 1.05, 1],
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

// Ocean waves component - taller and slower water flow
const OceanWaves: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  const waves = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    baseHeight: 200 + i * 120,
    maxHeight: SCREEN_HEIGHT * 0.85 // Almost full screen height
  }));

  return (
    <>
      {waves.map((wave) => {
        const animatedStyle = useAnimatedStyle(() => {
          const progress = (animationValue.value + wave.delay) % 1;
          const translateY = interpolate(
            progress,
            [0, 1],
            [SCREEN_HEIGHT + 100, -wave.maxHeight],
            Extrapolate.CLAMP
          );
          const height = interpolate(
            progress,
            [0, 0.2, 0.5, 0.8, 1],
            [wave.baseHeight, wave.baseHeight * 1.3, wave.baseHeight * 1.8, wave.maxHeight, wave.maxHeight * 1.1],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            progress,
            [0, 0.15, 0.85, 1],
            [0, 0.3, 0.5, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateY }],
            height,
            opacity,
          };
        });

        return (
          <Animated.View
            key={wave.id}
            style={[
              styles.oceanWave,
              {
                backgroundColor: `rgba(116, 185, 255, ${0.25 + wave.id * 0.08})`,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </>
  );
});

// Snowflakes component
const Snowflakes: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  // Always create snowflakes array - moved outside to avoid conditional hooks
  const snowflakes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    size: Math.random() * 4 + 2,
    speed: Math.random() * 0.5 + 0.5,
  }));

  return (
    <>
      {snowflakes.map((flake) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [-50, SCREEN_HEIGHT + 50],
            Extrapolate.CLAMP
          );
          const translateX = interpolate(
            animationValue.value,
            [0, 1],
            [0, Math.sin(animationValue.value * Math.PI * 4) * 30],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.1, 0.9, 1],
            [0, 0.8, 0.8, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY: translateY * flake.speed },
              { translateX: translateX + flake.x },
            ],
            opacity,
          };
        });

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

// Trees component
const Trees: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  const trees = Array.from({ length: 5 }, (_, i) => ({ id: i, x: (i * SCREEN_WIDTH) / 4.2 }));

  return (
    <>
      {trees.map((tree) => {
        const animatedStyle = useAnimatedStyle(() => {
          const sway = interpolate(
            animationValue.value,
            [0, 0.5, 1],
            [-5, 5, -5],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateX: sway + tree.x }, { rotate: `${sway * 0.5}deg` }],
          };
        });

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

// Realistic fire flames component
const RealisticFires: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  // Always create fires array - moved outside to avoid conditional hooks
  const fires = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    size: Math.random() * 25 + 20,
    delay: Math.random(),
    speed: Math.random() * 0.3 + 0.7,
  }));

  return (
    <>
      {fires.map((fire) => {
        const animatedStyle = useAnimatedStyle(() => {
          const progress = (animationValue.value * fire.speed + fire.delay) % 1;
          const translateY = interpolate(
            progress,
            [0, 1],
            [SCREEN_HEIGHT + 50, -100],
            Extrapolate.CLAMP
          );

          // Flame-like flickering motion
          const flickerX = interpolate(
            progress,
            [0, 0.25, 0.5, 0.75, 1],
            [0, -8, 5, -3, 0],
            Extrapolate.CLAMP
          );

          const scaleX = interpolate(
            progress,
            [0, 0.3, 0.7, 1],
            [0.6, 1.2, 0.9, 0.4],
            Extrapolate.CLAMP
          );

          const scaleY = interpolate(
            progress,
            [0, 0.2, 0.8, 1],
            [0.3, 1.4, 1.1, 0.2],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            progress,
            [0, 0.1, 0.9, 1],
            [0, 0.9, 0.8, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY },
              { translateX: fire.x + flickerX },
              { scaleX },
              { scaleY },
            ],
            opacity,
          };
        });

        return (
          <Animated.View key={fire.id} style={[animatedStyle]}>
            {/* Fire flame shape using nested views */}
            <Animated.View style={[styles.fireFlame, {
              width: fire.size,
              height: fire.size * 1.8,
            }]}>
              {/* Inner flame */}
              <Animated.View style={[styles.fireInner, {
                width: fire.size * 0.6,
                height: fire.size * 1.4,
              }]} />
              {/* Core flame */}
              <Animated.View style={[styles.fireCore, {
                width: fire.size * 0.3,
                height: fire.size * 1.0,
              }]} />
            </Animated.View>
          </Animated.View>
        );
      })}
    </>
  );
});

// Neon streams component
const NeonStreams: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  // Always create streams array - moved outside to avoid conditional hooks
  const streams = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: (i * SCREEN_WIDTH) / 5,
    color: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040'][i],
  }));

  return (
    <>
      {streams.map((stream) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [-100, SCREEN_HEIGHT + 100],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.2, 0.8, 1],
            [0, 0.7, 0.7, 0],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateY }],
            opacity,
          };
        });

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

// Classic floating circles component
const FloatingCircles: React.FC<{ animationValue: Animated.SharedValue<number> }> = memo(({ animationValue }) => {
  // Always create circles array - moved outside to avoid conditional hooks
  const circles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 30 + 20,
    delay: i * 0.2,
  }));

  return (
    <>
      {circles.map((circle) => {
        const animatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            animationValue.value,
            [0, 1],
            [0, Math.sin(animationValue.value * Math.PI + circle.delay) * 50],
            Extrapolate.CLAMP
          );
          const translateX = interpolate(
            animationValue.value,
            [0, 1],
            [0, Math.cos(animationValue.value * Math.PI + circle.delay) * 30],
            Extrapolate.CLAMP
          );
          const opacity = interpolate(
            animationValue.value,
            [0, 0.5, 1],
            [0.2, 0.4, 0.2],
            Extrapolate.CLAMP
          );

          return {
            transform: [
              { translateY: translateY + circle.y },
              { translateX: translateX + circle.x },
            ],
            opacity,
          };
        });

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
  const [startColor, endColor] = useMemo(() => getBackgroundColors(themeId), [themeId]);
  const opacity = useSharedValue(1);

  // Always create all animation values regardless of theme
  const animationValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const waveValue = useSharedValue(0);

  const particles = useMemo(() => {
    // Android optimization: Significantly reduce particles
    let particleCount = themeId === 'galaxy' ? 50 : themeId === 'arctic' ? 30 : 20;
    if (IS_ANDROID) {
      particleCount = Math.floor(particleCount * 0.4); // 60% reduction for Android
    }
    return createParticles(particleCount, themeId);
  }, [themeId]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [themeId]);

  useEffect(() => {
    // Cancel all previous animations
    cancelAnimation(animationValue);
    cancelAnimation(rotationValue);
    cancelAnimation(pulseValue);
    cancelAnimation(waveValue);

    // Reset all values
    animationValue.value = 0;
    rotationValue.value = 0;
    pulseValue.value = 1;
    waveValue.value = 0;

    // Start animations based on theme - optimized timing for performance
    switch (themeId) {
      case 'galaxy':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 10000 : 8000 }), // Slower on Android
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: IS_ANDROID ? 25000 : 20000 }),
          -1,
          false
        );
        break;
      case 'arctic':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 5000 : 4000 }),
          -1,
          false
        );
        break;
      case 'neon':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 4000 : 3000 }),
          -1,
          false
        );
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(IS_ANDROID ? 1.1 : 1.2, { duration: IS_ANDROID ? 1200 : 1000 }),
            withTiming(IS_ANDROID ? 0.9 : 0.8, { duration: IS_ANDROID ? 1200 : 1000 })
          ),
          -1,
          true
        );
        break;
      case 'volcanic':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 3000 : 2500 }),
          -1,
          false
        );
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(IS_ANDROID ? 1.05 : 1.1, { duration: IS_ANDROID ? 1800 : 1500 }),
            withTiming(IS_ANDROID ? 0.95 : 0.9, { duration: IS_ANDROID ? 1800 : 1500 })
          ),
          -1,
          true
        );
        break;
      case 'ocean':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 7000 : 6000 }),
          -1,
          false
        );
        waveValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 9000 : 8000 }),
          -1,
          false
        );
        break;
      case 'sunset':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 7000 : 6000 }),
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: IS_ANDROID ? 24000 : 20000 }),
          -1,
          false
        );
        break;
      case 'forest':
        animationValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: IS_ANDROID ? 3500 : 3000 }),
            withTiming(-1, { duration: IS_ANDROID ? 3500 : 3000 })
          ),
          -1,
          true
        );
        waveValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: IS_ANDROID ? 3500 : 3000 }),
            withTiming(-1, { duration: IS_ANDROID ? 3500 : 3000 })
          ),
          -1,
          true
        );
        break;
      case 'rainbow':
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 6000 : 5000 }),
          -1,
          false
        );
        rotationValue.value = withRepeat(
          withTiming(360, { duration: IS_ANDROID ? 10000 : 8000 }),
          -1,
          false
        );
        break;
      case 'golden':
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(IS_ANDROID ? 1.05 : 1.1, { duration: IS_ANDROID ? 2500 : 2000 }),
            withTiming(IS_ANDROID ? 0.95 : 0.9, { duration: IS_ANDROID ? 2500 : 2000 })
          ),
          -1,
          true
        );
        break;
      case 'diamond':
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(IS_ANDROID ? 1.03 : 1.05, { duration: IS_ANDROID ? 1800 : 1500 }),
            withTiming(IS_ANDROID ? 0.97 : 0.95, { duration: IS_ANDROID ? 1800 : 1500 })
          ),
          -1,
          true
        );
        break;
      default:
        animationValue.value = withRepeat(
          withTiming(1, { duration: IS_ANDROID ? 9000 : 8000 }),
          -1,
          false
        );
    }
  }, [themeId]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), []);

  // Always create all animated styles regardless of theme
  const galaxyStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }],
    opacity: themeId === 'galaxy' ? 0.3 : 0,
  }));

  const neonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'neon' ? 0.4 : 0,
  }));

  const volcanicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'volcanic' ? 0.6 : 0,
  }));

  const oceanStyle = useAnimatedStyle(() => {
    const wave1 = interpolate(
      waveValue.value,
      [0, 0.5, 1],
      [0, 20, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: wave1 }],
      opacity: themeId === 'ocean' ? 0.3 : 0,
    };
  });

  const sunsetStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value * 0.5}deg` }],
    opacity: themeId === 'sunset' ? 0.4 : 0,
  }));

  const forestStyle = useAnimatedStyle(() => {
    const sway = interpolate(
      waveValue.value,
      [-1, 0, 1],
      [-5, 0, 5],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX: sway }],
      opacity: themeId === 'forest' ? 0.3 : 0,
    };
  });

  const rainbowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }],
    opacity: themeId === 'rainbow' ? 0.5 : 0,
  }));

  const goldenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'golden' ? 0.4 : 0,
  }));

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: themeId === 'diamond' ? 0.3 : 0,
  }));

  // Render particles only for themes that need them
  // Android optimization: Reduce particle themes
  const shouldShowParticles = IS_ANDROID 
    ? ['galaxy'].includes(themeId) // Only galaxy particles on Android
    : ['galaxy', 'arctic', 'neon'].includes(themeId);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Theme-specific animations */}
      {themeId === 'rainbow' && <RainbowArc animationValue={animationValue} />}
      {themeId === 'ocean' && <OceanWaves animationValue={animationValue} />}
      {themeId === 'arctic' && <Snowflakes animationValue={animationValue} />}
      {themeId === 'sunset' && <CuteSun animationValue={animationValue} />}
      {themeId === 'forest' && <Trees animationValue={waveValue} />}
      {themeId === 'volcanic' && <RealisticFires animationValue={animationValue} />}
      {themeId === 'neon' && <NeonStreams animationValue={animationValue} />}
      {themeId === 'default' && <FloatingCircles animationValue={animationValue} />}

      {/* Particles */}
      {shouldShowParticles && particles.map((particle) => (
        <Particle
          key={particle.id}
          particle={particle}
          themeId={themeId}
          animationValue={animationValue}
        />
      ))}

      {/* Original theme-specific elements */}
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
  particle: {
    position: 'absolute',
  },
  // Enhanced Rainbow layers - smaller and more beautiful
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
  // Ocean waves - taller
  oceanWave: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    left: 0,
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // Arctic snowflakes
  snowflake: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    opacity: 0.8,
  },
  // Enhanced Realistic Sun Styles
  sunRaysContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  sunRay: {
    position: 'absolute',
    backgroundColor: '#ffed4e',
    transformOrigin: 'center',
    shadowColor: '#ffd700',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  sunOuterGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#ffb347',
    borderRadius: 100,
    top: SCREEN_HEIGHT * 0.05,
    left: SCREEN_WIDTH * 0.1,
    opacity: 0.3,
    shadowColor: '#ffb347',
    shadowOpacity: 0.8,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  sunBody: {
    position: 'absolute',
    width: 140,
    height: 140,
    backgroundColor: '#ffd700',
    borderRadius: 70,
    top: SCREEN_HEIGHT * 0.08,
    left: SCREEN_WIDTH * 0.13,
    shadowColor: '#ffd700',
    shadowOpacity: 1,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  sunHighlight: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#ffed4e',
    borderRadius: 50,
    top: SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.15,
    opacity: 0.9,
    shadowColor: '#ffed4e',
    shadowOpacity: 0.9,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  sunCore: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#ffff99',
    borderRadius: 30,
    top: SCREEN_HEIGHT * 0.12,
    left: SCREEN_WIDTH * 0.17,
    opacity: 0.8,
    shadowColor: '#ffff99',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  // Forest trees
  tree: {
    position: 'absolute',
    width: 15,
    height: 80,
    backgroundColor:'#2d5016',
    //backgroundColor: '#2d5016',
    borderRadius: 7,
    bottom: SCREEN_HEIGHT * 0.46,
  },
  // Realistic fire flames
  fireFlame: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#ff4500',
    shadowColor: '#ff4500',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireInner: {
    position: 'absolute',
    backgroundColor: '#ff8c00',
    borderRadius: 40,
    shadowColor: '#ff8c00',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  fireCore: {
    position: 'absolute',
    backgroundColor: '#ffff00',
    borderRadius: 30,
    shadowColor: '#ffff00',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  // Neon streams
  neonStream: {
    position: 'absolute',
    width: 3,
    height: 200,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  // Classic floating circles
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  // Original styles
  galaxyNebula: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9c27b040',
    borderRadius: SCREEN_WIDTH,
    top: -SCREEN_HEIGHT / 2,
    left: -SCREEN_WIDTH / 2,
  },
  neonGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ff0080',
    shadowOpacity: 0.3,
    shadowRadius: 50,
    borderRadius: 20,
  },
  volcanicEmbers: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ff4500',
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  oceanWaves: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    height: 100,
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  sunRays: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: SCREEN_WIDTH * 0.75,
    top: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.25,
  },
  forestLeaves: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(34, 139, 34, 0.1)',
  },
  rainbowArcs: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_WIDTH * 2,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: SCREEN_WIDTH,
    top: -SCREEN_WIDTH,
    left: -SCREEN_WIDTH / 2,
  },
  goldenSparkles: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ffd700',
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  diamondCrystals: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
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
});