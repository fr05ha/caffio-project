const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await res.text().catch(() => '');
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
  return res.json() as Promise<T>;
}

export type BusinessHours = {
  [key: string]: {
    open: string;
    close: string;
    enabled: boolean;
  };
};

export type Cafe = {
  id: number;
  name: string;
  description?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  lat?: number | null;
  lon?: number | null;
  imageUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  profileImageUrl?: string | null;
  theme?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  businessHours?: BusinessHours | null;
  isOpen?: boolean;
};

export type MenuItemDto = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  imageUrl?: string | null;
  category?: string | null;
};

export type MenuDto = {
  id: number;
  name?: string | null;
  cafeId: number;
  items: MenuItemDto[];
};

export type ReviewDto = {
  id: number;
  cafeId: number;
  customerId?: number | null;
  customerName?: string | null;
  rating: number;
  text?: string | null;
  createdAt: string;
  customer?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;
};

export type OrderItemDto = {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  name: string;
  description?: string | null;
};

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

export type OrderDto = {
  id: number;
  customerId: number;
  cafeId: number;
  status: 'pending' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
  orderType: OrderType;
  total: number;
  deliveryAddress?: string | null;
  customerPhone?: string | null;
  customerName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  cafe?: Cafe;
  customer?: {
    id: number;
    name?: string | null;
    email: string;
  };
};

export const api = {
  // Cafes
  listCafes(): Promise<Cafe[]> {
    return http('/cafes');
  },
  getCafe(id: number): Promise<Cafe & { menus: MenuDto[]; reviews: ReviewDto[] }> {
    return http(`/cafes/${id}`);
  },
  updateCafe(id: number, data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    profileImageUrl?: string;
    theme?: string;
    businessHours?: BusinessHours;
  }): Promise<Cafe> {
    return http(`/cafes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  // Menus
  getMenusByCafe(cafeId: number): Promise<MenuDto[]> {
    return http(`/menus/${cafeId}`);
  },
  createMenu(data: { cafeId: number; name?: string }): Promise<MenuDto> {
    return http('/menus', { method: 'POST', body: JSON.stringify(data) });
  },
  addMenuItem(data: { menuId: number; name: string; description?: string; price: number; currency?: string; imageUrl?: string }): Promise<MenuItemDto> {
    return http('/menus/items', { method: 'POST', body: JSON.stringify(data) });
  },
  updateMenuItem(id: number, data: { name?: string; description?: string; price?: number; currency?: string; imageUrl?: string }): Promise<MenuItemDto> {
    return http(`/menus/items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteMenuItem(id: number): Promise<void> {
    return http(`/menus/items/${id}`, { method: 'DELETE' });
  },

  // Reviews
  getReviewsByCafe(cafeId: number): Promise<ReviewDto[]> {
    return http(`/reviews/${cafeId}`);
  },
  createReview(data: { cafeId: number; rating: number; text?: string }): Promise<ReviewDto> {
    return http('/reviews', { method: 'POST', body: JSON.stringify(data) });
  },

  // Orders
  getOrdersByCafe(cafeId: number): Promise<OrderDto[]> {
    return http(`/orders?cafeId=${cafeId}`);
  },
  getOrderById(orderId: number): Promise<OrderDto> {
    return http(`/orders/${orderId}`);
  },
  updateOrderStatus(orderId: number, status: string): Promise<OrderDto> {
    return http(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
};

export type LoginResponse = {
  user: {
    id: number;
    email: string;
    cafeId: number;
  };
  cafe: Cafe;
};

export type SignupData = {
  email: string;
  password: string;
  cafeName: string;
  address?: string;
  lat?: number;
  lon?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  theme?: string;
  phone?: string;
  cafeEmail?: string;
  description?: string;
};

export const authApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return http('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  signup(data: SignupData): Promise<LoginResponse> {
    return http('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  },
};
