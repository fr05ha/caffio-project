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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Cafe, Menu, MenuItem, BusinessHours, Order } from '../services/api';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { baseTheme } from '../theme';
import MenuItemDetail from './MenuItemDetail';
import PaymentSheet from './PaymentSheet';

const { width: screenWidth } = Dimensions.get('window');

interface CoffeeShopDetailProps {
  cafeId: number;
  onBack: () => void;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  isFavoriteCafe?: boolean;
  favoriteMenuItemIds?: number[];
  onToggleCafeFavorite?: (cafeId: number) => void;
  onToggleMenuItemFavorite?: (menuItemId: number) => void;
  onOrderPlaced?: (order: Order) => void;
}

interface CafeDetail extends Cafe {
  menus: Menu[];
  reviews: any[];
  businessHours?: BusinessHours;
  phone?: string;
  email?: string;
  description?: string;
  profileImageUrl?: string;
  isOpen?: boolean;
}

export default function CoffeeShopDetail({
  cafeId,
  onBack,
  customerId,
  customerName,
  customerPhone,
  isFavoriteCafe = false,
  favoriteMenuItemIds = [],
  onToggleCafeFavorite,
  onToggleMenuItemFavorite,
  onOrderPlaced,
}: CoffeeShopDetailProps) {
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY'>('DELIVERY');
  const [pendingOrderData, setPendingOrderData] = useState<{
    items: Array<{ menuItemId: number; quantity: number }>;
    orderType: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
    deliveryAddress?: string;
  } | null>(null);

  const formatBusinessHours = (hours: BusinessHours | undefined): string => {
    if (!hours || typeof hours !== 'object') {
      return 'Hours not available';
    }

    const dayLabels: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const formatted = days
      .filter((day) => hours[day]?.enabled)
      .map((day) => {
        const dayHours = hours[day];
        return `${dayLabels[day]}: ${dayHours.open} - ${dayHours.close}`;
      });

    return formatted.length > 0 ? formatted.join('\n') : 'Closed';
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<Record<number, { item: MenuItem; quantity: number; customizations?: Record<string, string>; totalPrice: number }>>({});
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadCafeDetails();
  }, [cafeId]);

  const loadCafeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const cafeData = await apiService.getCafeById(cafeId);
      // Remove duplicate reviews by id
      if (cafeData.reviews && Array.isArray(cafeData.reviews)) {
        cafeData.reviews = Array.from(
          new Map(cafeData.reviews.map((review: any) => [review.id, review])).values()
        );
      }
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
    // Get unique categories from all menu items
    const allItems = cafe.menus.flatMap((menu) => menu.items);
    const categories = Array.from(new Set(allItems.map(item => item.category || 'Coffee')));
    return ['All', ...categories.sort()];
  }, [cafe]);

  const visibleMenuItems = useMemo(() => {
    if (!cafe) return [];
    const allItems = cafe.menus.flatMap((menu) => menu.items);
    if (selectedCategory === 'All') {
      return allItems;
    }
    return allItems.filter((item) => (item.category || 'Coffee') === selectedCategory);
  }, [cafe, selectedCategory]);

  const cartEntries = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartEntries.reduce((sum, entry) => sum + entry.quantity, 0), [cartEntries]);
  const cartTotal = useMemo(
    () => cartEntries.reduce((sum, entry) => sum + (entry.totalPrice || entry.item.price) * entry.quantity, 0),
    [cartEntries],
  );

  const formatPrice = (price: number, currency: string = 'AUD') => {
    return `$${price.toFixed(2)} ${currency}`;
  };

  const handleAddToCart = (item: MenuItem, customizations?: Record<string, string>, totalPrice?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev[item.id];
      const finalPrice = totalPrice || item.price;
      const finalQuantity = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: finalQuantity,
          customizations: customizations || existing?.customizations,
          totalPrice: finalPrice,
        },
      };
    });
    setSelectedMenuItem(null);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMenuItem(item);
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

  const handlePlaceOrder = async () => {
    if (!cartCount || !customerId || !cafe) return;

    // Show dialog to select order type and enter delivery address if needed
    setShowOrderDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!cartCount || !customerId || !cafe) return;

    // Validate delivery address for delivery orders
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address for delivery orders.');
      return;
    }

    // Store order data and show payment sheet
    const items = cartEntries.map((entry) => ({
      menuItemId: entry.item.id,
      quantity: entry.quantity,
    }));

    setPendingOrderData({
      items,
      orderType,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
    });

    setShowOrderDialog(false);
    setShowPaymentSheet(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!pendingOrderData || !customerId || !cafe) return;

    try {
      const order = await apiService.createOrder({
        customerId,
        cafeId: cafe.id,
        items: pendingOrderData.items,
        orderType: pendingOrderData.orderType,
        customerName,
        customerPhone,
        deliveryAddress: pendingOrderData.deliveryAddress,
        notes: `Order from ${cafe.name}`,
        paymentIntentId,
        paymentStatus: 'succeeded',
      });

      setShowPaymentSheet(false);
      setPendingOrderData(null);

      Alert.alert(
        'Order Placed!',
        `Your order #${order.id} has been placed. You can track it in your orders.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCart({});
              setDeliveryAddress('');
              setOrderType('DELIVERY'); // Reset to default
              if (onOrderPlaced) {
                onOrderPlaced(order);
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
      setShowPaymentSheet(false);
      setPendingOrderData(null);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
    setPendingOrderData(null);
    setShowOrderDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !cafe || !customerId) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      await apiService.createReview({
        cafeId: cafe.id,
        customerId,
        customerName: customerName || undefined,
        rating: reviewRating,
        text: reviewText.trim() || undefined,
      });
      
      Alert.alert('Success', 'Your review has been submitted!', [
        {
          text: 'OK',
          onPress: () => {
            setShowReviewDialog(false);
            setReviewRating(0);
            setReviewText('');
            loadCafeDetails(); // Reload to show new review
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isFavorite = favoriteMenuItemIds.includes(item.id);
    const cartEntry = cart[item.id];

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => handleMenuItemPress(item)}
        activeOpacity={0.7}
      >
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
              <View style={styles.menuItemTitleRow}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                )}
              </View>
              {onToggleMenuItemFavorite && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleMenuItemFavorite(item.id);
                  }}
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
              <Text style={styles.menuItemPrice}>
                {cartEntry?.totalPrice ? formatPrice(cartEntry.totalPrice, item.currency) : formatPrice(item.price, item.currency)}
              </Text>
              {cartEntry ? (
                <View style={styles.quantityStepper}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromCart(item.id);
                    }}
                  >
                    <Ionicons name="remove" size={18} color="#5D4037" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{cartEntry.quantity}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item, cartEntry.customizations, cartEntry.totalPrice);
                    }}
                  >
                    <Ionicons name="add" size={18} color="#5D4037" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleMenuItemPress(item);
                  }}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
            {/* Main cafe photo - using profileImageUrl, logoUrl, or placeholder */}
            <View style={styles.photoContainer}>
              <Image
                source={{
                  uri: cafe.profileImageUrl || cafe.logoUrl || cafe.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
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
            
            {cafe.ratingAvg > 0 && cafe.ratingCount > 0 ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={20} color="#FFC107" />
                <Text style={styles.ratingText}>{cafe.ratingAvg.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({cafe.ratingCount} reviews)</Text>
              </View>
            ) : (
              <View style={styles.ratingRow}>
                <Ionicons name="star-outline" size={20} color="#BDBDBD" />
                <Text style={styles.ratingText}>No ratings yet</Text>
              </View>
            )}
          </View>

          {cafe.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={18} color="#8D6E63" />
              <Text style={styles.addressText}>{cafe.address}</Text>
            </View>
          )}

          {/* Open/Closed Status */}
          <View style={styles.statusRow}>
            {(() => {
              const isOpen = cafe.isOpen === true;
              return (
                <>
                  <View style={[styles.statusDot, { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }]} />
                  <Ionicons 
                    name={isOpen ? 'time' : 'time-outline'} 
                    size={16} 
                    color={isOpen ? '#4CAF50' : '#F44336'} 
                    style={styles.statusIcon}
                  />
                  <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
                    {isOpen ? 'Open now' : 'Closed'}
                  </Text>
                </>
              );
            })()}
          </View>

          {cafe.description && (
            <Text style={styles.descriptionText}>{cafe.description}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'menu' && styles.tabActive]}
            onPress={() => setActiveTab('menu')}
          >
            <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'menu' && (
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
        )}

        {activeTab === 'reviews' && (
          <View style={styles.infoContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.infoTitle}>Reviews</Text>
              {customerId && (
                <TouchableOpacity
                  style={styles.addReviewButton}
                  onPress={() => setShowReviewDialog(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={baseTheme.palette.brandBrown} />
                  <Text style={styles.addReviewButtonText}>Add Review</Text>
                </TouchableOpacity>
              )}
            </View>
            {cafe.reviews && cafe.reviews.length > 0 ? (
              // Remove duplicates by id
              Array.from(
                new Map(cafe.reviews.map((review: any) => [review.id, review])).values()
              ).map((review: any) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUserName}>
                        {review.customerName || review.customer?.name || 'Anonymous'}
                      </Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={16}
                            color="#FFC107"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {review.text && <Text style={styles.reviewText}>{review.text}</Text>}
                </View>
              ))
            ) : (
              <View style={styles.emptyMenu}>
                <Ionicons name="chatbubbles-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyMenuText}>No reviews yet</Text>
                {customerId && (
                  <TouchableOpacity
                    style={styles.addFirstReviewButton}
                    onPress={() => setShowReviewDialog(true)}
                  >
                    <Text style={styles.addFirstReviewButtonText}>Be the first to review</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Information</Text>
            
            {/* Current Status */}
            <View style={styles.infoSection}>
              <View style={styles.infoSectionHeader}>
                <Ionicons name="time-outline" size={20} color="#5D4037" />
                <Text style={styles.infoSectionTitle}>Status</Text>
              </View>
              <View style={styles.statusRow}>
                {(() => {
                  const isOpen = cafe.isOpen === true;
                  return (
                    <>
                      <View style={[styles.statusDot, { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }]} />
                      <Ionicons 
                        name={isOpen ? 'time' : 'time-outline'} 
                        size={16} 
                        color={isOpen ? '#4CAF50' : '#F44336'} 
                        style={styles.statusIcon}
                      />
                      <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
                        {isOpen ? 'Open now' : 'Closed'}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
            
            {/* Business Hours */}
            {cafe.businessHours && (
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#5D4037" />
                  <Text style={styles.infoSectionTitle}>Business Hours</Text>
                </View>
                <Text style={styles.businessHoursText}>{formatBusinessHours(cafe.businessHours)}</Text>
              </View>
            )}

            {/* Contact Information */}
            {(cafe.phone || cafe.email) && (
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="call-outline" size={20} color="#5D4037" />
                  <Text style={styles.infoSectionTitle}>Contact</Text>
                </View>
                {cafe.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call" size={16} color="#8D6E63" />
                    <Text style={styles.contactText}>{cafe.phone}</Text>
                  </View>
                )}
                {cafe.email && (
                  <View style={styles.contactRow}>
                    <Ionicons name="mail" size={16} color="#8D6E63" />
                    <Text style={styles.contactText}>{cafe.email}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Address */}
            {cafe.address && (
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="location" size={20} color="#5D4037" />
                  <Text style={styles.infoSectionTitle}>Address</Text>
                </View>
                <Text style={styles.addressInfoText}>{cafe.address}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Menu Item Detail Modal */}
      {selectedMenuItem && cafe && (
        <MenuItemDetail
          item={selectedMenuItem}
          cafeName={cafe.name}
          onBack={() => setSelectedMenuItem(null)}
          onAddToCart={handleAddToCart}
          isFavorite={favoriteMenuItemIds.includes(selectedMenuItem.id)}
          onToggleFavorite={() => onToggleMenuItemFavorite?.(selectedMenuItem.id)}
        />
      )}

      {cartCount > 0 && (
        <>
          <View style={styles.orderBar}>
            <View>
              <Text style={styles.orderBarTitle}>{cartCount} items</Text>
              <Text style={styles.orderBarSubtitle}>Total {formatPrice(cartTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
          
          {showOrderDialog && (
            <View style={styles.dialogOverlay}>
              <View style={styles.dialog}>
                <Text style={styles.dialogTitle}>Order Details</Text>
                <Text style={styles.dialogSubtitle}>Select order type</Text>
                
                {/* Order Type Selection */}
                <View style={styles.orderTypeContainer}>
                  <TouchableOpacity
                    style={[styles.orderTypeButton, orderType === 'DINE_IN' && styles.orderTypeButtonActive]}
                    onPress={() => setOrderType('DINE_IN')}
                  >
                    <Ionicons name="restaurant" size={20} color={orderType === 'DINE_IN' ? '#FFFFFF' : '#5D4037'} />
                    <Text style={[styles.orderTypeText, orderType === 'DINE_IN' && styles.orderTypeTextActive]}>
                      Dine In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orderTypeButton, orderType === 'TAKE_AWAY' && styles.orderTypeButtonActive]}
                    onPress={() => setOrderType('TAKE_AWAY')}
                  >
                    <Ionicons name="bag" size={20} color={orderType === 'TAKE_AWAY' ? '#FFFFFF' : '#5D4037'} />
                    <Text style={[styles.orderTypeText, orderType === 'TAKE_AWAY' && styles.orderTypeTextActive]}>
                      Take Away
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orderTypeButton, orderType === 'DELIVERY' && styles.orderTypeButtonActive]}
                    onPress={() => setOrderType('DELIVERY')}
                  >
                    <Ionicons name="car" size={20} color={orderType === 'DELIVERY' ? '#FFFFFF' : '#5D4037'} />
                    <Text style={[styles.orderTypeText, orderType === 'DELIVERY' && styles.orderTypeTextActive]}>
                      Delivery
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Delivery Address Input (only for DELIVERY) */}
                {orderType === 'DELIVERY' && (
                  <>
                    <Text style={styles.dialogSubtitle}>Please enter your delivery address</Text>
                    <TextInput
                      style={styles.addressInput}
                      placeholder="Enter your address"
                      placeholderTextColor="#8D6E63"
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                      multiline
                      numberOfLines={3}
                    />
                  </>
                )}

                <View style={styles.dialogButtons}>
                  <TouchableOpacity
                    style={[styles.dialogButton, styles.dialogButtonCancel]}
                    onPress={() => setShowOrderDialog(false)}
                  >
                    <Text style={styles.dialogButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogButton, styles.dialogButtonConfirm]}
                    onPress={handleConfirmOrder}
                    disabled={orderType === 'DELIVERY' && !deliveryAddress.trim()}
                  >
                    <Text style={[styles.dialogButtonText, (orderType === 'DELIVERY' && !deliveryAddress.trim()) && styles.dialogButtonTextDisabled]}>
                      Place Order
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <Modal
          visible={showReviewDialog}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReviewDialog(false)}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Write a Review</Text>
              <Text style={styles.dialogSubtitle}>Share your experience with {cafe?.name}</Text>

              {/* Star Rating */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rating</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setReviewRating(star);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= reviewRating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= reviewRating ? '#FFC107' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Review Text */}
              <Text style={styles.ratingLabel}>Your Review (Optional)</Text>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Tell others about your experience..."
                placeholderTextColor="#8D6E63"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                maxLength={500}
              />

              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonCancel]}
                  onPress={() => {
                    setShowReviewDialog(false);
                    setReviewRating(0);
                    setReviewText('');
                  }}
                >
                  <Text style={styles.dialogButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonConfirm, !reviewRating && styles.dialogButtonDisabled]}
                  onPress={handleSubmitReview}
                  disabled={!reviewRating || submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.dialogButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Payment Sheet */}
      <PaymentSheet
        amount={cartTotal}
        currency="usd"
        orderId={undefined}
        customerId={customerId}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        visible={showPaymentSheet}
      />
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 12,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#5D4037',
  },
  tabText: {
    fontSize: 16,
    color: '#8D6E63',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#5D4037',
    fontWeight: '700',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
    marginLeft: 8,
  },
  businessHoursText: {
    fontSize: 14,
    color: '#8D6E63',
    lineHeight: 24,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#8D6E63',
    marginLeft: 8,
  },
  addressInfoText: {
    fontSize: 14,
    color: '#8D6E63',
    lineHeight: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: baseTheme.palette.cream,
    borderRadius: 12,
  },
  addReviewButtonText: {
    color: baseTheme.palette.brandBrown,
    fontWeight: '600',
    fontSize: 14,
  },
  addFirstReviewButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: baseTheme.palette.brandBrown,
    borderRadius: 12,
  },
  addFirstReviewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#8D6E63',
  },
  reviewText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
    marginTop: 8,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#5D4037',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  dialogButtonDisabled: {
    opacity: 0.5,
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#E8E0DD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#5D4037',
    textTransform: 'capitalize',
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
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 8,
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 16,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#5D4037',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dialogButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  dialogButtonConfirm: {
    backgroundColor: '#5D4037',
  },
  dialogButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dialogButtonTextCancel: {
    color: '#5D4037',
    fontWeight: '600',
  },
  dialogButtonTextDisabled: {
    opacity: 0.5,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  orderTypeButtonActive: {
    backgroundColor: '#5D4037',
    borderColor: '#5D4037',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
  },
  orderTypeTextActive: {
    color: '#FFFFFF',
  },
});

