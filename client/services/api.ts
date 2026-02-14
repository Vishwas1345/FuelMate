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
  fuelPrices?: {
    petrol: number;
    diesel: number;
  };

  // Legacy/Compatibility
  id?: string;
  address?: string;
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

      // Handle 401 with token refresh
      if (response.status === 401) {
        if (url === '/api/auth/refresh-token') {
          // If refresh token request fails, logout
          this.handleLogout();
          throw new Error('Session expired. Please login again.');
        }

        // Try to refresh token
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry original request with new token
          defaultOptions.headers = {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${newToken}`
          };
          return await fetch(`${BASE_URL}${url}`, defaultOptions);
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
      const response = await this.fetch('/api/auth/refresh-token', {
        method: 'POST'
      });

      const newToken = response.token;
      localStorage.setItem('token', newToken);

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
    window.location.href = '/auth';
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    localStorage.setItem('token', response.token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('token', response.token);
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

  async getOrders(): Promise<Order[]> {
    return this.fetch('/api/orders');
  }

  async updateOrderStatus(orderId: string, status: string, driver?: any): Promise<Order> {
    return this.fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, driver })
    });
  }
}

export const api = Api.getInstance(); 