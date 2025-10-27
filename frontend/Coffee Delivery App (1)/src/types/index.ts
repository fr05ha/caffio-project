export interface CoffeeShop {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  distance: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  shopId: string;
  shopName: string;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
  orderTime: string;
  deliveryAddress: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
}

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentOrders: number;
  rating: number;
  totalDeliveries: number;
}
