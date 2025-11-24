// API service for the Caffio mobile app
// Use your Mac's local IP for Expo Go on physical device
// For iOS Simulator, use 'http://localhost:3000'
const API_BASE_URL = 'https://caffio-project.onrender.com';

export interface Cafe {
  id: number;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  ratingAvg: number;
  ratingCount: number;
  isCertified: boolean;
  createdAt: string;
  logoUrl?: string;
  imageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface Menu {
  id: number;
  cafeId: number;
  name: string;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  menuId: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
}

export interface Review {
  id: number;
  cafeId: number;
  rating: number;
  text?: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  name?: string | null;
  email: string;
  favoriteCafes?: Cafe[];
  favoriteMenuItems?: MenuItem[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, try text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // Ignore
          }
        }
        console.error(`API request failed for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url,
        });
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Cafes API
  async getCafes(): Promise<Cafe[]> {
    return this.request<Cafe[]>('/cafes');
  }

  async getCafesNearby(lat: number, lon: number): Promise<Cafe[]> {
    return this.request<Cafe[]>(`/cafes?lat=${lat}&lon=${lon}`);
  }

  async getCafeById(id: number): Promise<Cafe & { menus: Menu[]; reviews: Review[] }> {
    return this.request<Cafe & { menus: Menu[]; reviews: Review[] }>(`/cafes/${id}`);
  }

  // Menus API
  async getMenusByCafeId(cafeId: number): Promise<Menu[]> {
    return this.request<Menu[]>(`/menus/${cafeId}`);
  }

  async createMenu(cafeId: number, name?: string): Promise<Menu> {
    return this.request<Menu>('/menus', {
      method: 'POST',
      body: JSON.stringify({ cafeId, name }),
    });
  }

  async addMenuItem(data: { menuId: number; name: string; price: number; description?: string; currency?: string }): Promise<MenuItem> {
    return this.request<MenuItem>('/menus/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reviews API
  async getReviewsByCafeId(cafeId: number): Promise<Review[]> {
    return this.request<Review[]>(`/reviews/${cafeId}`);
  }

  async createReview(cafeId: number, rating: number, text?: string): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ cafeId, rating, text }),
    });
  }

  // Customer Auth
  async customerSignup(data: { name?: string; email: string; password: string }): Promise<Customer> {
    return this.request<Customer>('/customers/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async customerLogin(email: string, password: string): Promise<Customer> {
    return this.request<Customer>('/customers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCustomerProfile(id: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async addFavoriteCafe(customerId: number, cafeId: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}/favorites/cafes`, {
      method: 'POST',
      body: JSON.stringify({ cafeId }),
    });
  }

  async removeFavoriteCafe(customerId: number, cafeId: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}/favorites/cafes/${cafeId}`, {
      method: 'DELETE',
    });
  }

  async addFavoriteMenuItem(customerId: number, menuItemId: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}/favorites/menu-items`, {
      method: 'POST',
      body: JSON.stringify({ menuItemId }),
    });
  }

  async removeFavoriteMenuItem(customerId: number, menuItemId: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}/favorites/menu-items/${menuItemId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
