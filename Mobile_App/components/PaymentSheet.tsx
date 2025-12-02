import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { apiService } from '../services/api';

interface PaymentSheetProps {
  amount: number;
  currency?: string;
  orderId?: number;
  customerId?: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  visible: boolean;
}

export default function PaymentSheet({
  amount,
  currency = 'usd',
  orderId,
  customerId,
  onSuccess,
  onCancel,
  visible,
}: PaymentSheetProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && amount > 0) {
      initializePayment();
    }
  }, [visible, amount]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const { clientSecret: secret, paymentIntentId: intentId } = await apiService.createPaymentIntent({
        amount,
        currency,
        orderId,
        customerId,
      });
      setClientSecret(secret);
      setPaymentIntentId(intentId);

      if (!secret) {
        Alert.alert('Error', 'Failed to get payment intent');
        setLoading(false);
        return;
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: secret,
        merchantDisplayName: 'Caffio',
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      Alert.alert('Error', error.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'Payment not initialized');
      return;
    }

    try {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Failed', error.message);
        setLoading(false);
        return;
      }

      // Payment succeeded
      if (paymentIntentId) {
        setLoading(false);
        onSuccess(paymentIntentId);
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Payment</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        <Text style={styles.subtitle}>Test Mode - Use test card: 4242 4242 4242 4242</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#5D4037" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={!clientSecret}>
              <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 24,
  },
  loader: {
    marginVertical: 20,
  },
  payButton: {
    backgroundColor: '#5D4037',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8D6E63',
    fontSize: 16,
    fontWeight: '600',
  },
});

