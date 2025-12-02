import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    // Use test mode - get from environment variable
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.warn('STRIPE_SECRET_KEY not set. Payment features will not work. Set it in your .env file or environment variables.');
      // Initialize with a dummy key to prevent crashes, but methods will fail gracefully
      this.stripe = new Stripe('sk_test_placeholder', {
        apiVersion: '2025-11-17.clover',
      });
      return;
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please set it in your environment variables.');
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }
}

