import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, MapPin, CreditCard, Bell, Heart, LogOut } from 'lucide-react';
import { useState } from 'react';

export function ProfileView() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('123 Main St, Apt 4B, New York, NY 10001');

  const menuItems = [
    { icon: MapPin, label: 'Addresses', count: '3 saved' },
    { icon: CreditCard, label: 'Payment Methods', count: '2 cards' },
    { icon: Bell, label: 'Notifications', count: 'Enabled' },
    { icon: Heart, label: 'Favorites', count: '5 shops' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="mb-1">{name}</h2>
            <p className="text-gray-600">{email}</p>
          </div>
          <Button variant="outline">Edit Photo</Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Default Delivery Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button className="w-full">Save Changes</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p>{item.label}</p>
                  <p className="text-sm text-gray-600">{item.count}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Manage</Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-red-600">Log Out</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
