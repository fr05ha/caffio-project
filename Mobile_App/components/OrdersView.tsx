import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { apiService, Order } from '../services/api';
import { baseTheme } from '../theme';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface OrdersViewProps {
  customerId: number;
  onBack: () => void;
}

export default function OrdersView({ customerId, onBack }: OrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const previousOrdersRef = useRef<Order[]>([]);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Request notification permissions
    registerForPushNotificationsAsync();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    // Set up app state listener to check for order updates
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, refresh orders
        loadOrders();
      }
      appState.current = nextAppState;
    });

    loadOrders();
    
    // Poll for order updates every 30 seconds
    const pollInterval = setInterval(() => {
      if (AppState.currentState === 'active') {
        loadOrders(true); // Silent refresh
      }
    }, 30000);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      subscription.remove();
      clearInterval(pollInterval);
    };
  }, [customerId]);

  async function registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      // You can send this token to your backend to send notifications
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const customerOrders = await apiService.getOrdersByCustomer(customerId);
      
      // Check for status changes and send notifications
      if (previousOrdersRef.current.length > 0) {
        customerOrders.forEach((newOrder) => {
          const oldOrder = previousOrdersRef.current.find((o) => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            sendStatusChangeNotification(newOrder, oldOrder.status);
          }
        });
      }
      
      previousOrdersRef.current = customerOrders;
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendStatusChangeNotification = async (order: Order, oldStatus: string) => {
    const statusMessages: Record<string, string> = {
      preparing: 'Your order is being prepared!',
      ready: 'Your order is ready for pickup!',
      on_the_way: 'Your order is on the way!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
    };

    const message = statusMessages[order.status] || `Your order status changed to ${order.status}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Order #${order.id} Update`,
        body: message,
        data: { orderId: order.id },
        sound: true,
      },
      trigger: null, // Show immediately
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'preparing':
        return '#2196F3';
      case 'ready':
        return '#4CAF50';
      case 'on_the_way':
        return '#9C27B0';
      case 'delivered':
        return '#757575';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-circle-outline';
      case 'on_the_way':
        return 'bicycle-outline';
      case 'delivered':
        return 'checkmark-done-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(order.status) as any} size={16} color={getStatusColor(order.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {order.cafe && (
                <View style={styles.cafeRow}>
                  <Ionicons name="storefront-outline" size={16} color="#8D6E63" />
                  <Text style={styles.cafeName}>{order.cafe.name}</Text>
                </View>
              )}

              <View style={styles.orderTypeRow}>
                <Ionicons 
                  name={order.orderType === 'DINE_IN' ? 'restaurant' : order.orderType === 'TAKE_AWAY' ? 'bag' : 'car'} 
                  size={16} 
                  color="#8D6E63" 
                />
                <Text style={styles.orderTypeText}>
                  {order.orderType === 'DINE_IN' ? 'Dine In' : order.orderType === 'TAKE_AWAY' ? 'Take Away' : 'Delivery'}
                </Text>
              </View>

              <View style={styles.itemsSection}>
                <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
              </View>

              {order.deliveryAddress && (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={16} color="#8D6E63" />
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5D4037',
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
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#8D6E63',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#BDBDBD',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
  },
  orderDate: {
    fontSize: 12,
    color: '#8D6E63',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  cafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cafeName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  orderTypeText: {
    fontSize: 14,
    color: '#8D6E63',
    fontWeight: '500',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#8D6E63',
    marginRight: 8,
    minWidth: 30,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#5D4037',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#795548',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#8D6E63',
    lineHeight: 18,
  },
});

