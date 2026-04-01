import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { api, User, AuthResponse, Order } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userOrders: Order[];
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User | void>;
  createOrder: (orderData: any) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: string, driver?: any) => Promise<Order>;
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
        // Clear all stored tokens to avoid repeated refresh failures on page reload
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });

      // Login payload omits addresses/vehicles — load full profile for dashboards/forms
      let fullUser = response.user as User;
      try {
        fullUser = await api.getProfile();
      } catch {
        // keep minimal user if profile fetch fails
      }
      setUser(fullUser);
      setIsAuthenticated(true);

      // Fetch orders after successful login
      const orders = await api.getOrders();
      setUserOrders(orders);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Returning users should never be forced into onboarding on login.
      // Route directly to the appropriate dashboard by role.
      if (response.user?.role === 'station') {
        navigate("/station");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
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
  }, [navigate]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await api.register({ name, email, password });

      let fullUser = response.user as User;
      try {
        fullUser = await api.getProfile();
      } catch {
        /* use response.user */
      }
      setUser(fullUser);
      setIsAuthenticated(true);

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });

      // New users go to onboarding
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  }, [navigate]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
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
          return api.updateProfile(data); // Call api directly since we are in the memoized function
        } catch (refreshError) {
          // If refresh fails, then we need to log in again
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          // Call logout directly
          setUser(null);
          setUserOrders([]);
          setIsAuthenticated(false);
          navigate("/auth");
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
  }, [navigate]);

  const createOrder = useCallback(async (orderData: any) => {
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
          price: newOrder.totalPrice,
          deliveryAddress: newOrder.deliveryAddress,
          paymentMethod: newOrder.paymentMethod
        });
      }

      return newOrder;
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const getOrders = useCallback(async () => {
    try {
      const orders = await api.getOrders();
      setUserOrders(orders);

      if (window.orderSystem) {
        window.orderSystem.orders = orders.map((order: any) => ({
          id: order._id,
          status: order.status,
          customer: typeof order.customer === 'object' ? order.customer?.name : order.customer,
          fuelType: order.fuelType,
          quantity: order.quantity,
          brand: order.brand,
          price: order.totalPrice,
          deliveryAddress: order.deliveryAddress,
          timestamp: new Date(order.createdAt),
          paymentMethod: order.paymentMethod,
          driver: order.driver
        }));

        const deliveredOrders = orders.filter((order: any) => order.status === 'delivered');
        window.orderSystem.orderHistory = deliveredOrders.map((order: any) => ({
          id: order._id,
          status: order.status,
          customer: typeof order.customer === 'object' ? order.customer?.name : order.customer,
          fuelType: order.fuelType,
          quantity: order.quantity,
          brand: order.brand,
          price: order.totalPrice,
          deliveryAddress: order.deliveryAddress,
          timestamp: new Date(order.createdAt),
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
          paymentMethod: order.paymentMethod,
          driver: order.driver
        }));

        window.orderSystem.listeners.forEach((callback: () => void) => callback());
      }

      return orders;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string, driver?: any) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, status, driver);

      // Update local orders state
      setUserOrders(prev => prev.map(order =>
        order._id === orderId ? updatedOrder : order
      ));

      if (window.orderSystem) {
        const orderIndex = window.orderSystem.orders.findIndex((o: any) => o.id === orderId);
        if (orderIndex !== -1) {
          window.orderSystem.orders[orderIndex] = {
            id: updatedOrder._id,
            status: updatedOrder.status,
            customer: typeof updatedOrder.customer === 'object' ? updatedOrder.customer.name : updatedOrder.customer,
            fuelType: updatedOrder.fuelType,
            quantity: updatedOrder.quantity,
            brand: updatedOrder.brand,
            price: updatedOrder.totalPrice,
            deliveryAddress: updatedOrder.deliveryAddress,
            timestamp: new Date(updatedOrder.createdAt),
            driver: updatedOrder.driver
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
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
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
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    userOrders,
    setUser,
    login,
    logout,
    signup,
    updateProfile,
    createOrder,
    getOrders,
    updateOrderStatus,
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