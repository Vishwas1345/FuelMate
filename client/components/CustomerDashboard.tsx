import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Clock, Truck, CheckCircle, AlertCircle, IndianRupee, Droplets, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
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

// Define the window.orderSystem type to fix TS errors
declare global {
  interface Window {
    orderSystem: any;
  }
}

// Station Type
type Station = {
  _id: string;
  businessName: string;
  pumpLocation: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  fuelProvider: string;
  isAvailable: boolean;
  fuelPrices: {
    petrol: number;
    diesel: number;
  };
  avatar: string;
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
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
    const fetchStations = async () => {
      // @ts-ignore
      const city = user?.addresses?.[0]?.city;
      if (city) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/stations?city=${city}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setStations(data);
          }
        } catch (error) {
          console.error("Failed to fetch stations", error);
        }
      }
    };

    fetchStations();

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

  // Update fuel prices
  useEffect(() => {
    // Initial prices only
    setFuelPrices({
      Petrol: generateRandomPrice(BASE_PRICES.Petrol),
      Diesel: generateRandomPrice(BASE_PRICES.Diesel)
    });

    const interval = setInterval(() => {
      setFuelPrices(prev => ({
        Petrol: generateRandomPrice(BASE_PRICES.Petrol),
        Diesel: generateRandomPrice(BASE_PRICES.Diesel)
      }));
    }, 30000); // 30 seconds instead of 5 minutes for better visibility in demo, or sticking to user request less lag? 
    // Actually user said "lags somewhere", which might be due to re-renders. 
    // Let's keep it simple and efficient.

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
  }, [activeOrders, pastOrders]);

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
  };

  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="mb-4">
        <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, <span className="text-orange-500">{user?.name}</span></h1>

        </div>
      </div>

      {stations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Fuel className="text-orange-500" /> Available Fuel Stations Nearby
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Card key={station._id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all duration-300 group overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-900 bg-white overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                      <img src={station.avatar || '/placeholder-station.png'} alt={station.businessName} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <Badge className={`absolute top-4 right-4 ${station.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                    {station.isAvailable ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
                <CardHeader className="pt-10 pb-2">
                  <CardTitle className="text-lg text-white group-hover:text-orange-400 transition-colors">{station.businessName}</CardTitle>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {station.fuelProvider} Partner
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-center text-sm p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                      <span className="text-gray-400">Petrol</span>
                      <span className="font-mono text-orange-400 font-bold">₹{station.fuelPrices?.petrol || "101.5"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                      <span className="text-gray-400">Diesel</span>
                      <span className="font-mono text-blue-400 font-bold">₹{station.fuelPrices?.diesel || "92.5"}</span>
                    </div>
                    <Button className="w-full mt-2 bg-slate-800 hover:bg-orange-600 text-white border border-slate-700 hover:border-orange-500 transition-all" variant="outline">
                      Order from here <TrendingUp className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}



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
