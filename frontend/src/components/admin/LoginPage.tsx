import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { authApi, Cafe, SignupData } from '../../services/api';
import caffioLogo from '../../assets/caffio-logo.png';

interface LoginPageProps {
  onLogin: (cafe: Cafe) => void;
}

type Mode = 'login' | 'signup';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [cafeName, setCafeName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cafeEmail, setCafeEmail] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8B4513');
  const [secondaryColor, setSecondaryColor] = useState('#D2691E');
  const [accentColor, setAccentColor] = useState('#CD853F');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState('brown');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      toast.success(`Welcome! Managing ${response.cafe.name}`);
      onLogin(response.cafe);
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !cafeName || !address.trim()) {
      toast.error('Please fill in all required fields, including your cafe address');
      return;
    }

    setLoading(true);
    
    try {
      const signupData: SignupData = {
        email,
        password,
        cafeName,
        address: address || undefined,
        phone: phone || undefined,
        cafeEmail: cafeEmail || undefined,
        description: description || undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        logoUrl: logoUrl || undefined,
        theme: theme || undefined,
      };

      const response = await authApi.signup(signupData);
      toast.success(`Welcome! Your cafe "${response.cafe.name}" has been created!`);
      onLogin(response.cafe);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bgPrimaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#f59e0b';
  const bgSecondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || '#d97706';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(to bottom right, ${bgPrimaryColor}15, ${bgSecondaryColor}25)` }}>
      <Card className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 overflow-hidden" style={{ backgroundColor: 'var(--primary-color, #f59e0b)' }}>
            <img src={caffioLogo} alt="Caffio Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-center mb-2">Caffio Admin</h1>
          <p className="text-gray-600 text-center">
            {mode === 'login' ? 'Sign in to manage your coffee shop' : 'Create your cafe profile'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <Button
            type="button"
            variant={mode === 'login' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setMode('login')}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={mode === 'signup' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setMode('signup')}
          >
            Sign Up
          </Button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@coffeeshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signup-email">Email *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="admin@coffeeshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cafe-name">Cafe Name *</Label>
              <Input
                id="cafe-name"
                type="text"
                placeholder="My Coffee Shop"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Cafe Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, Sydney NSW"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll automatically detect the location on the map using this address—no latitude/longitude needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+61 2 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cafe-email">Cafe Contact Email</Label>
                <Input
                  id="cafe-email"
                  type="email"
                  placeholder="contact@cafe.com"
                  value={cafeEmail}
                  onChange={(e) => setCafeEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Cafe Description</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your cafe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Theme Customization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#8B4513"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#D2691E"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#CD853F"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Input
                    id="theme"
                    type="text"
                    placeholder="brown, green, matcha, etc."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {mode === 'login' && (
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-amber-600 hover:underline">
              Forgot password?
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
