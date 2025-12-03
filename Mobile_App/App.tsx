import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  FlatList,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StripeProvider } from '@stripe/stripe-react-native';
import { apiService, Cafe, Customer } from './services/api';
import { LocationService, LocationData } from './services/location';
import CoffeeShopDetail from './components/CoffeeShopDetail';
import OrdersView from './components/OrdersView';
import AuthScreen from './components/auth/AuthScreen';
import { baseTheme } from './theme';
import { ENV } from './config/env';

// Stripe publishable key (test mode) - loaded from environment
const STRIPE_PUBLISHABLE_KEY = ENV.STRIPE_PUBLISHABLE_KEY;

interface CoffeeShop {
  id: number;
  name: string;
  distance: string;
  address: string;
  rating: number;
  description?: string;
  priceRange?: string;
  isOpen?: boolean;
  isCertified?: boolean;
  image?: string;
}

const CAFFIO_APP_NAME = 'Caffio';

const DUMMY_SHOPS: CoffeeShop[] = [
  {
    id: 1,
    name: 'Bean There',
    distance: '200m',
    address: '123 Main St',
    rating: 4.7,
    description: 'Artisanal coffee with locally sourced beans',
    priceRange: '$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15f?auto=format&w=800',
  },
  {
    id: 2,
    name: 'Brew Crew',
    distance: '450m',
    address: '456 Oak Ave',
    rating: 4.5,
    description: 'Cozy atmosphere with specialty drinks',
    priceRange: '$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&w=800',
  },
];

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCafeId, setSelectedCafeId] = useState<number | null>(null);
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [favoriteCafeIds, setFavoriteCafeIds] = useState<number[]>([]);
  const [favoriteMenuItemIds, setFavoriteMenuItemIds] = useState<number[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'certified' | 'topRated' | 'nearby'>('all');
  const flatListRef = useRef<FlatList<CoffeeShop>>(null);

  useEffect(() => {
    loadCoffeeShops();
  }, []);

  const loadCoffeeShops = async () => {
    try {
      setLoading(true);
      setError(null);

      let location: LocationData | null = null;
      try {
        location = await LocationService.getCurrentLocation();
      } catch {
        // ignore location errors
      }

      let cafes: Cafe[];
      if (location) {
        cafes = await apiService.getCafesNearby(location.latitude, location.longitude);
      } else {
        cafes = await apiService.getCafes();
      }

      const transformedShops: CoffeeShop[] = cafes.map((cafe, index) => {
        // Use isOpen directly from API - backend calculates it based on business hours
        // Handle undefined/null cases - default to true if not set (as per backend logic)
        // Explicitly check for boolean true to ensure proper evaluation
        const isOpenValue = typeof cafe.isOpen === 'boolean' ? cafe.isOpen : (cafe.isOpen === true || cafe.isOpen === undefined);
        return {
          id: cafe.id,
          name: cafe.name,
          address: cafe.address || 'Address not available',
          rating: cafe.ratingAvg,
          distance: location
            ? LocationService.formatDistance(
                LocationService.calculateDistance(location.latitude, location.longitude, cafe.lat, cafe.lon),
              )
            : `${(index + 1) * 200}m`,
          isOpen: isOpenValue,
        isCertified: cafe.isCertified,
        description: cafe.description || `Rated by ${cafe.ratingCount} customers`,
        priceRange: '$$',
          image:
            cafe.profileImageUrl ||
            cafe.imageUrl ||
            'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&w=800&q=80',
        };
      });

      setCoffeeShops(transformedShops);
    } catch (err) {
      console.error('Error loading coffee shops:', err);
      setError('Failed to load coffee shops. Please try again.');
      setCoffeeShops(DUMMY_SHOPS);
    } finally {
      setLoading(false);
    }
  };

  const syncFavoritesFromProfile = (profile: Customer) => {
    setFavoriteCafeIds(profile.favoriteCafes?.map((cafe) => cafe.id) ?? []);
    setFavoriteMenuItemIds(profile.favoriteMenuItems?.map((item) => item.id) ?? []);
  };

  const handleAuthSuccess = (profile: Customer) => {
    setCurrentCustomer(profile);
    syncFavoritesFromProfile(profile);
    setSelectedCafeId(null);
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const profile = await apiService.customerLogin(email, password);
      handleAuthSuccess(profile);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      const profile = await apiService.customerSignup({ name, email, password });
      handleAuthSuccess(profile);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    setFavoriteCafeIds([]);
    setFavoriteMenuItemIds([]);
    setSelectedCafeId(null);
  };

  const toggleCafeFavorite = async (cafeId: number) => {
    if (!currentCustomer) return;
    Haptics.selectionAsync();
    const isFavorite = favoriteCafeIds.includes(cafeId);
    const profile = isFavorite
      ? await apiService.removeFavoriteCafe(currentCustomer.id, cafeId)
      : await apiService.addFavoriteCafe(currentCustomer.id, cafeId);
    handleAuthSuccess(profile);
  };

  const toggleMenuItemFavorite = async (menuItemId: number) => {
    if (!currentCustomer) return;
    const isFavorite = favoriteMenuItemIds.includes(menuItemId);
    const profile = isFavorite
      ? await apiService.removeFavoriteMenuItem(currentCustomer.id, menuItemId)
      : await apiService.addFavoriteMenuItem(currentCustomer.id, menuItemId);
    handleAuthSuccess(profile);
  };

  const handleCafePress = (cafeId: number) => {
    setSelectedCafeId(cafeId);
  };

  const handleBack = () => {
    setSelectedCafeId(null);
  };

  const filteredCoffeeShops = useMemo(() => {
    let filtered = coffeeShops;
    if (selectedFilter === 'certified') {
      filtered = filtered.filter((shop) => shop.isCertified);
    } else if (selectedFilter === 'topRated') {
      filtered = filtered.filter((shop) => shop.rating >= 4.6);
    }
    if (searchText.trim()) {
      filtered = filtered.filter((shop) => shop.name.toLowerCase().includes(searchText.trim().toLowerCase()));
    }
    return filtered;
  }, [coffeeShops, searchText, selectedFilter]);

  const renderCoffeeShopCard = ({ item }: { item: CoffeeShop }) => {
    const isFavorite = favoriteCafeIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.85}
        onPress={() => handleCafePress(item.id)}
      >
        <LinearGradient
          colors={[baseTheme.palette.card, baseTheme.palette.cream]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={{
              uri: item.image || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&w=800',
            }}
            style={styles.cardImage}
          />
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              {(() => {
                const isOpen = item.isOpen === true;
                return (
                  <>
                    <View style={[styles.statusDot, { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }]} />
                    <Ionicons 
                      name={isOpen ? 'time' : 'time-outline'} 
                      size={14} 
                      color={isOpen ? '#4CAF50' : '#F44336'} 
                      style={styles.statusIcon}
                    />
                    <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
                      {isOpen ? 'Open now' : 'Closed'}
                    </Text>
                  </>
                );
              })()}
              {item.isCertified && (
                <View style={styles.certifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  <Text style={styles.certifiedText}>Certified</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => toggleCafeFavorite(item.id)}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? baseTheme.palette.danger : baseTheme.palette.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={14} color={baseTheme.palette.textSecondary} />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cash-outline" size={14} color={baseTheme.palette.textSecondary} />
              <Text style={styles.metaText}>{item.priceRange}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color={baseTheme.palette.textSecondary} />
              <Text style={styles.cardFooterText} numberOfLines={1} ellipsizeMode="tail">
                {item.address && item.address.length > 40 ? `${item.address.substring(0, 40)}...` : item.address}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (!currentCustomer) {
    return (
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AuthScreen loading={authLoading} onLogin={handleLogin} onSignup={handleSignup} />
      </StripeProvider>
    );
  }

  if (showOrders && currentCustomer) {
    return (
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <OrdersView
          customerId={currentCustomer.id}
          onBack={() => setShowOrders(false)}
        />
      </StripeProvider>
    );
  }

  if (selectedCafeId !== null) {
    return (
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <CoffeeShopDetail
          cafeId={selectedCafeId}
          onBack={handleBack}
          customerId={currentCustomer?.id}
          customerName={currentCustomer?.name || undefined}
          customerPhone={undefined} // Can be added later if stored
          isFavoriteCafe={favoriteCafeIds.includes(selectedCafeId)}
          favoriteMenuItemIds={favoriteMenuItemIds}
          onToggleCafeFavorite={toggleCafeFavorite}
          onToggleMenuItemFavorite={toggleMenuItemFavorite}
          onOrderPlaced={(order) => {
            // Order placed, could navigate to order tracking
            console.log('Order placed:', order);
          }}
        />
      </StripeProvider>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Morning, {currentCustomer.name || currentCustomer.email}</Text>
            <Text style={styles.favoritesSummary}>
              {favoriteCafeIds.length} favorites • {favoriteMenuItemIds.length} drinks saved
            </Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => setShowOrders(true)} style={styles.ordersButton}>
              <Ionicons name="receipt-outline" size={20} color={baseTheme.palette.brandBrown} />
              <Text style={styles.ordersButtonText}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color={baseTheme.palette.brandBrown} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLogoWrapper}>
              <Image source={require('./assets/caffio-logo.png')} style={styles.heroLogo} />
            </View>
            <View>
              <Text style={styles.heroEyebrow}>Caffio concierge</Text>
              <Text style={styles.heroHeadline}>Curating cafes for you</Text>
            </View>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={baseTheme.palette.textSecondary} />
            <TextInput
              placeholder="Find a cafe, drink, or vibe"
              placeholderTextColor="#A1887F"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.filterIcon}>
              <Ionicons name="options-outline" size={18} color={baseTheme.palette.card} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            {['all', 'certified', 'topRated', 'nearby'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && { backgroundColor: baseTheme.palette.brandBrown },
                ]}
                onPress={() => setSelectedFilter(filter as typeof selectedFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {filter === 'all'
                    ? 'All'
                    : filter === 'certified'
                    ? 'Certified'
                    : filter === 'topRated'
                    ? 'Top rated'
                    : 'Nearby'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={baseTheme.palette.brandBrown} />
            <Text style={styles.loadingText}>Brewing recommendations...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={48} color={baseTheme.palette.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCoffeeShops}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending near you</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                data={filteredCoffeeShops}
                renderItem={renderCoffeeShopCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth * 0.85}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                style={styles.flatList}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All cafes</Text>
            </View>
            <View style={styles.listingGrid}>
              {filteredCoffeeShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.listingCard}
                  activeOpacity={0.85}
                  onPress={() => handleCafePress(shop.id)}
                >
                  <Image
                    source={{
                      uri: shop.image || 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&w=800',
                    }}
                    style={styles.listingImage}
                  />
                  <View style={styles.listingContent}>
                    <Text style={styles.listingName}>{shop.name}</Text>
                    <Text style={styles.listingMeta}>
                      {shop.distance} • {shop.rating.toFixed(1)} ★
                    </Text>
                  </View>
                  <View style={styles.listingButton}>
                    <Text style={styles.listingButtonText}>Order</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.palette.cream,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: baseTheme.palette.brandBrown,
  },
  favoritesSummary: {
    fontSize: 14,
    color: baseTheme.palette.textSecondary,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: baseTheme.palette.sand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ordersButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: baseTheme.palette.brandBrown,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: baseTheme.palette.sand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    marginLeft: 4,
    color: baseTheme.palette.brandBrown,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: baseTheme.palette.card,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    ...baseTheme.shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLogoWrapper: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: baseTheme.palette.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroLogo: {
    width: 36,
    height: 36,
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: baseTheme.palette.textSecondary,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '700',
    color: baseTheme.palette.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: baseTheme.palette.creamLight,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: baseTheme.palette.textPrimary,
  },
  filterIcon: {
    backgroundColor: baseTheme.palette.brandBrown,
    padding: 8,
    borderRadius: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: baseTheme.palette.cream,
  },
  filterChipText: {
    fontSize: 13,
    color: baseTheme.palette.textSecondary,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    color: baseTheme.palette.brandBrown,
    fontSize: 16,
  },
  carouselContainer: {
    flex: 1,
    width: '100%',
  },
  carouselContent: {
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  flatList: {
    flex: 1,
  },
  cardContainer: {
    width: screenWidth * 0.85,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: baseTheme.palette.border,
    ...baseTheme.shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 22,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  certifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: baseTheme.palette.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: baseTheme.palette.textSecondary,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: baseTheme.palette.cream,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  metaText: {
    marginLeft: 6,
    color: baseTheme.palette.textSecondary,
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  cardFooterLabel: {
    fontSize: 12,
    color: baseTheme.palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardFooterText: {
    fontSize: 13,
    color: baseTheme.palette.textSecondary,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: baseTheme.palette.textPrimary,
  },
  sectionLink: {
    color: baseTheme.palette.brandBrown,
    fontWeight: '600',
  },
  listingGrid: {
    gap: 12,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...baseTheme.shadows.card,
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 14,
  },
  listingContent: {
    flex: 1,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '700',
    color: baseTheme.palette.textPrimary,
  },
  listingMeta: {
    color: baseTheme.palette.textSecondary,
    marginTop: 2,
  },
  listingButton: {
    backgroundColor: baseTheme.palette.brandAmber,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  listingButtonText: {
    fontWeight: '700',
    color: baseTheme.palette.brandBrown,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    color: baseTheme.palette.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: baseTheme.palette.brandBrown,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});