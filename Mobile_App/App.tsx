import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type definitions
interface CoffeeShop {
  id: string;
  name: string;
  distance: string;
  address: string;
  rating: number;
  image?: string;
  description?: string;
  priceRange?: string;
  isOpen?: boolean;
}

const CAFFIO_APP_NAME = "Caff.io";

const DUMMY_SHOPS: CoffeeShop[] = [
  {
    id: '1',
    name: "Bean There",
    distance: "200m",
    address: "123 Main St",
    rating: 4.7,
    description: "Artisanal coffee with locally sourced beans",
    priceRange: "$$",
    isOpen: true,
  },
  {
    id: '2',
    name: "Brew Crew",
    distance: "450m",
    address: "456 Oak Ave",
    rating: 4.5,
    description: "Cozy atmosphere with specialty drinks",
    priceRange: "$",
    isOpen: true,
  },
  {
    id: '3',
    name: "Coffee Commune",
    distance: "700m",
    address: "789 Maple Blvd",
    rating: 4.9,
    description: "Premium coffee experience with expert baristas",
    priceRange: "$$$",
    isOpen: false,
  },
  {
    id: '4',
    name: "Morning Glory",
    distance: "1.2km",
    address: "321 Pine Street",
    rating: 4.3,
    description: "Fresh pastries and organic coffee",
    priceRange: "$$",
    isOpen: true,
  },
  {
    id: '5',
    name: "Espresso Express",
    distance: "800m",
    address: "654 Elm Drive",
    rating: 4.6,
    description: "Quick service with quality coffee",
    priceRange: "$",
    isOpen: true,
  }
];

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const flatListRef = useRef<FlatList<CoffeeShop>>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setCoffeeShops(DUMMY_SHOPS);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const renderCoffeeShopCard = ({ item }: { item: CoffeeShop }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.distance} away, rating ${item.rating} stars`}
      accessibilityHint="Tap to view coffee shop details"
    >
      <View style={styles.card}>
        {/* Header with status indicator */}
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Shop name and distance */}
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardDistance}>
          <Ionicons name="location-outline" size={14} color="#8D6E63" />
          <Text style={styles.distanceText}>{item.distance} • {item.address}</Text>
        </View>

        {/* Description */}
        <Text style={styles.cardDescription}>{item.description}</Text>

        {/* Footer with price range */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceRange}>{item.priceRange}</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#5D4037" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{CAFFIO_APP_NAME}</Text>
      <Text style={styles.subtitle}>Discover the best local coffee shops nearby</Text>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Finding coffee shops...</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={coffeeShops}
            renderItem={renderCoffeeShopCard}
            keyExtractor={(item) => item.id}
            horizontal={true}
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
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#5D4037",
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#8D6E63",
    marginBottom: 30,
    textAlign: "center",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    color: "#795548",
    fontSize: 16,
  },
  carouselContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
  },
  carouselContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  flatList: {
    flex: 1,
  },
  cardContainer: {
    width: screenWidth * 0.85,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#A1887F",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#5D4037",
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3E2723",
    marginBottom: 6,
  },
  cardDistance: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 14,
    color: "#8D6E63",
    marginLeft: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: "#6D4C41",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRange: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5D4037",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5D4037",
    marginRight: 4,
  },
});