import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { authApi, Cafe } from '../../services/api';

interface LoginPageProps {
  onLogin: (cafe: Cafe) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#f59e0b';
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || '#d97706';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(to bottom right, ${primaryColor}15, ${secondaryColor}25)` }}>
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--primary-color, #f59e0b)' }}>
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-center mb-2">CoffeeGo Admin</h1>
          <p className="text-gray-600 text-center">Sign in to manage your coffee shop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-amber-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Admin accounts:</p>
          <p className="text-sm">admin1@caffio.com / Admin123!</p>
          <p className="text-sm">admin2@caffio.com / Admin456!</p>
          <p className="text-sm">admin3@caffio.com / Admin789!</p>
        </div>
      </Card>
    </div>
  );
}
