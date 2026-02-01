import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { api, User, AuthResponse, Order } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userOrders: Order[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  createOrder: (orderData: any) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: string, driver?: any) => Promise<Order>;
  loginAsGuest: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await api.getProfile();
        setUser(user);
        setIsAuthenticated(true);
        // Also fetch orders if authenticated
        const orders = await api.getOrders();
        setUserOrders(orders);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });

      setUser(response.user);
      setIsAuthenticated(true);

      // Fetch orders after successful login
      const orders = await api.getOrders();
      setUserOrders(orders);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserOrders([]);
      setIsAuthenticated(false);
      navigate("/auth");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.register({ name, email, password });

      setUser(response.user);
      setIsAuthenticated(true);

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await api.updateProfile(data);

      // Update the local user state with the new data
      setUser(prev => ({
        ...prev,
        ...updatedUser
      }));

      // Ensure we're still marked as authenticated
      setIsAuthenticated(true);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });

      // Optionally refresh orders if needed
      if (data.role || data.id) {
        const orders = await api.getOrders();
        setUserOrders(orders);
      }
    } catch (error: any) {
      // If it's an authentication error, try to refresh the session
      if (error.message.includes('unauthorized') || error.message.includes('invalid token')) {
        try {
          // Try to get the current user profile
          const currentUser = await api.getProfile();
          setUser(currentUser);
          setIsAuthenticated(true);

          // Retry the update
          return updateProfile(data);
        } catch (refreshError) {
          // If refresh fails, then we need to log in again
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          logout();
          return;
        }
      }

      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to place an order');
      }

      const newOrder = await api.createOrder(orderData);

      // Update local orders state
      setUserOrders(prev => [...prev, newOrder]);

      // Sync with window.orderSystem if it exists
      if (window.orderSystem) {
        window.orderSystem.addOrder({
          customer: typeof newOrder.customer === 'object' ? newOrder.customer.name : newOrder.customer,
          fuelType: newOrder.fuelType,
          quantity: newOrder.quantity,
          brand: newOrder.brand,
          price: newOrder.price,
          deliveryAddress: newOrder.deliveryAddress,
          paymentMethod: newOrder.paymentMethod
        });
      }

      return newOrder;
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  };

  const getOrders = async () => {
    try {
      if (user?.role === 'guest') {
        return [];
      }

      const orders = await api.getOrders();
      setUserOrders(orders);

      // Sync with window.orderSystem if it exists
      if (window.orderSystem) {
        window.orderSystem.orders = orders.map(order => ({
          id: order._id,
          status: order.status,
          customer: typeof order.customer === 'object' ? order.customer.name : order.customer,
          fuelType: order.fuelType,
          quantity: order.quantity,
          brand: order.brand,
          price: order.price,
          deliveryAddress: order.deliveryAddress,
          timestamp: new Date(order.createdAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          paymentMethod: order.paymentMethod,
          driver: order.driver ? {
            name: order.driver.name,
            phone: order.driver.phone || '',
            email: order.driver.email || '',
            currentLocation: order.driver.currentLocation
          } : undefined
        }));

        // Update order history for delivered orders
        const deliveredOrders = orders.filter(order => order.status === 'delivered');
        window.orderSystem.orderHistory = deliveredOrders.map(order => ({
          id: order._id,
          status: order.status,
          customer: typeof order.customer === 'object' ? order.customer.name : order.customer,
          fuelType: order.fuelType,
          quantity: order.quantity,
          brand: order.brand,
          price: order.price,
          deliveryAddress: order.deliveryAddress,
          timestamp: new Date(order.createdAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
          paymentMethod: order.paymentMethod,
          driver: order.driver ? {
            name: order.driver.name,
            phone: order.driver.phone || '',
            email: order.driver.email || '',
            currentLocation: order.driver.currentLocation
          } : undefined
        }));

        window.orderSystem.listeners.forEach((callback: () => void) => callback());
      }

      return orders;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
      return [];
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, driver?: any) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, status, driver);

      // Update local orders state
      setUserOrders(prev => prev.map(order =>
        order._id === orderId ? updatedOrder : order
      ));

      // Sync with window.orderSystem
      if (window.orderSystem) {
        const orderIndex = window.orderSystem.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          window.orderSystem.orders[orderIndex] = {
            id: updatedOrder._id,
            status: updatedOrder.status,
            customer: typeof updatedOrder.customer === 'object' ? updatedOrder.customer.name : updatedOrder.customer,
            fuelType: updatedOrder.fuelType,
            quantity: updatedOrder.quantity,
            brand: updatedOrder.brand,
            price: updatedOrder.price,
            deliveryAddress: updatedOrder.deliveryAddress,
            timestamp: new Date(updatedOrder.createdAt),
            estimatedDelivery: updatedOrder.estimatedDelivery ? new Date(updatedOrder.estimatedDelivery) : undefined,
            deliveredAt: updatedOrder.deliveredAt ? new Date(updatedOrder.deliveredAt) : undefined,
            paymentMethod: updatedOrder.paymentMethod,
            driver: updatedOrder.driver ? {
              name: updatedOrder.driver.name,
              phone: updatedOrder.driver.phone || '',
              email: updatedOrder.driver.email || '',
              currentLocation: updatedOrder.driver.currentLocation
            } : undefined
          };

          if (status === 'delivered') {
            window.orderSystem.addToOrderHistory(window.orderSystem.orders[orderIndex]);
          }

          window.orderSystem.listeners.forEach((callback: () => void) => callback());
        }
      }

      return updatedOrder;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      const guestUser = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'guest'
      };

      setUser(guestUser);
      setIsAuthenticated(true);

      toast({
        title: "Guest login successful",
        description: "Welcome! You are logged in as a guest.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Guest login failed",
        description: "An error occurred during guest login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.updatePassword(currentPassword, newPassword);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "An error occurred while changing your password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    userOrders,
    login,
    logout,
    signup,
    updateProfile,
    createOrder,
    getOrders,
    updateOrderStatus,
    loginAsGuest,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 