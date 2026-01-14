import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Truck, Clock, CheckCircle, AlertCircle, IndianRupee, 
  Droplets, Calendar, TrendingUp, User, MapPin, Phone, Mail 
} from 'lucide-react';
import MapView from './MapView';
import { useAuth } from '@/contexts/AuthContext';

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
  driver?: {
    name: string;
    phone: string;
    email: string;
    currentLocation?: string;
  };
};

type DriverStats = {
  totalDeliveries: number;
  todayDeliveries: number;
  totalFuelDelivered: number;
  todayFuelDelivered: number;
  totalEarnings: number;
  todayEarnings: number;
  averageOrderValue: number;
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    totalDeliveries: 0,
    todayDeliveries: 0,
    totalFuelDelivered: 0,
    todayFuelDelivered: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    averageOrderValue: 0
  });
  const { toast } = useToast();

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
      setOrders(formattedOrders);
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
    if (!orders.length) return;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter orders for this driver
    const driverOrders = orders.filter(order => 
      order.driverName === user?.name || 
      order.driver?.name === user?.name
    );

    // Filter today's orders
    const todayOrders = driverOrders.filter(order => {
      const orderDate = new Date(order.deliveredAt || order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Calculate statistics
    const totalDeliveries = driverOrders.filter(order => order.status === 'delivered').length;
    const todayDeliveries = todayOrders.filter(order => order.status === 'delivered').length;

    const totalFuelDelivered = driverOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);

    const todayFuelDelivered = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);

    const totalEarnings = driverOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (Number(order.price) || 0), 0);

    const todayEarnings = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (Number(order.price) || 0), 0);

    const averageOrderValue = totalDeliveries > 0 
      ? Number((totalEarnings / totalDeliveries).toFixed(2))
      : 0;

    setDriverStats({
      totalDeliveries,
      todayDeliveries,
      totalFuelDelivered,
      todayFuelDelivered,
      totalEarnings,
      todayEarnings,
      averageOrderValue
    });
  }, [orders, user]);

  const handleAcceptOrder = (orderId: string) => {
    if (window.orderSystem) {
      window.orderSystem.updateOrderStatus(orderId, 'in-transit', {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        currentLocation: user?.currentLocation || ''
      });
      
      toast({
        title: "Order Accepted",
        description: "You have accepted the delivery order.",
      });
    }
  };

  const handleCompleteDelivery = (orderId: string) => {
    if (window.orderSystem) {
      window.orderSystem.updateOrderStatus(orderId, 'delivered');
      
      toast({
        title: "Delivery Completed",
        description: "The order has been marked as delivered.",
      });
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Driver Dashboard</h1>
          <p className="text-gray-400">Manage your deliveries</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              Today's Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{driverStats.todayDeliveries}</div>
            <p className="text-sm text-gray-400">Completed today</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Fuel Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{driverStats.todayFuelDelivered.toFixed(2)}L</div>
            <p className="text-sm text-gray-400">From completed deliveries</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-yellow-500" />
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{driverStats.todayEarnings.toFixed(2)}</div>
            <p className="text-sm text-gray-400">From completed deliveries</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{driverStats.averageOrderValue.toFixed(2)}</div>
            <p className="text-sm text-gray-400">Per delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Deliveries</p>
                <p className="text-2xl font-bold text-white">{driverStats.totalDeliveries}</p>
                <p className="text-sm text-gray-400">All time</p>
              </div>
              <Truck className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Fuel Delivered</p>
                <p className="text-2xl font-bold text-white">{driverStats.totalFuelDelivered.toFixed(2)}L</p>
                <p className="text-sm text-gray-400">All time</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-white">₹{driverStats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-gray-400">All time</p>
              </div>
              <IndianRupee className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Available Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
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
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-4">
                  {orders.filter(order => order.status === 'confirmed').length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No pending orders</p>
                    </div>
                  ) : (
                    orders
                      .filter(order => order.status === 'confirmed')
                      .map(order => (
                        <div 
                          key={order.id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-slate-800 hover:bg-slate-700'
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
                  {orders.filter(order => 
                    order.status === 'in-transit' && 
                    (order.driverName === user?.name || order.driver?.name === user?.name)
                  ).length === 0 ? (
                    <div className="text-center py-6">
                      <Truck className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No active deliveries</p>
                    </div>
                  ) : (
                    orders
                      .filter(order => 
                        order.status === 'in-transit' && 
                        (order.driverName === user?.name || order.driver?.name === user?.name)
                      )
                      .map(order => (
                        <div 
                          key={order.id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-slate-800 hover:bg-slate-700'
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
        </div>

        <div className="md:col-span-7 lg:col-span-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div>
                  <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <div className="bg-slate-800 p-4 rounded-lg">
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
                    
                    <div className="bg-slate-800 p-4 rounded-lg">
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
                            {getStatusBadge(selectedOrder.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">Delivery Location</h3>
                    <div className="h-64 rounded-lg overflow-hidden border border-slate-700">
                      <MapView address={selectedOrder.deliveryAddress} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleAcceptOrder(selectedOrder.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Accept Delivery
                      </Button>
                    )}
                    
                    {selectedOrder.status === 'in-transit' && (
                      <Button 
                        onClick={() => handleCompleteDelivery(selectedOrder.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
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

export default DriverDashboard; 