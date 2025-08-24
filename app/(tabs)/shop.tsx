import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, Lock, Check, Star, Crown, Zap, Gift, ShoppingBag, Store, AlertCircle, X, Gamepad2, Trophy } from 'lucide-react-native';
import { Theme } from '@/types/game';
import { THEMES } from '@/constants/game';
import { useTheme } from '@/contexts/GameContext';
import { useSound } from '@/contexts/SoundContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InsufficientCoinsModalProps {
  visible: boolean;
  onClose: () => void;
  requiredCoins: number;
  currentCoins: number;
  themeName: string;
}

const InsufficientCoinsModal: React.FC<InsufficientCoinsModalProps> = React.memo(({
  visible,
  onClose,
  requiredCoins,
  currentCoins,
  themeName
}) => {
  const coinsNeeded = useMemo(() => requiredCoins - currentCoins, [requiredCoins, currentCoins]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['rgba(255, 59, 48, 0.1)', 'rgba(255, 59, 48, 0.05)']}
            style={styles.modalBackground}
          />
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
          
          {/* Alert Icon */}
          <View style={styles.alertIconContainer}>
            <AlertCircle size={48} color="#ff3b30" />
          </View>
          
          {/* Title */}
          <Text style={styles.modalTitle}>Insufficient Coins</Text>
          
          {/* Message */}
          <Text style={styles.modalMessage}>
            You need <Text style={styles.coinsHighlight}>{coinsNeeded} more coins</Text> to purchase the{' '}
            <Text style={styles.themeNameHighlight}>{themeName}</Text> theme.
          </Text>
          
          {/* Coins Info */}
          <View style={styles.coinsInfoContainer}>
            <View style={styles.coinsRow}>
              <Text style={styles.coinsLabel}>Required:</Text>
              <View style={styles.coinsAmount}>
                <Coins size={16} color="#FFD700" />
                <Text style={styles.coinsValue}>{requiredCoins}</Text>
              </View>
            </View>
            
            <View style={styles.coinsRow}>
              <Text style={styles.coinsLabel}>You have:</Text>
              <View style={styles.coinsAmount}>
                <Coins size={16} color="#FFD700" />
                <Text style={styles.coinsValue}>{currentCoins}</Text>
              </View>
            </View>
            
            <View style={[styles.coinsRow, styles.coinsNeededRow]}>
              <Text style={styles.coinsNeededLabel}>Need:</Text>
              <View style={styles.coinsAmount}>
                <Coins size={16} color="#ff3b30" />
                <Text style={styles.coinsNeededValue}>{coinsNeeded}</Text>
              </View>
            </View>
          </View>
          
          {/* Earning Tips */}
          <View style={styles.earningTipsContainer}>
            <Text style={styles.earningTipsTitle}>Earn more coins by:</Text>
            
            <View style={styles.tipItem}>
              <Gamepad2 size={18} color="#4facfe" />
              <Text style={styles.tipText}>Playing Classic and Time Attack modes</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Trophy size={18} color="#FFD700" />
              <Text style={styles.tipText}>Completing daily challenges</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Star size={18} color="#9c27b0" />
              <Text style={styles.tipText}>Achieving high scores and combos</Text>
            </View>
          </View>
          
          {/* Action Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#9e9e9e';
    case 'rare': return '#2196f3';
    case 'epic': return '#9c27b0';
    case 'legendary': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const getRarityIcon = (rarity: string): React.ReactElement | null => {
  switch (rarity) {
    case 'rare': return <Star size={16} color="#2196f3" />;
    case 'epic': return <Zap size={16} color="#9c27b0" />;
    case 'legendary': return <Crown size={16} color="#ff9800" />;
    default: return null;
  }
};

export default function Shop(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState<boolean>(false);
  const [selectedThemeForPurchase, setSelectedThemeForPurchase] = useState<Theme | null>(null);
  const { playSound } = useSound();
  
  // Use global theme context instead of local state
  const { 
    themeState, 
    spendCoins, 
    unlockTheme, 
    setCurrentTheme 
  } = useTheme();

  const handleThemeSelect = useCallback((themeId: string): void => {
    // Play button sound for theme selection
    playSound('button', 0.7);
    
    // Only allow selection if theme is unlocked
    if (themeState.unlockedThemes.includes(themeId)) {
      setCurrentTheme(themeId);
    }
  }, [playSound, themeState.unlockedThemes, setCurrentTheme]);

  const handleThemePurchase = useCallback((themeId: string): void => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme && themeState.coins >= theme.cost) {
      // Play purchase sound
      playSound('purchase', 0.8);
      
      spendCoins(theme.cost);
      unlockTheme(themeId);
      setCurrentTheme(themeId);
    } else if (theme) {
      // Play failed sound and show insufficient coins modal
      playSound('failed', 0.5);
      setSelectedThemeForPurchase(theme);
      setShowInsufficientCoinsModal(true);
    }
  }, [themeState.coins, playSound, spendCoins, unlockTheme, setCurrentTheme]);

  const handleInsufficientCoinsTap = useCallback((theme: Theme): void => {
    playSound('failed', 0.4);
    setSelectedThemeForPurchase(theme);
    setShowInsufficientCoinsModal(true);
  }, [playSound]);

  const handleCategorySelect = useCallback((categoryId: string): void => {
    // Play button sound for category selection
    playSound('button', 0.6);
    setSelectedCategory(categoryId);
  }, [playSound]);

  const handleCloseModal = useCallback((): void => {
    setShowInsufficientCoinsModal(false);
    setSelectedThemeForPurchase(null);
  }, []);

  const categories = useMemo(() => [
    { id: 'all', name: 'All', icon: <ShoppingBag size={16} color="#fff" /> },
    { id: 'common', name: 'Common', icon: null },
    { id: 'rare', name: 'Rare', icon: <Star size={16} color="#2196f3" /> },
    { id: 'epic', name: 'Epic', icon: <Zap size={16} color="#9c27b0" /> },
    { id: 'legendary', name: 'Legendary', icon: <Crown size={16} color="#ff9800" /> },
  ], []);

  const filteredThemes = useMemo(() => THEMES.filter(theme => 
    selectedCategory === 'all' || theme.rarity === selectedCategory
  ), [selectedCategory]);

  const updatedThemes = useMemo(() => filteredThemes.map(theme => ({
    ...theme,
    unlocked: themeState.unlockedThemes.includes(theme.id)
  })), [filteredThemes, themeState.unlockedThemes]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Store size={24} color="#fff" />
          <Text style={styles.title}>Premium Shop</Text>
        </View>
        <View style={styles.coinsContainer}>
          <Coins size={20} color="#FFD700" />
          <Text style={styles.coinsText}>{themeState.coins}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            {category.icon}
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Themes Grid */}
      <ScrollView style={styles.themesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.themesGrid}>
          {updatedThemes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                themeState.currentTheme === theme.id && styles.selectedThemeCard,
              ]}
              onPress={() => {
                if (theme.unlocked) {
                  handleThemeSelect(theme.id);
                } else if (themeState.coins >= theme.cost) {
                  handleThemePurchase(theme.id);
                } else {
                  handleInsufficientCoinsTap(theme);
                }
              }}
            >
              {/* Rarity Border */}
              <View style={[
                styles.rarityBorder,
                { borderColor: getRarityColor(theme.rarity || 'common') }
              ]} />
              
              {/* Theme Preview */}
              <LinearGradient
                colors={theme.backgroundColors}
                style={styles.themePreview}
              >
                <View style={styles.blockPreview}>
                  {theme.blockColors.slice(0, 6).map((colors, index) => (
                    <LinearGradient
                      key={index}
                      colors={colors}
                      style={styles.miniBlock}
                    />
                  ))}
                </View>
                
                {/* Locked Overlay */}
                {!theme.unlocked && (
                  <View style={styles.lockedOverlay}>
                    <Lock size={20} color="rgba(255,255,255,0.8)" />
                  </View>
                )}
              </LinearGradient>
              
              {/* Theme Info */}
              <View style={styles.themeInfo}>
                <View style={styles.themeHeader}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {getRarityIcon(theme.rarity || 'common')}
                </View>
                
                <Text style={styles.themeDescription} numberOfLines={2}>
                  {theme.description}
                </Text>
                
                {/* Status/Action */}
                <View style={styles.themeAction}>
                  {themeState.currentTheme === theme.id ? (
                    <View style={styles.selectedBadge}>
                      <Check size={14} color="#4facfe" />
                      <Text style={styles.selectedText}>Active</Text>
                    </View>
                  ) : theme.unlocked ? (
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => handleThemeSelect(theme.id)}
                    >
                      <Text style={styles.selectButtonText}>Select</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.priceContainer}>
                      {themeState.coins >= theme.cost ? (
                        <TouchableOpacity
                          style={styles.buyButton}
                          onPress={() => handleThemePurchase(theme.id)}
                        >
                          <Coins size={14} color="#FFD700" />
                          <Text style={styles.buyButtonText}>{theme.cost}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={styles.cantAffordContainer}
                          onPress={() => handleInsufficientCoinsTap(theme)}
                        >
                          <Coins size={14} color="#666" />
                          <Text style={styles.cantAffordText}>{theme.cost}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Insufficient Coins Modal */}
      <InsufficientCoinsModal
        visible={showInsufficientCoinsModal}
        onClose={handleCloseModal}
        requiredCoins={selectedThemeForPurchase?.cost || 0}
        currentCoins={themeState.coins}
        themeName={selectedThemeForPurchase?.name || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 0,
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
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
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
  categoryContainer: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(79, 172, 254, 0.3)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  selectedCategoryText: {
    color: '#4facfe',
  },
  themesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  selectedThemeCard: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
  },
  rarityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#9e9e9e',
  },
  themePreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blockPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBlock: {
    width: 18,
    height: 18,
    margin: 1,
    borderRadius: 3,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    padding: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  themeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    lineHeight: 16,
  },
  themeAction: {
    alignItems: 'flex-start',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedText: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cantAffordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cantAffordText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    height: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  alertIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  coinsHighlight: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  themeNameHighlight: {
    color: '#4facfe',
    fontWeight: 'bold',
  },
  coinsInfoContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coinsNeededRow: {
    marginBottom: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  coinsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  coinsNeededLabel: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  coinsAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsValue: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  coinsNeededValue: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  earningTipsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  earningTipsTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});