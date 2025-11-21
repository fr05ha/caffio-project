import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { baseTheme } from '../../theme';

type AuthMode = 'login' | 'signup';

interface AuthScreenProps {
  loading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
}

const featureHighlights = ['Save favorite drinks', 'Track loyalty perks', 'Exclusive cafe drops'];

export default function AuthScreen({ loading, onLogin, onSignup }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password || (mode === 'signup' && !name.trim())) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      if (mode === 'login') {
        await onLogin(email.trim().toLowerCase(), password);
      } else {
        await onSignup(name.trim(), email.trim().toLowerCase(), password);
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <LinearGradient colors={[baseTheme.palette.peach, baseTheme.palette.lilac]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Image source={require('../../assets/caffio-logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.brandLine}>Brewed for explorers</Text>
          <Text style={styles.heroTitle}>Sip the city smarter</Text>
          <Text style={styles.heroSubtitle}>Discover independent cafes, favorite drinks, and perks—all in one pour.</Text>
          <View style={styles.featurePills}>
            {featureHighlights.map((feature) => (
              <View key={feature} style={styles.pill}>
                <Text style={styles.pillText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to pick up where you left off.'
              : 'Sign up to unlock curated cafe drops & rewards.'}
          </Text>

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Janet Brewster"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#BCAAA4"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#BCAAA4"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#BCAAA4"
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleTextBold}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 70, android: 40 }),
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  brandLine: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginTop: 8,
    maxWidth: 320,
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E1E15',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6D4C41',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D4C41',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4E342E',
  },
  button: {
    backgroundColor: baseTheme.palette.brandBrown,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#8D6E63',
  },
  toggleTextBold: {
    fontWeight: '700',
    color: '#5D4037',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
});

