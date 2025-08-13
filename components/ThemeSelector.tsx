import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, Lock, Check } from 'lucide-react-native';
import { Theme } from '../types/game';

interface ThemeSelectorProps {
  themes: Theme[];
  visible: boolean;
  currentTheme: string;
  coins: number;
  onThemeSelect: (themeId: string) => void;
  onThemePurchase: (themeId: string) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  visible,
  currentTheme,
  coins,
  onThemeSelect,
  onThemePurchase,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.background}
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>Themes</Text>
          <View style={styles.coinsContainer}>
            <Coins size={20} color="#FFD700" />
            <Text style={styles.coinsText}>{coins}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.themesContainer} showsVerticalScrollIndicator={false}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                currentTheme === theme.id && styles.selectedThemeCard,
              ]}
              onPress={() => {
                if (theme.unlocked) {
                  onThemeSelect(theme.id);
                } else if (coins >= theme.cost) {
                  onThemePurchase(theme.id);
                }
              }}
              disabled={!theme.unlocked && coins < theme.cost}
            >
              <LinearGradient
                colors={theme.backgroundColors}
                style={styles.themePreview}
              >
                <View style={styles.blockPreview}>
                  {theme.blockColors.slice(0, 4).map((colors, index) => (
                    <LinearGradient
                      key={index}
                      colors={colors}
                      style={styles.miniBlock}
                    />
                  ))}
                </View>
              </LinearGradient>
              
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{theme.name}</Text>
                
                {currentTheme === theme.id ? (
                  <View style={styles.selectedBadge}>
                    <Check size={16} color="#4facfe" />
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                ) : theme.unlocked ? (
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => onThemeSelect(theme.id)}
                  >
                    <Text style={styles.selectButtonText}>Select</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.priceContainer}>
                    {coins >= theme.cost ? (
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => onThemePurchase(theme.id)}
                      >
                        <Coins size={16} color="#FFD700" />
                        <Text style={styles.buyButtonText}>{theme.cost}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.lockedContainer}>
                        <Lock size={16} color="#666" />
                        <Text style={styles.lockedText}>{theme.cost}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  themesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  themeCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  selectedThemeCard: {
    borderWidth: 2,
    borderColor: '#4facfe',
  },
  themePreview: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 40,
    height: 40,
  },
  miniBlock: {
    width: 18,
    height: 18,
    margin: 1,
    borderRadius: 2,
  },
  themeInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    color: '#4facfe',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  selectButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    alignSelf: 'flex-start',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lockedText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
});