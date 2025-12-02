# Stripe Payment Integration Setup

This project uses Stripe for test payments only. Follow these steps to set up Stripe:

## Backend Setup

1. **Get Stripe Test Keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_...`)

2. **Add to Backend Environment:**
   - In `apps/backend/.env` or Render environment variables, add:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   ```

3. **Update Payments Service:**
   - The service is already configured to use test mode
   - Located in `apps/backend/src/payments/payments.service.ts`

## Mobile App Setup

1. **Get Stripe Publishable Key:**
   - From the same Stripe dashboard, copy your **Publishable key** (starts with `pk_test_...`)

2. **Update App.tsx:**
   - In `Mobile_App/App.tsx`, replace the placeholder:
   ```typescript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';
   ```

## Test Cards

Use these test card numbers for testing (any future expiry date, any CVC):

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

## Payment Flow

1. User adds items to cart
2. User clicks "Place Order"
3. User selects order type (Dine In, Take Away, Delivery)
4. Payment sheet appears
5. User enters test card details
6. Payment is processed
7. Order is created with payment status

## Important Notes

- **All payments are in TEST MODE only**
- No real money will be charged
- Use test cards only
- Payment status is stored in the `Order` model (`paymentIntentId`, `paymentStatus`)

