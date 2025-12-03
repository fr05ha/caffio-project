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
  SafeAreaView,
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
  icon?: string;
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

// Default customization options with icons
const MILK_OPTIONS: (CustomizationOption & { icon: string })[] = [
  { id: 'whole', name: 'Whole Milk', price: 0, icon: 'water' },
  { id: 'skim', name: 'Skim Milk', price: 0, icon: 'water-outline' },
  { id: 'oat', name: 'Oat Milk', price: 0.5, icon: 'leaf' },
  { id: 'almond', name: 'Almond Milk', price: 0.5, icon: 'nutrition' },
  { id: 'soy', name: 'Soy Milk', price: 0.5, icon: 'flower' },
  { id: 'coconut', name: 'Coconut Milk', price: 0.5, icon: 'tropical' },
  { id: 'none', name: 'No Milk', price: 0, icon: 'close-circle' },
];

const SIZE_OPTIONS: (CustomizationOption & { icon: string })[] = [
  { id: 'small', name: 'Small', price: 0, icon: 'remove-circle-outline' },
  { id: 'medium', name: 'Medium', price: 1.0, icon: 'radio-button-on' },
  { id: 'large', name: 'Large', price: 2.0, icon: 'add-circle-outline' },
];

const SUGAR_OPTIONS: (CustomizationOption & { icon: string })[] = [
  { id: 'none', name: 'No Sugar', price: 0, icon: 'close-circle-outline' },
  { id: 'half', name: 'Half Sugar', price: 0, icon: 'remove-circle-outline' },
  { id: 'normal', name: 'Normal Sugar', price: 0, icon: 'radio-button-on' },
  { id: 'extra', name: 'Extra Sugar', price: 0, icon: 'add-circle-outline' },
];

const ICE_OPTIONS: (CustomizationOption & { icon: string })[] = [
  { id: 'none', name: 'No Ice', price: 0, icon: 'close-circle-outline' },
  { id: 'light', name: 'Light Ice', price: 0, icon: 'snow-outline' },
  { id: 'normal', name: 'Normal Ice', price: 0, icon: 'snow' },
  { id: 'extra', name: 'Extra Ice', price: 0, icon: 'snow' },
];

const TOPPINGS_OPTIONS: (CustomizationOption & { icon: string })[] = [
  { id: 'chocolate', name: 'Chocolate', price: 0.5, icon: 'cube' },
  { id: 'caramel', name: 'Caramel', price: 0.5, icon: 'water' },
  { id: 'vanilla', name: 'Vanilla', price: 0.5, icon: 'flower' },
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
  
  // Use customizations from API if available, otherwise use defaults based on item type
  const hasCustomizations = item.customizations && Object.keys(item.customizations).length > 0;
  const isCoffee = item.category === 'Coffee' || 
                   item.name.toLowerCase().includes('coffee') || 
                   item.name.toLowerCase().includes('latte') ||
                   item.name.toLowerCase().includes('cappuccino') ||
                   item.name.toLowerCase().includes('espresso') ||
                   item.name.toLowerCase().includes('americano') ||
                   item.name.toLowerCase().includes('mocha');

  // Initialize customizations from API or use defaults
  const getInitialCustomizations = (): Record<string, string | undefined> => {
    if (hasCustomizations && item.customizations) {
      const result: Record<string, string | undefined> = {};
      if (item.customizations.size) {
        result.size = item.customizations.size.default || item.customizations.size.options[0] || 'medium';
      }
      if (item.customizations.milk) {
        result.milk = item.customizations.milk.default || item.customizations.milk.options[0] || 'whole';
      }
      if (item.customizations.sugar) {
        result.sugar = item.customizations.sugar.default || item.customizations.sugar.options[0] || 'normal';
      }
      if (item.customizations.ice) {
        result.ice = item.customizations.ice.default || item.customizations.ice.options[0] || 'normal';
      }
      if (item.customizations.toppings) {
        result.toppings = item.customizations.toppings.default || item.customizations.toppings.options[0] || 'none';
      }
      return result;
    }
    // Fallback to defaults
    return {
      size: 'medium',
      milk: isCoffee ? 'whole' : undefined,
      sugar: isCoffee ? 'normal' : undefined,
      ice: item.name.toLowerCase().includes('iced') || item.name.toLowerCase().includes('cold') ? 'normal' : undefined,
    };
  };

  const [customizations, setCustomizations] = useState<Record<string, string | undefined>>(getInitialCustomizations());

  // Build customization groups from API data or use defaults
  const buildCustomizationGroups = (): CustomizationGroup[] => {
    const groups: CustomizationGroup[] = [];
    
    if (hasCustomizations && item.customizations) {
      // Use API customizations
      if (item.customizations.size) {
        groups.push({
          id: 'size',
          title: 'Size',
          required: true,
          options: item.customizations.size.options.map(opt => {
            const defaultOption = SIZE_OPTIONS.find(s => s.name.toLowerCase() === opt.toLowerCase());
            return {
              id: opt.toLowerCase().replace(/\s+/g, '_'),
              name: opt,
              price: defaultOption?.price || 0,
              icon: defaultOption?.icon || 'radio-button-on',
            };
          }),
          selected: customizations.size,
        });
      }
      
      if (item.customizations.milk) {
        groups.push({
          id: 'milk',
          title: 'Milk Type',
          required: false,
          options: item.customizations.milk.options.map(opt => {
            const defaultOption = MILK_OPTIONS.find(m => m.name.toLowerCase().includes(opt.toLowerCase()));
            return {
              id: opt.toLowerCase().replace(/\s+/g, '_'),
              name: opt,
              price: defaultOption?.price || 0,
              icon: defaultOption?.icon || 'water',
            };
          }),
          selected: customizations.milk,
        });
      }
      
      if (item.customizations.sugar) {
        groups.push({
          id: 'sugar',
          title: 'Sugar',
          required: false,
          options: item.customizations.sugar.options.map(opt => {
            const defaultOption = SUGAR_OPTIONS.find(s => s.name.toLowerCase().includes(opt.toLowerCase()));
            return {
              id: opt.toLowerCase().replace(/\s+/g, '_'),
              name: opt,
              price: defaultOption?.price || 0,
              icon: defaultOption?.icon || 'radio-button-on',
            };
          }),
          selected: customizations.sugar,
        });
      }
      
      if (item.customizations.ice) {
        groups.push({
          id: 'ice',
          title: 'Ice',
          required: false,
          options: item.customizations.ice.options.map(opt => {
            const defaultOption = ICE_OPTIONS.find(i => i.name.toLowerCase().includes(opt.toLowerCase()));
            return {
              id: opt.toLowerCase().replace(/\s+/g, '_'),
              name: opt,
              price: defaultOption?.price || 0,
              icon: defaultOption?.icon || 'snow',
            };
          }),
          selected: customizations.ice,
        });
      }
      
      if (item.customizations.toppings) {
        groups.push({
          id: 'toppings',
          title: 'Toppings',
          required: false,
          options: item.customizations.toppings.options.map((opt: string) => {
            const defaultOption = TOPPINGS_OPTIONS.find(t => t.name.toLowerCase().includes(opt.toLowerCase()));
            return {
              id: opt.toLowerCase().replace(/\s+/g, '_'),
              name: opt,
              price: defaultOption?.price || 0,
              icon: defaultOption?.icon || 'cube',
            };
          }),
          selected: customizations.toppings,
        });
      }
    } else {
      // Use default customizations based on item type
      groups.push({
        id: 'size',
        title: 'Size',
        required: true,
        options: SIZE_OPTIONS,
        selected: customizations.size,
      });
      
      if (isCoffee) {
        groups.push({
          id: 'milk',
          title: 'Milk Type',
          required: false,
          options: MILK_OPTIONS,
          selected: customizations.milk,
        });
        
        groups.push({
          id: 'sugar',
          title: 'Sugar',
          required: false,
          options: SUGAR_OPTIONS,
          selected: customizations.sugar,
        });
      }
      
      if (customizations.ice !== undefined) {
        groups.push({
          id: 'ice',
          title: 'Ice',
          required: false,
          options: ICE_OPTIONS,
          selected: customizations.ice,
        });
      }
    }
    
    return groups.map((group) => ({
      ...group,
      selected: customizations[group.id],
    }));
  };

  const customizationGroups = buildCustomizationGroups();

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
    // Filter out undefined values before passing to onAddToCart
    const filteredCustomizations: Record<string, string> = {};
    Object.entries(customizations).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredCustomizations[key] = value;
      }
    });
    onAddToCart(item, filteredCustomizations, totalPrice);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <SafeAreaView style={styles.container}>
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
          </View>
        </View>

        {/* Customization Section */}
        <View style={styles.customizationSection}>
          {customizationGroups.map((group) => {
            // Get icon for customization group
            const getGroupIcon = (groupId: string) => {
              switch (groupId) {
                case 'size':
                  return 'resize-outline';
                case 'milk':
                  return 'water-outline';
                case 'sugar':
                  return 'cube-outline';
                case 'ice':
                  return 'snow-outline';
                default:
                  return 'options-outline';
              }
            };

            return (
              <View key={group.id} style={styles.customizationGroup}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupTitleContainer}>
                    <Ionicons name={getGroupIcon(group.id) as any} size={20} color={baseTheme.palette.brandBrown} style={styles.groupIcon} />
                    <Text style={styles.groupTitle}>{group.title}</Text>
                  </View>
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
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        {option.icon && (
                          <Ionicons
                            name={option.icon as any}
                            size={20}
                            color={isSelected ? baseTheme.palette.brandBrown : '#8D6E63'}
                            style={styles.optionIcon}
                          />
                        )}
                        <View style={styles.optionTextContainer}>
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
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color={baseTheme.palette.brandBrown} style={styles.checkIcon} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            );
          })}
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
            colors={[baseTheme.palette.brandBrown, baseTheme.palette.brandDark]}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    height: Math.min(screenHeight * 0.4, 350),
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
    top: Platform.OS === 'ios' ? 44 : 20,
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
    marginBottom: 40,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    marginRight: 8,
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
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: screenWidth * 0.42,
    maxWidth: screenWidth * 0.45,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonSelected: {
    backgroundColor: '#FFF8F0',
    borderColor: baseTheme.palette.brandBrown,
    borderWidth: 2.5,
    shadowColor: baseTheme.palette.brandBrown,
    shadowOpacity: 0.15,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: baseTheme.palette.brandBrown,
    fontWeight: '700',
  },
  optionPrice: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '500',
  },
  optionPriceSelected: {
    color: baseTheme.palette.brandBrown,
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 8,
  },
  quantitySection: {
    padding: 24,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  quantityButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: baseTheme.palette.brandBrown,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    minWidth: 50,
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

