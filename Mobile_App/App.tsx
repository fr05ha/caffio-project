import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Cafe, Customer } from './services/api';
import { LocationService, LocationData } from './services/location';
import CoffeeShopDetail from './components/CoffeeShopDetail';
import AuthScreen from './components/auth/AuthScreen';

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
}

const CAFFIO_APP_NAME = 'Caff.io';

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
  },
];

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCafeId, setSelectedCafeId] = useState<number | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [favoriteCafeIds, setFavoriteCafeIds] = useState<number[]>([]);
  const [favoriteMenuItemIds, setFavoriteMenuItemIds] = useState<number[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
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

      const transformedShops: CoffeeShop[] = cafes.map((cafe, index) => ({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address || 'Address not available',
        rating: cafe.ratingAvg,
        distance: location
          ? LocationService.formatDistance(
              LocationService.calculateDistance(location.latitude, location.longitude, cafe.lat, cafe.lon),
            )
          : `${(index + 1) * 200}m`,
        isOpen: true,
        isCertified: cafe.isCertified,
        description: `Rated by ${cafe.ratingCount} customers`,
        priceRange: '$$',
      }));

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

  const renderCoffeeShopCard = ({ item }: { item: CoffeeShop }) => {
    const isFavorite = favoriteCafeIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.85}
        onPress={() => handleCafePress(item.id)}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#4CAF50' : '#F44336' }]} />
              <Text style={styles.statusText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
              {item.isCertified && (
                <View style={styles.certifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  <Text style={styles.certifiedText}>Certified</Text>
                </View>
              )}
            </View>
            <View style={styles.cardHeaderRight}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#D32F2F' : '#8D6E63'}
                style={styles.favoriteIndicator}
              />
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardDistance}>
            <Ionicons name="location-outline" size={14} color="#8D6E63" />
            <Text style={styles.distanceText}>
              {item.distance} • {item.address}
            </Text>
          </View>

          <Text style={styles.cardDescription}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.priceRange}>{item.priceRange}</Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#5D4037" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!currentCustomer) {
    return <AuthScreen loading={authLoading} onLogin={handleLogin} onSignup={handleSignup} />;
  }

  if (selectedCafeId !== null) {
    return (
      <CoffeeShopDetail
        cafeId={selectedCafeId}
        onBack={handleBack}
        isFavoriteCafe={favoriteCafeIds.includes(selectedCafeId)}
        favoriteMenuItemIds={favoriteMenuItemIds}
        onToggleCafeFavorite={toggleCafeFavorite}
        onToggleMenuItemFavorite={toggleMenuItemFavorite}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hi, {currentCustomer.name || currentCustomer.email}</Text>
          <Text style={styles.favoritesSummary}>
            {favoriteCafeIds.length} favorite cafes • {favoriteMenuItemIds.length} favorite drinks
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#5D4037" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{CAFFIO_APP_NAME}</Text>
      <Text style={styles.subtitle}>Discover the best local coffee shops nearby</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Finding coffee shops...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCoffeeShops}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={coffeeShops}
            renderItem={renderCoffeeShopCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth * 0.9}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            style={styles.flatList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4E342E',
  },
  favoritesSummary: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEBE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    marginLeft: 4,
    color: '#5D4037',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#795548',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: '#A1887F',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  favoriteIndicator: {
    marginLeft: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#5D4037',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 6,
  },
  cardDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#8D6E63',
    marginLeft: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6D4C41',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4037',
    marginRight: 4,
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  certifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 2,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#795548',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});