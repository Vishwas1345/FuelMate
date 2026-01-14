import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Clock, Truck, CheckCircle, AlertCircle, IndianRupee, Droplets, Calendar, TrendingUp } from 'lucide-react';
import FuelOrderForm from './FuelOrderForm';
import OrderTracking from './OrderTracking';
import { useAuth } from '@/contexts/AuthContext';

// Define a CustomerOrder type that's compatible with the station Order type
// but specific to customer dashboard needs
type CustomerOrder = {
  id: string;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  fuelType: string;
  quantity: number;
  brand: string;
  price: number;
  deliveryAddress: string;
  timestamp: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  paymentMethod?: string;
  driver?: {
    name: string;
    phone: string;
    email: string;
    currentLocation?: string;
  };
};

// For type compatibility when interacting with the station dashboard
type StationOrder = {
  id: string;
  status: string;
  customer: string;
  fuelType: string;
  quantity: number;
  brand: string;
  price: number;
  deliveryAddress: string;
  timestamp: Date;
  estimatedDelivery?: Date;
  paymentMethod?: string;
  driverName?: string;
  driver?: {
    name: string;
    phone: string;
    email: string;
    currentLocation?: string;
  };
};

type FormData = {
  fuelType: 'Petrol' | 'Diesel';
  quantity: string;
  brand: string;
  selectedStation: string;
  deliveryAddress: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking';
};

// Base fuel prices
const BASE_PRICES = {
  Petrol: 102.50,
  Diesel: 89.75
};

// Function to generate random price fluctuation
const generateRandomPrice = (basePrice: number) => {
  // Random fluctuation between -2 to +2 rupees
  const fluctuation = (Math.random() * 4 - 2);
  return Number((basePrice + fluctuation).toFixed(2));
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
  const [pastOrders, setPastOrders] = useState<CustomerOrder[]>([]);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);
  const [todaySpend, setTodaySpend] = useState(0);
  const [totalFuelOrdered, setTotalFuelOrdered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fuelPrices, setFuelPrices] = useState({
    Petrol: BASE_PRICES.Petrol,
    Diesel: BASE_PRICES.Diesel
  });

  useEffect(() => {
    if (!window.orderSystem) return;
    
    const updateOrdersState = () => {
      // Get all orders from both active orders and order history
      const allOrders = [
        ...window.orderSystem.orders,
        ...window.orderSystem.orderHistory
      ];
      const formattedOrders = allOrders.map(order => ({
        ...order,
        quantity: Number(order.quantity) || 0,
        price: Number(order.price) || 0,
        timestamp: new Date(order.timestamp),
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined
      }));
      setLocalOrders(formattedOrders);
      setIsLoading(false);
    };

    window.orderSystem.subscribeToUpdates(updateOrdersState);
    updateOrdersState();

    return () => {
      window.orderSystem.listeners = window.orderSystem.listeners.filter(
        listener => listener !== updateOrdersState
      );
    };
  }, []);

  useEffect(() => {
    if (!localOrders) return;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert localOrders to CustomerOrder type
    const customerOrders = localOrders.map(order => ({
      id: order._id,
      status: order.status as 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled',
      fuelType: order.fuelType,
      quantity: Number(order.quantity),
      brand: order.brand,
      price: Number(order.price || order.totalPrice), // Handle both price formats
      deliveryAddress: order.deliveryAddress,
      timestamp: new Date(order.createdAt || order.timestamp), // Handle both timestamp formats
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      paymentMethod: order.paymentMethod,
      driver: order.driver
    }));
    
    // Filter orders for active and completed
    const activeOrdersList = customerOrders.filter(order => 
      order.status === 'pending' || 
      order.status === 'confirmed' || 
      order.status === 'in-transit'
    );
    setActiveOrders(activeOrdersList);
    
    const completedOrdersList = customerOrders.filter(order => 
      order.status === 'delivered'
    );
    setPastOrders(completedOrdersList);

    // Calculate today's statistics
    const todayOrders = completedOrdersList.filter(order => {
      const orderDate = new Date(order.deliveredAt || order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Calculate total fuel ordered today
    const todayFuel = todayOrders.reduce((sum, order) => {
      return sum + (Number(order.quantity) || 0);
    }, 0);
    setTotalFuelOrdered(todayFuel);

    // Calculate total spend for today
    const todayTotal = todayOrders.reduce((sum, order) => {
      const price = Number(order.price) || 0;
      return sum + price;
    }, 0);
    setTodaySpend(todayTotal);

    // Calculate average order value for today
    const averageOrderValue = todayOrders.length > 0 
      ? Number((todayTotal / todayOrders.length).toFixed(2))
      : 0;
    setTotalSpend(averageOrderValue);

    // Debug logs
    console.log('Today\'s Orders:', todayOrders);
    console.log('Today\'s Total Spend:', todayTotal);
    console.log('Average Order Value:', averageOrderValue);
  }, [localOrders]);

  // Update fuel prices every 5 minutes
  useEffect(() => {
    const updatePrices = () => {
      setFuelPrices({
        Petrol: generateRandomPrice(BASE_PRICES.Petrol),
        Diesel: generateRandomPrice(BASE_PRICES.Diesel)
      });

      // Show toast notification for price update
      toast({
        title: "Fuel Prices Updated",
        description: `New Prices - Petrol: ₹${fuelPrices.Petrol}/L, Diesel: ₹${fuelPrices.Diesel}/L`,
      });
    };

    // Initial update
    updatePrices();

    // Set interval for updates every 5 minutes
    const interval = setInterval(updatePrices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = async (orderData: FormData) => {
    try {
      const quantity = parseFloat(orderData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      const totalPrice = quantity * fuelPrices[orderData.fuelType];
      if (!orderData.fuelType || !orderData.brand || !orderData.deliveryAddress || !orderData.paymentMethod || !orderData.selectedStation) {
        throw new Error('Please fill in all required fields');
      }

      // Use window.orderSystem.addOrder directly
      window.orderSystem.addOrder({
        customer: user?.name || 'Unknown',
        fuelType: orderData.fuelType,
        quantity,
        brand: orderData.brand,
        price: totalPrice,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod
      });

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and is waiting for confirmation.",
      });
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Listen for status changes that should trigger notifications
  useEffect(() => {
    const handleOrderStatusChange = () => {
      if (!window.orderSystem) return;
      
      const systemOrders = window.orderSystem.orders;
      
      const customerOrdersFromSystem = systemOrders.map(order => ({
        id: order.id,
        status: order.status as 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled',
        fuelType: order.fuelType,
        quantity: order.quantity,
        brand: order.brand,
        price: order.price,
        deliveryAddress: order.deliveryAddress,
        timestamp: order.timestamp,
        estimatedDelivery: order.estimatedDelivery,
        driver: order.driver,
        paymentMethod: order.paymentMethod
      }));
      
      // Check for newly confirmed orders
      const newlyConfirmed = customerOrdersFromSystem.filter(order => 
        order.status === 'confirmed' && 
        !activeOrders.some(o => o.id === order.id && o.status === 'confirmed')
      );
      
      // Check for newly started deliveries
      const newlyInTransit = customerOrdersFromSystem.filter(order => 
        order.status === 'in-transit' && 
        !activeOrders.some(o => o.id === order.id && o.status === 'in-transit')
      );
      
      // Check for newly delivered orders
      const newlyDelivered = customerOrdersFromSystem.filter(order => 
        order.status === 'delivered' && 
        !pastOrders.some(o => o.id === order.id)
      );
      
      // Show notifications for status changes
      newlyConfirmed.forEach(order => {
        toast({
          title: "Order Confirmed!",
          description: `Your order #${order.id} has been confirmed and will be delivered soon.`,
        });
      });
      
      newlyInTransit.forEach(order => {
        toast({
          title: "Delivery Started!",
          description: `Your order #${order.id} is on the way with ${order.driver?.name || 'our delivery agent'}.`,
        });
      });
      
      newlyDelivered.forEach(order => {
        toast({
          title: "Order Delivered!",
          description: `Your order #${order.id} has been delivered successfully.`,
        });
      });
    };
    
    handleOrderStatusChange();
  }, [activeOrders, pastOrders, toast]);

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
  };

  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Customer Dashboard</h1>
          <p className="text-gray-400">Today's Overview</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Fuel className="h-5 w-5 text-orange-500" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{activeOrders.length}</div>
            <p className="text-sm text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pastOrders.filter(order => {
              const orderDate = new Date(order.deliveredAt || order.timestamp);
              orderDate.setHours(0, 0, 0, 0);
              return orderDate.getTime() === new Date().setHours(0, 0, 0, 0);
            }).length}</div>
            <p className="text-sm text-gray-400">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Fuel Ordered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalFuelOrdered.toFixed(2)}L</div>
            <p className="text-sm text-gray-400">From completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-yellow-500" />
              Today's Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{todaySpend.toFixed(2)}</div>
            <p className="text-sm text-gray-400">On completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Orders Today</p>
                <p className="text-2xl font-bold text-white">{pastOrders.filter(order => {
                  const orderDate = new Date(order.deliveredAt || order.timestamp);
                  orderDate.setHours(0, 0, 0, 0);
                  return orderDate.getTime() === new Date().setHours(0, 0, 0, 0);
                }).length}</p>
                <p className="text-sm text-gray-400">Delivered today</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold text-white">₹{totalSpend.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Per completed order</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-white">Loading...</div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="order" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger 
                value="order" 
                className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white hover:text-orange-500 data-[state=active]:hover:text-white"
              >
                <Fuel className="h-4 w-4" />
                Order Fuel
              </TabsTrigger>
              <TabsTrigger 
                value="track" 
                className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white hover:text-orange-500 data-[state=active]:hover:text-white"
              >
                <Truck className="h-4 w-4" />
                Track Order
              </TabsTrigger>
            </TabsList>
            <TabsContent value="order">
              <FuelOrderForm onSubmit={handleOrderSubmit} fuelPrices={fuelPrices} />
            </TabsContent>
            <TabsContent value="track">
              <OrderTracking 
                activeOrders={activeOrders} 
                trackingOrderId={trackingOrderId}
                onTrackOrder={handleTrackOrder}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;
