import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Cafe, Menu, MenuItem } from '../services/api';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { baseTheme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

interface CoffeeShopDetailProps {
  cafeId: number;
  onBack: () => void;
  isFavoriteCafe?: boolean;
  favoriteMenuItemIds?: number[];
  onToggleCafeFavorite?: (cafeId: number) => void;
  onToggleMenuItemFavorite?: (menuItemId: number) => void;
}

interface CafeDetail extends Cafe {
  menus: Menu[];
  reviews: any[];
}

export default function CoffeeShopDetail({
  cafeId,
  onBack,
  isFavoriteCafe = false,
  favoriteMenuItemIds = [],
  onToggleCafeFavorite,
  onToggleMenuItemFavorite,
}: CoffeeShopDetailProps) {
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<Record<number, { item: MenuItem; quantity: number }>>({});

  useEffect(() => {
    loadCafeDetails();
  }, [cafeId]);

  const loadCafeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const cafeData = await apiService.getCafeById(cafeId);
      setCafe(cafeData as CafeDetail);
      setSelectedCategory('All');
      setCart({});
    } catch (err) {
      console.error('Error loading cafe details:', err);
      setError('Failed to load cafe details');
    } finally {
      setLoading(false);
    }
  };

  const menuCategories = useMemo(() => {
    if (!cafe) return ['All'];
    const names = cafe.menus.map((menu) => menu.name ?? 'Menu');
    return ['All', ...names];
  }, [cafe]);

  const visibleMenuItems = useMemo(() => {
    if (!cafe) return [];
    if (selectedCategory === 'All') {
      return cafe.menus.flatMap((menu) => menu.items);
    }
    return cafe.menus
      .filter((menu) => menu.name === selectedCategory)
      .flatMap((menu) => menu.items);
  }, [cafe, selectedCategory]);

  const cartEntries = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartEntries.reduce((sum, entry) => sum + entry.quantity, 0), [cartEntries]);
  const cartTotal = useMemo(
    () => cartEntries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0),
    [cartEntries],
  );

  const formatPrice = (price: number, currency: string = 'AUD') => {
    return `$${price.toFixed(2)} ${currency}`;
  };

  const handleAddToCart = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity === 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const handlePlaceOrder = () => {
    if (!cartCount) return;
    Alert.alert('Order placed', 'Your order is being prepared. You will receive a pickup notification shortly.');
    setCart({});
  };

  const renderMenuItem = (item: MenuItem) => {
    const isFavorite = favoriteMenuItemIds.includes(item.id);
    const cartEntry = cart[item.id];

    return (
      <View key={item.id} style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemImageContainer}>
            <Image
              source={{
                uri: item.imageUrl || 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
              }}
              style={styles.menuItemImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.menuItemInfo}>
            <View style={styles.menuItemHeader}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              {onToggleMenuItemFavorite && (
                <TouchableOpacity
                  onPress={() => onToggleMenuItemFavorite(item.id)}
                  style={styles.menuItemFavoriteButton}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? '#D32F2F' : '#8D6E63'}
                  />
                </TouchableOpacity>
              )}
            </View>
            {item.description && (
              <Text style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.menuItemFooter}>
              <Text style={styles.menuItemPrice}>{formatPrice(item.price, item.currency)}</Text>
              {cartEntry ? (
                <View style={styles.quantityStepper}>
                  <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)}>
                    <Ionicons name="remove" size={18} color="#5D4037" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{cartEntry.quantity}</Text>
                  <TouchableOpacity onPress={() => handleAddToCart(item)}>
                    <Ionicons name="add" size={18} color="#5D4037" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderMenuSection = (menu: Menu) => (
    <View key={menu.id} style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{menu.name}</Text>
      {menu.items.map(renderMenuItem)}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Loading cafe details...</Text>
        </View>
      </View>
    );
  }

  if (error || !cafe) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error || 'Cafe not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCafeDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Get all menu items from all menus
  const allMenuItems = cafe.menus.flatMap(menu => menu.items);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Cafe Photos */}
        <View style={styles.photoSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoScrollView}
          >
            {/* Main cafe photo - using logoUrl or placeholder */}
            <View style={styles.photoContainer}>
              <Image
                source={{
                  uri: cafe.logoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
                }}
                style={styles.cafePhoto}
                resizeMode="cover"
              />
            </View>
            
            {/* Additional placeholder photos - will be replaced with real photos later */}
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800' }}
                style={styles.cafePhoto}
                resizeMode="cover"
              />
            </View>
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800' }}
                style={styles.cafePhoto}
                resizeMode="cover"
              />
            </View>
          </ScrollView>
          
          {/* Back button overlay */}
          <TouchableOpacity onPress={onBack} style={styles.backButtonOverlay}>
            <View style={styles.actionCircle}>
              <Ionicons name="arrow-back" size={24} color="#5D4037" />
            </View>
          </TouchableOpacity>
          {onToggleCafeFavorite && (
            <TouchableOpacity onPress={() => onToggleCafeFavorite(cafeId)} style={styles.favoriteButtonOverlay}>
              <View style={styles.actionCircle}>
                <Ionicons
                  name={isFavoriteCafe ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavoriteCafe ? '#D32F2F' : '#5D4037'}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Cafe Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.cafeHeader}>
            <View style={styles.cafeTitleRow}>
              <Text style={styles.cafeName}>{cafe.name}</Text>
              {cafe.isCertified && (
                <View style={styles.certifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.certifiedText}>Certified</Text>
                </View>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={20} color="#FFC107" />
              <Text style={styles.ratingText}>{cafe.ratingAvg.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({cafe.ratingCount} reviews)</Text>
            </View>
          </View>

          {cafe.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={18} color="#8D6E63" />
              <Text style={styles.addressText}>{cafe.address}</Text>
            </View>
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>
          
          {cafe.menus.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Ionicons name="restaurant-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyMenuText}>No menu available</Text>
            </View>
          ) : (
            <>
              {cafe.menus.map(renderMenuSection)}
              
              {/* All Items View (Uber Eats style) */}
              {allMenuItems.length > 0 && (
                <View style={styles.allItemsSection}>
                  <Text style={styles.allItemsTitle}>All Items</Text>
                  {allMenuItems.map(renderMenuItem)}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {cartCount > 0 && (
        <View style={styles.orderBar}>
          <View>
            <Text style={styles.orderBarTitle}>{cartCount} items</Text>
            <Text style={styles.orderBarSubtitle}>Total {formatPrice(cartTotal)}</Text>
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Text style={styles.orderButtonText}>Review order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 20 }),
    left: 16,
    zIndex: 10,
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 20 }),
    right: 16,
    zIndex: 10,
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8D6E63',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#795548',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Photo Section
  photoSection: {
    height: 300,
    position: 'relative',
  },
  photoScrollView: {
    flex: 1,
  },
  photoContainer: {
    width: screenWidth,
    height: 300,
  },
  cafePhoto: {
    width: '100%',
    height: '100%',
  },
  // Info Section
  infoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cafeHeader: {
    marginBottom: 12,
  },
  cafeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cafeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5D4037',
    marginRight: 12,
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certifiedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#8D6E63',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#8D6E63',
    marginLeft: 8,
    flex: 1,
  },
  // Menu Section
  menuContainer: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 20,
  },
  menuSection: {
    marginBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 16,
  },
  allItemsSection: {
    marginTop: 8,
  },
  allItemsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
  },
  menuItemImageContainer: {
    width: 120,
    height: 120,
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
  },
  menuItemInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 4,
  },
  menuItemFavoriteButton: {
    paddingLeft: 8,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#795548',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  quantityText: {
    marginHorizontal: 10,
    fontWeight: '700',
    color: '#5D4037',
  },
  addButton: {
    backgroundColor: '#5D4037',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyMenu: {
    alignItems: 'center',
    padding: 48,
  },
  emptyMenuText: {
    marginTop: 16,
    fontSize: 16,
    color: '#BDBDBD',
  },
  orderBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  orderBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
  },
  orderBarSubtitle: {
    color: '#8D6E63',
  },
  orderButton: {
    backgroundColor: '#5D4037',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

