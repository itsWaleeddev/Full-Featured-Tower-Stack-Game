# Stack Tower - Multi-Mode Mobile Game

A feature-rich React Native mobile game built with Expo, featuring multiple game modes, progression systems, and social sharing capabilities.

## 🎮 Game Features

### Game Modes

#### Classic Mode
- Endless stacking gameplay with increasing difficulty
- Progressive speed increases as you build higher
- Score tracking with combo multipliers
- Perfect alignment bonuses

#### Time Attack Mode
- 60-second time limit
- Fast-paced gameplay with score multipliers
- Real-time countdown with visual indicators
- Leaderboard tracking for best scores

#### Challenge Mode
- 5 unique levels with specific objectives
- Special block types (slippery, heavy, irregular)
- Star rating system (1-3 stars per level)
- Progressive difficulty with unique mechanics

### Progression System

#### Daily Challenges
- New challenge every day
- Specific objectives (perfect blocks, time limits, etc.)
- Coin rewards for completion
- Streak tracking

#### Coins & Rewards
- Earn coins based on performance
- Bonus coins for combos and perfect blocks
- Daily challenge rewards
- Achievement-based coin bonuses

#### Themes & Customization
- 4 unlockable visual themes:
  - Classic (default)
  - Neon Nights
  - Ocean Depths
  - Sunset Glow
- Theme-specific color palettes
- Unlock with earned coins

### Social Features

#### Scoreboard
- Track high scores across all game modes
- Personal best tracking
- Score history with dates and details

#### Social Sharing
- Share scores on social media
- Screenshot sharing capabilities
- Formatted score messages with emojis

## 🛠 Technical Implementation

### Architecture
- **Framework**: React Native with Expo Managed Workflow
- **Navigation**: Expo Router with tab-based navigation
- **Animations**: React Native Reanimated 3
- **Storage**: AsyncStorage for persistent data
- **State Management**: Custom hooks with React state

### Key Components

#### Game Engine
- `useGameState` - Core game logic and state management
- `gameLogic.ts` - Physics calculations and game mechanics
- Block collision detection with precision scoring
- Camera system with smooth following

#### UI Components
- `ModeSelector` - Game mode selection interface
- `TimeAttackUI` - Time-based game interface
- `ChallengeUI` - Challenge mode progress tracking
- `ThemeSelector` - Theme customization interface
- `DailyChallengeModal` - Daily challenge presentation

#### Data Persistence
- High score tracking across modes
- Game progress and unlocks
- Theme preferences
- Daily challenge completion status

### Performance Optimizations
- Efficient animation loops using `requestAnimationFrame`
- Optimized re-renders with React.memo and useCallback
- Smooth 60fps gameplay on various devices
- Memory-efficient asset management

## 🎯 Game Mechanics

### Block Types
- **Normal**: Standard blocks with regular physics
- **Slippery**: Reduced friction, faster movement, harder to align perfectly
- **Heavy**: Slower movement, easier perfect alignment, visual weight indicators
- **Irregular**: Unique movement patterns for added challenge

### Scoring System
- Base score increases with tower height
- Perfect alignment doubles the score
- Combo multipliers for consecutive perfect blocks
- Mode-specific score multipliers
- Bonus coins based on performance

### Challenge Objectives
1. **Perfect Start**: Stack 5 blocks with perfect alignment
2. **Speed Demon**: Stack 10 blocks in 30 seconds
3. **Slippery Slope**: Handle slippery blocks successfully
4. **Heavy Duty**: Master heavy block mechanics
5. **Master Builder**: Ultimate mixed-block challenge

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stack-tower-game

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Development

```bash
# Start with specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Build for production
npm run build:web
```

## 📱 Platform Support

- **iOS**: Full feature support with native performance
- **Android**: Complete functionality with platform-specific optimizations  
- **Web**: Browser-compatible version with touch/mouse controls

## 🎨 Customization

### Adding New Themes
1. Define theme in `constants/game.ts`
2. Add color palettes for backgrounds and blocks
3. Set unlock conditions and coin costs
4. Update theme selector UI

### Creating New Challenge Levels
1. Add level definition to `CHALLENGE_LEVELS`
2. Define objectives and special block types
3. Implement completion logic
4. Add star rating criteria

### Extending Game Modes
1. Add mode to `GameMode` type
2. Implement mode-specific UI components
3. Add game logic in `useGameState`
4. Update mode selector

## 🔧 Configuration

### Game Balance
Adjust difficulty and progression in `constants/game.ts`:
- Block speeds and acceleration
- Score multipliers
- Coin rewards
- Theme unlock costs

### Visual Customization
Modify themes and colors:
- Background gradients
- Block color palettes  
- UI element styling
- Animation parameters

## 📊 Analytics & Tracking

The game tracks:
- Play sessions and duration
- Score distributions across modes
- Theme usage and preferences
- Daily challenge completion rates
- Social sharing engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native Reanimated for smooth animations
- Lucide React Native for beautiful icons
- Community contributors and testers

---

Built with ❤️ using React Native and Expo