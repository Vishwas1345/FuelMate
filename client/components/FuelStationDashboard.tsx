import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Check, X, Clock, Truck, Phone, Mail, User,
  IndianRupee, TrendingUp, Calendar, AlertCircle,
  BarChart3, Droplets, Users, Settings, Zap, Target, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import MapView from './MapView';

type Driver = {
  name: string;
  phone: string;
  email: string;
  currentLocation?: string;
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

// Add Global Type for window.orderSystem
declare global {
  interface Window {
    orderSystem: any;
  }
}

// ... (keep types and minimal globals if needed, but we focus on real data now)
// I will keep the types for compilation safety but won't rely on window.orderSystem for the main stats

// Station Dashboard Stats Type
type DashboardStats = {
  totalRevenue: number;
  petrolSold: number;
  dieselSold: number;
  recentOrders: any[];
  graphData: { date: string; amount: number }[];
};

const FuelStationDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  // Start with false (safe default), then sync the real DB value once user loads.
  // This is in a dedicated effect so it is independent of the stats fetch and never silently fails.
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  // Sync the toggle from the real DB value whenever the user profile loads or changes.
  // Now that login response includes isAvailable, this works immediately on login too.
  useEffect(() => {
    if (user?._id) {
      // Default to true (station online) matching the Mongoose schema default
      setIsAvailable(user.isAvailable ?? true);
    }
  }, [user?._id, user?.isAvailable]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, fetchedOrders] = await Promise.all([
          api.getAnalytics().catch(() => null),
          api.getOrders().catch(() => [])
        ]);

        if (stats) {
          // Map new analytics structure to old UI expectations if necessary
          setDashboardStats({
            totalRevenue: stats.totalAmount,
            petrolSold: stats.fuelTypeBreakdown.petrol,
            dieselSold: stats.fuelTypeBreakdown.diesel,
            recentOrders: fetchedOrders.slice(0, 5),
            graphData: stats.dailyTrends
          });
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, [user]);


  const handleToggleAvailability = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsAvailable(data.isAvailable);
        toast({
          title: data.isAvailable ? "You are now Online" : "You are now Offline",
          description: data.isAvailable ? "Customers can sees your station and place orders." : "Your station is hidden from customers.",
          variant: data.isAvailable ? "default" : "destructive" // using destructive for offline
        });
      }
    } catch (error) {
      toast({ title: "Failed to update availability", variant: "destructive" });
    }
  };

  // ... rest of the component logic placeholder logic if needed
  // Removing the complex window.orderSystem useEffect for now or simplifying it


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

    // Use local orders state
    const allOrders = orders; // Use the component state which might be populated from backend

    // Filter orders for today
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.timestamp || order.createdAt);
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
      return sum + (Number(order.price || order.totalPrice) || 0);
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
      <div className="mb-4">
        <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Operations <span className="text-[#f97316]">Console</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-tight">Real-time terminal management for {user?.businessName || user?.name}</p>
        </div>

        <div className="flex items-center gap-4 bg-[#0a101f] border border-slate-800 p-3 rounded-xl px-6 shadow-xl">
          <div className="flex flex-col items-end mr-4">
            <span className={`text-[10px] font-black tracking-widest ${isAvailable ? 'text-green-500' : 'text-slate-500'}`}>
              {isAvailable ? 'TERMINAL ONLINE' : 'TERMINAL OFFLINE'}
            </span>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
              {isAvailable ? 'Broadcasting price data' : 'Logistics paused'}
            </span>
          </div>
          <Switch
            checked={isAvailable}
            onCheckedChange={handleToggleAvailability}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <IndianRupee className="h-3 w-3 text-[#f97316]" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-1">
              ₹{dashboardStats?.totalRevenue?.toLocaleString() || todayStats.totalRevenue.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" />
              Live terminal earnings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Droplets className="h-3 w-3 text-orange-500" />
              Petrol Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardStats?.petrolSold?.toFixed(1) || (todayStats.totalFuel * 0.6).toFixed(1)} <span className="text-sm font-bold text-slate-500 tracking-normal">LT</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Throughput</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Droplets className="h-3 w-3 text-blue-500" />
              Diesel Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardStats?.dieselSold?.toFixed(1) || (todayStats.totalFuel * 0.4).toFixed(1)} <span className="text-sm font-bold text-slate-500 tracking-normal">LT</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Throughput</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Truck className="h-3 w-3 text-green-500" />
              Pending Logistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-1">
              {orders.filter(o => o.status === 'confirmed' || o.status === 'in-transit').length}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Active manifestations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 bg-[#0a101f] border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-900/50 pb-4">
            <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart3 className="text-blue-500 w-4 h-4" /> Operational Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[240px] flex items-end justify-between gap-4 px-4 pb-2">
              {dashboardStats?.graphData ? (
                dashboardStats.graphData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                    <div
                      className="w-full bg-[#f97316]/10 group-hover:bg-[#f97316]/30 rounded-lg transition-all relative border border-white/5"
                      style={{ height: `${Math.max((d.amount / (Math.max(...dashboardStats.graphData.map(x => x.amount)) || 1)) * 100, 10)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-[#020817] text-[10px] font-black px-2 py-1 rounded shadow-xl whitespace-nowrap z-10 transition-all">
                        ₹{d.amount}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter w-full text-center group-hover:text-slate-400 transition-colors">
                      {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700 flex-col gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Awaiting terminal data</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl flex flex-col">
          <CardHeader className="border-b border-slate-900/50 pb-4">
            <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="text-yellow-500 w-4 h-4" /> Logistics AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 flex-1">
            <div className="p-4 bg-[#020817] rounded-xl border border-slate-800 group hover:border-[#f97316]/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-4 h-4 text-green-500" />
                <p className="text-[11px] font-black text-white uppercase tracking-wider">Demand Surge Detected</p>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Diesel manifest trends indicate a 24% volume increase this weekend. Review inventory buffer.</p>
            </div>

            <div className="p-4 bg-[#020817] rounded-xl border border-slate-800 group hover:border-[#f97316]/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <p className="text-[11px] font-black text-white uppercase tracking-wider">Logistics Optimization</p>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Peak operational window identified: 18:00 - 21:00. Pre-assign drivers for manifest speed.</p>
            </div>

            <div className="mt-auto pt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f97316]/5 border border-[#f97316]/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                <span className="text-[9px] font-black text-[#f97316] uppercase tracking-widest">AI Core Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id
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
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id
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
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id
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
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedDriver?.name === driver.name
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
