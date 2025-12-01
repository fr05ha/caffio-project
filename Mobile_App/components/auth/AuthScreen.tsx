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
    <LinearGradient 
      colors={['#5D4037', '#6D4C41', '#8D6E63']} 
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Image 
            source={require('../../assets/caffio-logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.brandName}>Caffio</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'login' ? 'Welcome' : 'Join Us'}</Text>

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
              {mode === 'login' ? "New here? " : 'Have an account? '}
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
    paddingHorizontal: 32,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D4C41',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#3E2723',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#5D4037',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleButton: {
    marginTop: 24,
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

