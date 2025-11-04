// API service for Caff.io mobile app
const API_BASE_URL = 'http://localhost:3000';

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
}

export interface Review {
  id: number;
  cafeId: number;
  rating: number;
  text?: string;
  createdAt: string;
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
        throw new Error(`HTTP error! status: ${response.status}`);
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

  async addMenuItem(menuId: number, name: string, description?: string, price: number, currency?: string): Promise<MenuItem> {
    return this.request<MenuItem>('/menus/items', {
      method: 'POST',
      body: JSON.stringify({ menuId, name, description, price, currency }),
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
}

export const apiService = new ApiService();
export default apiService;
