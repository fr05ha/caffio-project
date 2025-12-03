import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Store, Clock, DollarSign, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { api, Cafe, BusinessHours } from '../../services/api';

interface SettingsPageProps {
  cafeId: number | null;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function isCafeOpen(businessHours: BusinessHours | null | undefined): boolean {
  if (!businessHours || typeof businessHours !== 'object') {
    return false;
  }

  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const dayHours = businessHours[dayName];

  if (!dayHours || !dayHours.enabled) {
    return false;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime < closeTime;
}

export function SettingsPage({ cafeId }: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(() => {
    const defaultHours: BusinessHours = {} as BusinessHours;
    DAYS.forEach(day => {
      defaultHours[day] = { open: '08:00', close: '20:00', enabled: true };
    });
    return defaultHours;
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [acceptOrders, setAcceptOrders] = useState(true);
  
  const [deliveryFee, setDeliveryFee] = useState('2.99');
  const [minOrder, setMinOrder] = useState('10.00');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Load cafe data on mount
  useEffect(() => {
    if (!cafeId) return;
    
    async function loadCafeData() {
      setLoading(true);
      try {
        const cafe = await api.getCafe(cafeId);
        setShopName(cafe.name || '');
        setShopDescription(cafe.description || '');
        setShopPhone(cafe.phone || '');
        setShopEmail(cafe.email || '');
        setShopAddress(cafe.address || '');
        setProfileImageUrl(cafe.profileImageUrl || '');
        if (cafe.businessHours) {
          setBusinessHours(cafe.businessHours);
        }
        if (cafe.isOpen !== undefined) {
          setIsOpen(cafe.isOpen);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load cafe data');
      } finally {
        setLoading(false);
      }
    }
    
    loadCafeData();
  }, [cafeId]);

  // Update isOpen status based on business hours
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(isCafeOpen(businessHours));
    }, 60000); // Check every minute

    setIsOpen(isCafeOpen(businessHours));
    return () => clearInterval(interval);
  }, [businessHours]);

  const handleSaveShopInfo = async () => {
    if (!cafeId) {
      toast.error('No cafe selected');
      return;
    }

    setSaving(true);
    try {
      await api.updateCafe(cafeId, {
        name: shopName,
        address: shopAddress,
        phone: shopPhone,
        email: shopEmail,
        description: shopDescription,
        profileImageUrl: profileImageUrl || undefined,
      });
      toast.success('Shop information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shop information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusinessHours = async () => {
    if (!cafeId) {
      toast.error('No cafe selected');
      return;
    }

    setSaving(true);
    try {
      await api.updateCafe(cafeId, {
        businessHours,
      });
      toast.success('Business hours updated successfully');
      setIsOpen(isCafeOpen(businessHours)); // Update status immediately
    } catch (error: any) {
      toast.error(error.message || 'Failed to update business hours');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDelivery = () => {
    toast.success('Delivery settings updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated');
  };

  if (!cafeId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Please log in to manage your cafe settings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading cafe settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="mb-2">Settings</h1>
        <p className="text-gray-600">Manage your shop settings and preferences</p>
      </div>

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shop">Shop Information</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Shop Information */}
        <TabsContent value="shop">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>Shop Information</h2>
                <p className="text-gray-600">Update your shop's basic information</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profile-image">Profile Picture URL</Label>
                <div className="mt-1 space-y-2">
                  <Input
                    id="profile-image"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  {profileImageUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={profileImageUrl}
                        alt="Profile preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter a URL to an image that will be displayed as your cafe's profile picture in the mobile app
                </p>
              </div>

              <div>
                <Label htmlFor="shop-description">Description</Label>
                <Textarea
                  id="shop-description"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop-phone">Phone Number</Label>
                  <Input
                    id="shop-phone"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              <div>
                <Label htmlFor="shop-email">Email</Label>
                <Input
                  id="shop-email"
                  type="email"
                  value={shopEmail}
                  onChange={(e) => setShopEmail(e.target.value)}
                  placeholder="contact@cafe.com"
                  className="mt-1"
                />
              </div>
              </div>

              <div>
                <Label htmlFor="shop-address">Address</Label>
                <Input
                  id="shop-address"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="shop-open" className="text-base font-semibold">
                    Shop Status: <span className={isOpen ? 'text-green-600' : 'text-red-600'}>
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isOpen 
                      ? 'Your shop is currently open based on business hours'
                      : 'Your shop is currently closed based on business hours'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accept-orders">Accept Online Orders</Label>
                  <p className="text-sm text-gray-600">Enable or disable online ordering</p>
                </div>
                <Switch
                  id="accept-orders"
                  checked={acceptOrders}
                  onCheckedChange={setAcceptOrders}
                />
              </div>

              <Button onClick={handleSaveShopInfo} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>Delivery Settings</h2>
                <p className="text-gray-600">Configure delivery fees and options</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery-fee">Delivery Fee ($)</Label>
                  <Input
                    id="delivery-fee"
                    type="number"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="min-order">Minimum Order ($)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    step="0.01"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery-radius">Delivery Radius (miles)</Label>
                <Input
                  id="delivery-radius"
                  type="number"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">Maximum distance for deliveries</p>
              </div>

              <div>
                <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                <Input
                  id="delivery-time"
                  defaultValue="20-30 min"
                  className="mt-1"
                />
              </div>

              <Button onClick={handleSaveDelivery}>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>Business Hours</h2>
                <p className="text-gray-600">Set your operating hours</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              {DAYS.map((day) => {
                const dayHours = businessHours[day] || { open: '08:00', close: '20:00', enabled: true };
                return (
                  <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-32">
                      <Label>{DAY_LABELS[day]}</Label>
                    </div>
                    <Input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => {
                        setBusinessHours({
                          ...businessHours,
                          [day]: { ...dayHours, open: e.target.value },
                        });
                      }}
                      className="flex-1"
                      disabled={!dayHours.enabled}
                    />
                    <span className="text-gray-600">to</span>
                    <Input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => {
                        setBusinessHours({
                          ...businessHours,
                          [day]: { ...dayHours, close: e.target.value },
                        });
                      }}
                      className="flex-1"
                      disabled={!dayHours.enabled}
                    />
                    <Switch
                      checked={dayHours.enabled}
                      onCheckedChange={(checked) => {
                        setBusinessHours({
                          ...businessHours,
                          [day]: { ...dayHours, enabled: checked },
                        });
                      }}
                    />
                  </div>
                );
              })}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> Your shop is currently{' '}
                  <span className={isOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                  {' '}based on today&apos;s business hours.
                </p>
              </div>
              
              <Button onClick={handleSaveBusinessHours} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Hours'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>Notification Preferences</h2>
                <p className="text-gray-600">Choose how you want to be notified</p>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4">Order Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive order updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive order updates via text message</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>New Orders</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Order Cancellations</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>New Reviews</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Low Stock Alerts</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
