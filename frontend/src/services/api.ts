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
  theme?: string | null;
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
  rating: number;
  text?: string | null;
  createdAt: string;
};

export const api = {
  // Cafes
  listCafes(): Promise<Cafe[]> {
    return http('/cafes');
  },
  getCafe(id: number): Promise<Cafe & { menus: MenuDto[]; reviews: ReviewDto[] }> {
    return http(`/cafes/${id}`);
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
};

export const authApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return http('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  signup(data: SignupData): Promise<LoginResponse> {
    return http('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  },
};
