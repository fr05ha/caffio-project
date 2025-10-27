import { DeliveryDriver, Order } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Phone, Star, Truck, MapPin } from 'lucide-react';

interface DeliveryPageProps {
  drivers: DeliveryDriver[];
  orders: Order[];
}

export function DeliveryPage({ drivers, orders }: DeliveryPageProps) {
  const activeDeliveries = orders.filter(o => o.status === 'on_the_way');
  const readyForPickup = orders.filter(o => o.status === 'ready');

  const getStatusColor = (status: DeliveryDriver['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="mb-2">Delivery Management</h1>
        <p className="text-gray-600">Monitor delivery drivers and active deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>{activeDeliveries.length}</h2>
              <p className="text-gray-600">Active Deliveries</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>{readyForPickup.length}</h2>
              <p className="text-gray-600">Ready for Pickup</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>{drivers.filter(d => d.status === 'available').length}</h2>
              <p className="text-gray-600">Available Drivers</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drivers */}
        <div>
          <h2 className="mb-4">Delivery Drivers</h2>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <Card key={driver.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                    <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="mb-1">{driver.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(driver.status)} text-white`}>
                        {driver.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {driver.rating.toFixed(1)}
                      </div>
                      <div>
                        {driver.totalDeliveries} deliveries
                      </div>
                      {driver.currentOrders > 0 && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {driver.currentOrders} active
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Deliveries */}
        <div>
          <h2 className="mb-4">Active Deliveries</h2>
          <div className="space-y-4">
            {activeDeliveries.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1">{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <Badge className="bg-purple-500 text-white">
                      On the way
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Delivery Address:</p>
                    <p className="flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {order.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span>Total: ${order.total.toFixed(2)}</span>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {activeDeliveries.length === 0 && (
              <Card className="p-12 text-center">
                <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="mb-2">No active deliveries</h3>
                <p className="text-gray-600">Deliveries will appear here when drivers are on the way</p>
              </Card>
            )}
          </div>

          {readyForPickup.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-4">Ready for Pickup ({readyForPickup.length})</h2>
              <div className="space-y-2">
                {readyForPickup.map((order) => (
                  <Card key={order.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <Button size="sm">Assign Driver</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
