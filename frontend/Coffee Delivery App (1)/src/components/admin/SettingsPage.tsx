import { useState } from 'react';
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

export function SettingsPage() {
  const [shopName, setShopName] = useState('Oh Matcha');
  const [shopDescription, setShopDescription] = useState('Authentic Japanese matcha, desserts, and drinks. Dairy-free options available.');
  const [shopPhone, setShopPhone] = useState('');
  const [shopAddress, setShopAddress] = useState('Shop 11/501 George St, Sydney NSW 2000');
  
  const [deliveryFee, setDeliveryFee] = useState('2.99');
  const [minOrder, setMinOrder] = useState('10.00');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  
  const [isOpen, setIsOpen] = useState(true);
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSaveShopInfo = () => {
    toast.success('Shop information updated successfully');
  };

  const handleSaveDelivery = () => {
    toast.success('Delivery settings updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated');
  };

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
                    defaultValue="contact@brewandbean.com"
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

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shop-open">Shop is Open</Label>
                  <p className="text-sm text-gray-600">Toggle to open/close your shop</p>
                </div>
                <Switch
                  id="shop-open"
                  checked={isOpen}
                  onCheckedChange={setIsOpen}
                />
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

              <Button onClick={handleSaveShopInfo}>Save Changes</Button>
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
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <Label>{day}</Label>
                  </div>
                  <Input type="time" defaultValue="08:00" className="flex-1" />
                  <span className="text-gray-600">to</span>
                  <Input type="time" defaultValue="20:00" className="flex-1" />
                  <Switch defaultChecked />
                </div>
              ))}
              
              <Button>Save Hours</Button>
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
