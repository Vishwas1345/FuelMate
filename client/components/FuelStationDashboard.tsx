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
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

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
    <div className="w-full">
      <div className="mb-4">
        <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Operations <span className="text-[#f97316]">Console</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-tight">Real-time terminal management for {user?.businessName || user?.name}</p>
        </div>

        <div className="flex items-center gap-4 bg-[#0a101f] border border-slate-800 p-3 rounded-xl px-6 shadow-xl">
          <div className="flex flex-col items-end mr-4">
            <span className={`text-[10px] font-semibold tracking-widest ${isAvailable ? 'text-green-500' : 'text-slate-500'}`}>
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
            <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <IndianRupee className="h-3 w-3 text-[#f97316]" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-white mb-1">
                  ₹{dashboardStats?.totalRevenue?.toLocaleString() || todayStats.totalRevenue.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  Live terminal earnings
                </div>
              </div>
              <div className="h-10 w-20 opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardStats?.graphData || []}>
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Droplets className="h-3 w-3 text-orange-500" />
              Petrol Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-white mb-1">
                  {dashboardStats?.petrolSold?.toFixed(1) || (todayStats.totalFuel * 0.6).toFixed(1)} <span className="text-sm font-bold text-slate-500 tracking-normal">LT</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Throughput</p>
              </div>
              <div className="h-10 w-20 opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardStats?.graphData || []}>
                    <Line type="monotone" dataKey="quantity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Droplets className="h-3 w-3 text-blue-500" />
              Diesel Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white mb-1">
              {dashboardStats?.dieselSold?.toFixed(1) || (todayStats.totalFuel * 0.4).toFixed(1)} <span className="text-sm font-bold text-slate-500 tracking-normal">LT</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Inventory Throughput</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Truck className="h-3 w-3 text-green-500" />
              Confirmation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white mb-1">
              {orders.length > 0 
                ? ((orders.filter(o => o.status !== 'cancelled').length / orders.length) * 100).toFixed(0) 
                : 0}%
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
              <Check className="w-3 h-3" />
              Terminal Efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <Card className="lg:col-span-8 bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-900/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp className="text-[#f97316] w-4 h-4" /> Revenue & Volume Dynamics
            </CardTitle>
            <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 bg-slate-950 font-bold">LIVE TELEMETRY</Badge>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px] w-full">
              {dashboardStats?.graphData && dashboardStats.graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardStats.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                      tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="Revenue"
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="quantity" 
                      name="Volume (L)"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorQuantity)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700 flex-col gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Awaiting terminal data</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-[#0a101f] border-slate-800 shadow-xl flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-900/50 pb-4">
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Droplets className="text-blue-500 w-4 h-4" /> Product Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <div className="h-[200px] w-full mb-6">
              {dashboardStats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Petrol', value: dashboardStats.petrolSold },
                        { name: 'Diesel', value: dashboardStats.dieselSold }
                      ].filter(x => x.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex items-center justify-center opacity-20">
                    <Droplets className="w-8 h-8" />
                 </div>
              )}
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Petrol</span>
                  </div>
                  <span className="text-sm font-bold text-white">{dashboardStats?.petrolSold?.toFixed(1) || 0}L</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Diesel</span>
                  </div>
                  <span className="text-sm font-bold text-white">{dashboardStats?.dieselSold?.toFixed(1) || 0}L</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-3 bg-[#0a101f] border-slate-800 shadow-xl flex flex-col">
          <CardHeader className="border-b border-slate-900/50 pb-4">
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="text-yellow-500 w-4 h-4" /> Operational AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[#020817] rounded-xl border border-slate-800 group hover:border-[#f97316]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <p className="text-[11px] font-semibold text-white uppercase tracking-wider">Peak Efficiency</p>
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Your order confirmation time is 14% faster than average. Logistics throughput is optimal.</p>
              </div>

              <div className="p-4 bg-[#020817] rounded-xl border border-slate-800 group hover:border-[#f97316]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <p className="text-[11px] font-semibold text-white uppercase tracking-wider">Volume Forecast</p>
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Anticipated 30% increase in Diesel demand for industrial clusters by Thursday. Sync tanker arrival.</p>
              </div>

              <div className="p-4 bg-[#0a101f] rounded-xl border-2 border-dashed border-[#f97316]/20 group hover:border-[#f97316]/50 transition-all flex flex-col justify-center items-center gap-3">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-ping" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-bounce" />
                 </div>
                 <div className="text-center">
                    <span className="text-[9px] font-bold text-[#f97316] uppercase tracking-[0.2em] block mb-1">Neural Topology Mapping</span>
                    <span className="text-[8px] text-slate-600 font-bold uppercase">Synthesizing node telemetry...</span>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{pendingOrders.length}</div>
            <p className="text-sm text-gray-400">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Truck className="h-5 w-5 text-blue-500" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{activeOrders.length}</div>
            <p className="text-sm text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Droplets className="h-5 w-5 text-green-500" />
              Fuel Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{todayStats.totalFuel.toFixed(2)}L</div>
            <p className="text-sm text-gray-400">
              {todayStats.deliveredOrders} completed order{todayStats.deliveredOrders !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <IndianRupee className="h-5 w-5 text-yellow-500" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">₹{todayStats.totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-gray-400">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
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

        <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
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
    </div>
  );
};

export default FuelStationDashboard;
