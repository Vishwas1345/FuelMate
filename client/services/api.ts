const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  _id: string; // Mongoose ID
  name: string;
  email: string;
  role: 'customer' | 'station' | 'admin';
  phone?: string;
  avatar?: string;
  isProfileComplete?: boolean;
  createdAt?: string;

  // Customer Fields
  dob?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  addresses?: {
    label: string;
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark?: string;
  }[];
  vehicles?: {
    type: 'car' | 'bike' | 'truck' | 'other';
    model: string;
    plateNumber: string;
  }[];

  // Station Fields
  businessName?: string;
  businessPhone?: string;
  gstNumber?: string;
  fuelProvider?: string;
  pumpLocation?: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  trucksNeeded?: number;
  driversNeeded?: number;
  isAvailable?: boolean;
  about?: string;
  history?: string;
  startingYear?: number;
  fuelPrices?: {
    petrol: number;
    diesel: number;
  };

  // Legacy/Compatibility
  id?: string;
  address?: string;
};

export type Review = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  stationId: string;
  comment: string;
  rating: number;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
  message: string;
};

export type Order = {
  _id: string;
  id?: string;  // For window.orderSystem compatibility
  userId: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  deliveryAddress: string;
  fuelType: string;
  quantity: number;
  brand: string;
  price: number;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  timestamp?: Date;  // For window.orderSystem compatibility
  driver?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  [key: string]: any;  // Allow additional properties
};

// API class
class Api {
  private static instance: Api;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() { }

  static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  private async fetch(url: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');

    const defaultOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(`${BASE_URL}${url}`, defaultOptions);

      // Handle 401 with token refresh — but ONLY for protected endpoints.
      // Auth endpoints like /login and /register return 401 for bad credentials,
      // NOT for expired tokens, so we must NOT silently retry them.
      const isAuthEndpoint = url.startsWith('/api/auth/login') ||
        url.startsWith('/api/auth/register');

      if (response.status === 401 && !isAuthEndpoint) {
        if (url === '/api/auth/refresh-token') {
          // If refresh token request itself fails, clear session and give up
          this.handleLogout();
          throw new Error('Session expired. Please login again.');
        }

        // Try to silently refresh the access token
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry the original request with the fresh token and parse JSON properly
          const retryOptions = {
            ...defaultOptions,
            headers: {
              ...defaultOptions.headers as Record<string, string>,
              'Authorization': `Bearer ${newToken}`
            }
          };
          const retryResponse = await fetch(`${BASE_URL}${url}`, retryOptions);
          const retryContentType = retryResponse.headers.get("content-type");
          if (retryContentType && retryContentType.includes("application/json")) {
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) throw new Error(retryData.message || 'Request failed');
            return retryData;
          }
          if (!retryResponse.ok) throw new Error('Request failed');
          return null;
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Request failed');
        }
        return data;
      }

      if (!response.ok) {
        throw new Error('Request failed');
      }

      return null;
    } catch (error: any) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for the refresh to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      // Send the stored refresh token in the body as a fallback
      // (the server also accepts it from the HTTP-only cookie — whichever is present wins)
      const storedRefreshToken = localStorage.getItem('refreshToken');

      const response = await this.fetch('/api/auth/refresh-token', {
        method: 'POST',
        body: storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined
      });

      const newToken = response.token;
      localStorage.setItem('token', newToken);

      // If the server issued a new refresh token, persist it
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Notify subscribers with new token
      this.refreshSubscribers.forEach(cb => cb(newToken));
      this.refreshSubscribers = [];

      return newToken;
    } catch (error) {
      this.handleLogout();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth';
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    localStorage.setItem('token', response.token);
    // Store refresh token as fallback for when cookie is not available
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.fetch('/api/auth/logout', {
        method: 'POST'
      });
    } finally {
      this.handleLogout();
    }
  }

  async getProfile(): Promise<User> {
    return this.fetch('/api/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await this.fetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      // Update the stored user data
      const updatedUser = {
        ...response,
        id: response._id || response.id // Handle both _id and id formats
      };

      // If we got a new token in the response, update it
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      return updatedUser;
    } catch (error: any) {
      // If it's an auth error, try to refresh the token and retry
      if (error.message.includes('unauthorized') || error.message.includes('invalid token')) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry the update with the new token
          return this.updateProfile(data);
        }
      }
      throw error;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.fetch('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // Order methods
  async createOrder(orderData: any): Promise<Order> {
    return this.fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async createPetrolOrder(orderData: any): Promise<Order> {
    return this.fetch('/api/orders/petrol', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async createDieselOrder(orderData: any): Promise<Order> {
    return this.fetch('/api/orders/diesel', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.fetch('/api/orders');
  }

  async updateOrderStatus(orderId: string, status: string, driver?: any): Promise<Order> {
    return this.fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, driver })
    });
  }

  // Review methods
  async getStationReviews(stationId: string): Promise<Review[]> {
    return this.fetch(`/api/reviews/station/${stationId}`);
  }

  async createStationReview(stationId: string, comment: string, rating: number): Promise<Review> {
    return this.fetch(`/api/reviews/station/${stationId}`, {
      method: 'POST',
      body: JSON.stringify({ comment, rating })
    });
  }

  async getStations(): Promise<User[]> {
    return this.fetch('/api/users/stations');
  }
}

export const api = Api.getInstance(); 