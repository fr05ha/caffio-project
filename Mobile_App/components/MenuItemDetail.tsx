import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../services/api';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { baseTheme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomizationOption {
  id: string;
  name: string;
  price?: number;
}

interface CustomizationGroup {
  id: string;
  title: string;
  required: boolean;
  options: CustomizationOption[];
  selected?: string; // selected option id
}

interface MenuItemDetailProps {
  item: MenuItem;
  cafeName: string;
  onBack: () => void;
  onAddToCart: (item: MenuItem, customizations: Record<string, string>, totalPrice: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

// Default customization options
const MILK_OPTIONS: CustomizationOption[] = [
  { id: 'whole', name: 'Whole Milk', price: 0 },
  { id: 'skim', name: 'Skim Milk', price: 0 },
  { id: 'oat', name: 'Oat Milk', price: 0.5 },
  { id: 'almond', name: 'Almond Milk', price: 0.5 },
  { id: 'soy', name: 'Soy Milk', price: 0.5 },
  { id: 'coconut', name: 'Coconut Milk', price: 0.5 },
  { id: 'none', name: 'No Milk', price: 0 },
];

const SIZE_OPTIONS: CustomizationOption[] = [
  { id: 'small', name: 'Small', price: 0 },
  { id: 'medium', name: 'Medium', price: 1.0 },
  { id: 'large', name: 'Large', price: 2.0 },
];

const SUGAR_OPTIONS: CustomizationOption[] = [
  { id: 'none', name: 'No Sugar', price: 0 },
  { id: 'half', name: 'Half Sugar', price: 0 },
  { id: 'normal', name: 'Normal Sugar', price: 0 },
  { id: 'extra', name: 'Extra Sugar', price: 0 },
];

const ICE_OPTIONS: CustomizationOption[] = [
  { id: 'none', name: 'No Ice', price: 0 },
  { id: 'light', name: 'Light Ice', price: 0 },
  { id: 'normal', name: 'Normal Ice', price: 0 },
  { id: 'extra', name: 'Extra Ice', price: 0 },
];

export default function MenuItemDetail({
  item,
  cafeName,
  onBack,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
}: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1);
  
  // Determine which customizations to show based on item name/description
  const isCoffee = item.name.toLowerCase().includes('coffee') || 
                   item.name.toLowerCase().includes('latte') ||
                   item.name.toLowerCase().includes('cappuccino') ||
                   item.name.toLowerCase().includes('espresso') ||
                   item.name.toLowerCase().includes('americano') ||
                   item.name.toLowerCase().includes('mocha');

  const [customizations, setCustomizations] = useState<Record<string, string>>({
    size: 'medium',
    milk: isCoffee ? 'whole' : undefined,
    sugar: isCoffee ? 'normal' : undefined,
    ice: item.name.toLowerCase().includes('iced') || item.name.toLowerCase().includes('cold') ? 'normal' : undefined,
  });

  const customizationGroups: CustomizationGroup[] = [
    {
      id: 'size',
      title: 'Size',
      required: true,
      options: SIZE_OPTIONS,
      selected: customizations.size,
    },
    ...(isCoffee ? [{
      id: 'milk',
      title: 'Milk Type',
      required: false,
      options: MILK_OPTIONS,
      selected: customizations.milk,
    }] : []),
    ...(isCoffee ? [{
      id: 'sugar',
      title: 'Sugar',
      required: false,
      options: SUGAR_OPTIONS,
      selected: customizations.sugar,
    }] : []),
    ...(customizations.ice !== undefined ? [{
      id: 'ice',
      title: 'Ice',
      required: false,
      options: ICE_OPTIONS,
      selected: customizations.ice,
    }] : []),
  ].map((group) => ({
    ...group,
    selected: customizations[group.id],
  }));

  const calculateTotalPrice = (): number => {
    let total = item.price;
    
    customizationGroups.forEach((group) => {
      if (group.selected) {
        const option = group.options.find((opt) => opt.id === group.selected);
        if (option && option.price) {
          total += option.price;
        }
      }
    });

    return total * quantity;
  };

  const handleCustomizationChange = (groupId: string, optionId: string) => {
    Haptics.selectionAsync();
    setCustomizations((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  const handleQuantityChange = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const totalPrice = calculateTotalPrice();
    onAddToCart(item, customizations, totalPrice);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.imageUrl || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {onToggleFavorite && (
              <TouchableOpacity onPress={onToggleFavorite} style={styles.favoriteButton}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Item Info Overlay */}
          <View style={styles.infoOverlay}>
            <Text style={styles.cafeName}>{cafeName}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
            <Text style={styles.basePrice}>${item.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Customization Section */}
        <View style={styles.customizationSection}>
          {customizationGroups.map((group) => (
            <View key={group.id} style={styles.customizationGroup}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.required && (
                  <Text style={styles.requiredLabel}>Required</Text>
                )}
              </View>
              <View style={styles.optionsContainer}>
                {group.options.map((option) => {
                  const isSelected = group.selected === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleCustomizationChange(group.id, option.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.name}
                      </Text>
                      {option.price !== undefined && option.price > 0 && (
                        <Text
                          style={[
                            styles.optionPrice,
                            isSelected && styles.optionPriceSelected,
                          ]}
                        >
                          +${option.price.toFixed(2)}
                        </Text>
                      )}
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={baseTheme.palette.brandBrown} style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Ionicons name="remove" size={24} color={baseTheme.palette.brandBrown} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Ionicons name="add" size={24} color={baseTheme.palette.brandBrown} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <LinearGradient
            colors={[baseTheme.palette.brandBrown, baseTheme.palette.brandBrownDark]}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  cafeName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '500',
  },
  itemName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 22,
  },
  basePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customizationSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  customizationGroup: {
    marginBottom: 32,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  requiredLabel: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 100,
  },
  optionButtonSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: baseTheme.palette.brandBrown,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
    flex: 1,
  },
  optionTextSelected: {
    color: baseTheme.palette.brandBrown,
  },
  optionPrice: {
    fontSize: 13,
    color: '#8D6E63',
    marginLeft: 8,
  },
  optionPriceSelected: {
    color: baseTheme.palette.brandBrown,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  quantitySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quantityLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  priceContainer: {
    flex: 1,
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  addButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

