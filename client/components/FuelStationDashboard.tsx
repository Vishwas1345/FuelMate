import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Check, X, Clock, Truck, Phone, Mail, User,
  IndianRupee, TrendingUp, Calendar, AlertCircle,
  BarChart3, Droplets, Users, Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MapView from './MapView';

type Driver = {
  name: string;
  phone: string;
  email: string;
  currentLocation?: string;
};

type Order = {
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
  deliveredAt?: Date;
  paymentMethod?: string;
  driverName?: string;
  driver?: Driver;
};

const availableDrivers: Driver[] = [
  {
    name: "Amit Verma",
    phone: "+91 98765 43210",
    email: "amit.verma@fuelmate.com",
    currentLocation: "Adajan, Surat"
  },
  {
    name: "Rajesh Kumar",
    phone: "+91 87654 32109",
    email: "rajesh.kumar@fuelmate.com",
    currentLocation: "City Light, Surat"
  },
  {
    name: "Priya Patel",
    phone: "+91 76543 21098",
    email: "priya.patel@fuelmate.com",
    currentLocation: "Vesu, Surat"
  }
];

declare global {
  interface Window { 
    orderSystem: {
      orders: Order[];
      addOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => string;
      updateOrderStatus: (id: string, status: string, driver?: Driver) => void;
      getOrder: (id: string) => Order | undefined;
      subscribeToUpdates: (callback: () => void) => void;
      listeners: Array<() => void>;
      orderHistory: Order[];
      addToOrderHistory: (order: Order) => void;
    }; 
  }
}

if (typeof window !== 'undefined') {
  window.orderSystem = window.orderSystem || {
    orders: [],
    orderHistory: [],
    listeners: [],

    addOrder: (order) => {
      const newOrder: Order = {
        ...order,
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending',
        timestamp: new Date(),
        quantity: Number(order.quantity) || 0,
        price: Number(order.price) || 0
      };
      window.orderSystem.orders.push(newOrder);
      window.orderSystem.listeners.forEach(callback => callback());
      return newOrder.id;
    },

    updateOrderStatus: (id, status, driver) => {
      const orderIndex = window.orderSystem.orders.findIndex(o => o.id === id);
      if (orderIndex !== -1) {
        const updatedOrder = {
          ...window.orderSystem.orders[orderIndex],
          status,
          ...(status === 'confirmed' ? { 
            estimatedDelivery: new Date(Date.now() + 1000 * 60 * 45) 
          } : {}),
          ...(status === 'in-transit' && driver ? {
            driverName: driver.name,
            driver
          } : {})
        };
        
        // Update the order in the orders array
        window.orderSystem.orders[orderIndex] = updatedOrder;
        
        // If order is delivered, move it to order history and remove from active orders
        if (status === 'delivered') {
          window.orderSystem.addToOrderHistory(updatedOrder);
          window.orderSystem.orders = window.orderSystem.orders.filter(o => o.id !== id);
        }
        
        // Notify all listeners of the update
        window.orderSystem.listeners.forEach(callback => callback());
      }
    },

    getOrder: (id) => {
      // Check both active orders and order history
      return window.orderSystem.orders.find(o => o.id === id) || 
             window.orderSystem.orderHistory.find(o => o.id === id);
    },

    subscribeToUpdates: (callback) => {
      window.orderSystem.listeners.push(callback);
    },

    addToOrderHistory: (order) => {
      // Add timestamp for delivery
      const orderWithDeliveryTime = {
        ...order,
        deliveredAt: new Date()
      };
      
      window.orderSystem.orderHistory.push(orderWithDeliveryTime);
      
      // Keep only the last 50 orders in history
      if (window.orderSystem.orderHistory.length > 50) {
        window.orderSystem.orderHistory.shift();
      }
      
      window.orderSystem.listeners.forEach(callback => callback());
    }
  };
}

const FuelStationDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(window.orderSystem ? window.orderSystem.orders : []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const updateOrdersState = () => {
      if (window.orderSystem) {
        // Get all orders from both active orders and order history
        const allOrders = [
          ...window.orderSystem.orders,
          ...window.orderSystem.orderHistory
        ];

        // Filter out orders older than 24 hours and ensure quantities are numbers
        const now = new Date();
        const filteredOrders = allOrders
          .filter(order => {
            const orderAge = now.getTime() - new Date(order.timestamp).getTime();
            return orderAge < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          })
          .map(order => ({
            ...order,
            quantity: Number(order.quantity) || 0,
            price: Number(order.price) || 0,
            timestamp: new Date(order.timestamp),
            estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined
          }));
        
        setOrders(filteredOrders);
        if (selectedOrder) {
          const updatedOrder = filteredOrders.find(o => o.id === selectedOrder.id);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    };

    if (window.orderSystem) {
      window.orderSystem.subscribeToUpdates(updateOrdersState);
      // Initial update
      updateOrdersState();
    }

    return () => {
      if (window.orderSystem) {
        window.orderSystem.listeners = window.orderSystem.listeners.filter(
          listener => listener !== updateOrdersState
        );
      }
    };
  }, [selectedOrder]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    let driver: Driver | undefined;
    
    if (newStatus === 'in-transit') {
      driver = selectedDriver || availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    }

    if (window.orderSystem) {
      window.orderSystem.updateOrderStatus(orderId, newStatus, driver);
      
      // Show appropriate toast message based on status
      let toastMessage = "";
      switch (newStatus) {
        case 'confirmed':
          toastMessage = `Order ${orderId} has been confirmed and will be delivered soon.`;
          break;
        case 'in-transit':
          toastMessage = `Order ${orderId} is now in transit with ${driver?.name}.`;
          break;
        case 'delivered':
          toastMessage = `Order ${orderId} has been delivered successfully.`;
          break;
        default:
          toastMessage = `Order ${orderId} status changed to ${newStatus}`;
      }
      
      toast({
        title: "Order Updated",
        description: toastMessage,
      });
    }
  };

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    return filterStatus === 'all' || order.status === filterStatus;
  });

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const activeOrders = filteredOrders.filter(order => 
    order.status === 'confirmed' || order.status === 'in-transit'
  );
  const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered');

  // Calculate today's statistics
  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all orders from both active orders and order history
    const allOrders = [
      ...window.orderSystem.orders,
      ...window.orderSystem.orderHistory
    ];

    // Filter orders for today
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Filter delivered orders for today
    const deliveredToday = todayOrders.filter(order => order.status === 'delivered');

    // Calculate statistics
    const totalFuel = deliveredToday.reduce((sum, order) => {
      return sum + (Number(order.quantity) || 0);
    }, 0);

    const totalRevenue = deliveredToday.reduce((sum, order) => {
      return sum + (Number(order.price) || 0);
    }, 0);

    const averageOrderValue = deliveredToday.length > 0 
      ? Number((totalRevenue / deliveredToday.length).toFixed(2))
      : 0;

    return {
      totalOrders: todayOrders.length,
      deliveredOrders: deliveredToday.length,
      totalFuel,
      totalRevenue,
      averageOrderValue
    };
  };

  const todayStats = getTodayStats();
  const validOrders = filteredOrders.filter(order => order.status === 'delivered');
  const totalFuel = validOrders.reduce((sum, order) => {
    return sum + (Number(order.quantity) || 0);
  }, 0);
  const totalRevenue = validOrders.reduce((sum, order) => {
    return sum + (Number(order.price) || 0);
  }, 0);
  const averageOrderValue = validOrders.length > 0 
    ? Number((totalRevenue / validOrders.length).toFixed(2))
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'confirmed': return <Check className="h-5 w-5" />;
      case 'in-transit': return <Truck className="h-5 w-5" />;
      case 'delivered': return <Check className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
      case 'in-transit':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Fuel Station Dashboard</h1>
          <p className="text-gray-400">Today's Overview</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingOrders.length}</div>
            <p className="text-sm text-gray-400">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Truck className="h-5 w-5 text-blue-500" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{activeOrders.length}</div>
            <p className="text-sm text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Droplets className="h-5 w-5 text-green-500" />
              Fuel Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{todayStats.totalFuel.toFixed(2)}L</div>
            <p className="text-sm text-gray-400">
              {todayStats.deliveredOrders} completed order{todayStats.deliveredOrders !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <IndianRupee className="h-5 w-5 text-yellow-500" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{todayStats.totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-gray-400">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Orders Today</p>
                <p className="text-2xl font-bold text-white">{todayStats.totalOrders}</p>
                <p className="text-sm text-gray-400">{todayStats.deliveredOrders} delivered</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold text-white">₹{todayStats.averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Per completed order</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Order Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-900">
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-4">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No pending orders</p>
                    </div>
                  ) : (
                    pendingOrders.map(order => (
                      <div 
                        key={order.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm opacity-90">{order.customer}</p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                          <p className="opacity-75">{new Date(order.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="space-y-4 mt-4">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No active orders</p>
                    </div>
                  ) : (
                    activeOrders.map(order => (
                      <div 
                        key={order.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-slate-900 hover:bg-orange-500 hover:text-white'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm opacity-90">{order.customer}</p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                          <p className="opacity-90">
                            {order.status === 'in-transit' && order.driverName 
                              ? `Driver: ${order.driverName}` 
                              : new Date(order.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="space-y-4 mt-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No orders</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div 
                        key={order.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-slate-900 hover:bg-orange-500 hover:text-white'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm opacity-90">{order.customer}</p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                          <p className="opacity-75">{new Date(order.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Driver Status Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Available Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableDrivers.map((driver) => (
                <div 
                  key={driver.name}
                  className="bg-slate-900 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{driver.name}</p>
                      <p className="text-sm text-gray-400">{driver.currentLocation}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-500" />
                      {driver.phone}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-500" />
                      {driver.email}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 lg:col-span-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div>
                  <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Customer Name</p>
                          <p className="font-medium text-white">{selectedOrder.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Delivery Address</p>
                          <p className="font-medium text-white">{selectedOrder.deliveryAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Order Time</p>
                          <p className="font-medium text-white">{new Date(selectedOrder.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-4">Order Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Fuel Type</p>
                          <p className="font-medium text-white">{selectedOrder.fuelType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Quantity</p>
                          <p className="font-medium text-white">{selectedOrder.quantity} liters</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Amount</p>
                          <p className="font-medium text-white">₹{(selectedOrder.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(selectedOrder.status)}
                            {getStatusBadge(selectedOrder.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.status === 'pending' && (
                    <div className="mb-6 bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-3">Assign Driver</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {availableDrivers.map((driver) => (
                          <div 
                            key={driver.name}
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                              selectedDriver?.name === driver.name 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                            onClick={() => setSelectedDriver(driver)}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              <p className="font-medium">{driver.name}</p>
                            </div>
                            <div className="mt-2 text-sm opacity-90">
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {driver.phone}
                              </p>
                              <p className="flex items-center gap-1">
                                <Truck className="h-3 w-3" /> {driver.currentLocation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedOrder.driver && (
                    <div className="mb-6 bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Delivery Driver</h3>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 mb-3 md:mb-0">
                          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <User className="h-7 w-7 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{selectedOrder.driver.name}</p>
                            <p className="text-sm text-gray-400">{selectedOrder.driver.currentLocation}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-slate-800">
                            <Phone className="h-4 w-4" />
                            {selectedOrder.driver.phone}
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-slate-800">
                            <Mail className="h-4 w-4" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">Delivery Location</h3>
                    <div className="h-64 rounded-lg overflow-hidden border border-slate-700">
                      <MapView address={selectedOrder.deliveryAddress} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          disabled={!selectedDriver}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirm Order
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject Order
                        </Button>
                      </>
                    )}
                    
                    {selectedOrder.status === 'confirmed' && (
                      <Button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'in-transit')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Start Delivery
                      </Button>
                    )}
                    
                    {selectedOrder.status === 'in-transit' && (
                      <Button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                    
                    <Button variant="outline" className="bg-slate-900">
                      Contact Customer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Select an order to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FuelStationDashboard;
