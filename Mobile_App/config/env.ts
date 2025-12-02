// Environment configuration
// This file reads environment variables for the mobile app
import Constants from 'expo-constants';

// Get environment variables from app.json extra field or process.env
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Try to get from expo-constants (app.json extra field)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }
  
  // Try to get from process.env (works in some Expo setups)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Fallback to default or throw error
  if (defaultValue) {
    return defaultValue;
  }
  
  throw new Error(`Environment variable ${key} is not set`);
};

export const ENV = {
  STRIPE_PUBLISHABLE_KEY: getEnvVar('stripePublishableKey', 'pk_test_your_publishable_key_here'),
};

