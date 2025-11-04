import { Order } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
}

const statusConfig = {
  preparing: { label: 'Preparing', icon: Package, color: 'bg-blue-500', progress: 25 },
  ready: { label: 'Ready for Pickup', icon: CheckCircle, color: 'bg-green-500', progress: 50 },
  on_the_way: { label: 'On the Way', icon: Truck, color: 'bg-purple-500', progress: 75 },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-gray-500', progress: 100 },
};

export function OrdersView({ orders }: OrdersViewProps) {
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {activeOrders.length > 0 && (
        <div>
          <h2 className="mb-4">Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.map(order => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              
              return (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="mb-1">{order.shopName}</h3>
                      <p className="text-sm text-gray-600">Order #{order.id}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge className={`${config.color} text-white flex items-center gap-1`}>
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </Badge>
                  </div>

                  <Progress value={config.progress} className="mb-4" />

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Delivery Address:</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pastOrders.length > 0 && (
        <div>
          <h2 className="mb-4">Past Orders</h2>
          <div className="space-y-4">
            {pastOrders.map(order => (
              <Card key={order.id} className="p-6 opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{order.shopName}</h3>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{new Date(order.orderTime).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">Delivered</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No orders yet</p>
          <p className="text-sm">Start ordering from your favorite coffee shops</p>
        </div>
      )}
    </div>
  );
}
