import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Check, X, Clock, Truck, Phone, Mail, User,
  IndianRupee, TrendingUp, TrendingDown, Calendar, AlertCircle,
  BarChart3, Droplets, Users, Settings, Zap, ArrowLeft,
  Sparkles, Fuel, CreditCard, Activity
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
  graphData: { date: string; amount: number; quantity?: number }[];
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

  /** Rules-based “AI” insights derived from this station’s real orders & analytics (no external LLM). */
  const operationalAiInsights = useMemo(() => {
    const all = orders;
    const delivered = all.filter((o) => o.status === 'delivered');
    const pending = all.filter((o) => o.status === 'pending').length;
    const active = all.filter(
      (o) => o.status === 'confirmed' || o.status === 'in-transit'
    ).length;
    const graph = dashboardStats?.graphData ?? [];
    const pVol = Number(dashboardStats?.petrolSold) || 0;
    const dVol = Number(dashboardStats?.dieselSold) || 0;

    type Insight = {
      title: string;
      body: string;
      Icon: React.ComponentType<{ className?: string }>;
      borderClass: string;
    };
    const out: Insight[] = [];

    if (pending === 0 && active === 0) {
      out.push({
        title: 'Dispatch queue',
        body: 'No pending confirmations and no live routes — terminal capacity is fully available for new inbound orders.',
        Icon: Check,
        borderClass: 'border-green-500/25 hover:border-green-500/40',
      });
    } else if (pending >= 6) {
      out.push({
        title: 'Queue pressure',
        body: `${pending} orders await acceptance. Model recommendation: batch confirmations every 10–15 minutes to protect customer SLA and reduce churn.`,
        Icon: AlertCircle,
        borderClass: 'border-amber-500/35 hover:border-amber-500/50',
      });
    } else {
      out.push({
        title: 'Dispatch queue',
        body: `${pending} pending · ${active} on route. Depth is within normal band for a single-hub operation.`,
        Icon: Truck,
        borderClass: 'border-slate-800 hover:border-[#f97316]/30',
      });
    }

    if (graph.length >= 4) {
      const amounts = graph.map((g: any) => Number(g.amount) || 0);
      const n = amounts.length;
      const recentAvg = amounts.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const priorAvg =
        amounts.slice(0, Math.max(1, n - 3)).reduce((a, b) => a + b, 0) /
        Math.max(1, n - 3);
      const pct =
        priorAvg > 0.01
          ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100)
          : 0;
      if (Math.abs(pct) < 5) {
        out.push({
          title: 'Revenue momentum',
          body: `Trailing 3-day revenue (~₹${recentAvg.toFixed(0)}/day avg) tracks your prior baseline (±${Math.abs(pct)}%).`,
          Icon: BarChart3,
          borderClass: 'border-blue-500/25 hover:border-blue-500/40',
        });
      } else if (pct > 0) {
        out.push({
          title: 'Revenue momentum',
          body: `Run-rate is ~${pct}% above the earlier window — momentum positive; keep pricing and uptime consistent.`,
          Icon: TrendingUp,
          borderClass: 'border-blue-500/25 hover:border-blue-500/40',
        });
      } else {
        out.push({
          title: 'Revenue momentum',
          body: `Run-rate is ~${Math.abs(pct)}% softer than the prior span — sanity-check listing visibility and competitor corridors.`,
          Icon: TrendingDown,
          borderClass: 'border-amber-500/30 hover:border-amber-500/45',
        });
      }
    } else {
      out.push({
        title: 'Revenue momentum',
        body: 'Need a few more days of delivered volume in the ledger before run-rate deltas are meaningful.',
        Icon: BarChart3,
        borderClass: 'border-slate-800 hover:border-slate-700',
      });
    }

    if (graph.length >= 2) {
      const qty = graph.map((g: any) => Number(g.quantity) || 0);
      const last = qty[qty.length - 1];
      const prev = qty[qty.length - 2];
      if (prev > 0 && last > prev * 1.12) {
        out.push({
          title: 'Volume inflection',
          body: `Latest interval shows ${last.toFixed(0)}L vs ${prev.toFixed(0)}L prior — litre demand spiked; pre-stage diesel bowsers if mix skews heavy.`,
          Icon: Droplets,
          borderClass: 'border-orange-500/25 hover:border-orange-500/40',
        });
      } else if (prev > 0 && last < prev * 0.88) {
        out.push({
          title: 'Volume inflection',
          body: `Latest interval dipped vs prior bar (${last.toFixed(0)}L vs ${prev.toFixed(0)}L) — check dispatch SLA and intraday pricing.`,
          Icon: Droplets,
          borderClass: 'border-slate-700 hover:border-slate-600',
        });
      } else {
        out.push({
          title: 'Volume stability',
          body:
            graph.length > 0
              ? `Last bar ${last.toFixed(0)}L — day-over-day flow is stable; no sharp litre shock detected.`
              : 'Volume curve is flat — await more telemetry.',
          Icon: Droplets,
          borderClass: 'border-slate-800 hover:border-[#f97316]/20',
        });
      }
    }

    const mix = pVol + dVol;
    if (mix > 0) {
      const dPct = Math.round((dVol / mix) * 100);
      let body: string;
      if (dPct >= 42) {
        body = `Historical mix ~${dPct}% diesel — bias stocking checks & driver routing toward diesel-heavy slots (weekday AM).`;
      } else if (dPct <= 28) {
        body = `Historical mix ~${100 - dPct}% petrol — retail skim pattern; prioritize rapid turn on smaller drum orders.`;
      } else {
        body = `Mix ~${dPct}% diesel / ${100 - dPct}% petrol — balanced; rotate fleet capacity evenly across shifts.`;
      }
      out.push({
        title: 'Product-mix signal',
        body,
        Icon: Fuel,
        borderClass: 'border-[#f97316]/20 hover:border-[#f97316]/40',
      });
    }

    let digital = 0;
    let cash = 0;
    delivered.forEach((o) => {
      const m = String(o.paymentMethod || '').toLowerCase();
      if (m === 'cash') cash += 1;
      else if (m) digital += 1;
    });
    const payN = digital + cash;
    if (payN > 0) {
      const digPct = Math.round((digital / payN) * 100);
      out.push({
        title: 'Settlement pattern',
        body: `${digPct}% of completed orders settled non-cash — ${
          digPct >= 55
            ? 'lower field cash risk; reconcile UPI batches nightly.'
            : 'higher cash exposure on bowsers; tighten receipt discipline.'
        }`,
        Icon: IndianRupee,
        borderClass: 'border-emerald-500/20 hover:border-emerald-500/35',
      });
    }

    const daysWithData = Math.max(7, graph.length || 1);
    const avgDeliveredPerDay = delivered.length / daysWithData;
    const todayDel = todayStats.deliveredOrders;
    if (delivered.length >= 8 && avgDeliveredPerDay > 0) {
      if (todayDel > avgDeliveredPerDay * 1.2) {
        out.push({
          title: 'Intraday cadence',
          body: `Today: ${todayDel} closes vs ~${avgDeliveredPerDay.toFixed(1)} typical per day — fulfillment velocity is above your rolling norm.`,
          Icon: Zap,
          borderClass: 'border-yellow-500/25 hover:border-yellow-500/40',
        });
      } else if (todayDel > 0) {
        out.push({
          title: 'Intraday cadence',
          body: `Today: ${todayDel} delivered so far — hold dispatch discipline through evening peak to match weekly average.`,
          Icon: Calendar,
          borderClass: 'border-slate-800 hover:border-slate-700',
        });
      }
    }

    while (out.length < 4) {
      out.push({
        title: 'Model calibration',
        body: 'Feed more closed orders into the ledger; forecasts tighten as delivered history crosses ~2 weeks of dense data.',
        Icon: Sparkles,
        borderClass: 'border-dashed border-[#f97316]/20 hover:border-[#f97316]/40',
      });
    }

    return out.slice(0, 6);
  }, [orders, dashboardStats, todayStats.deliveredOrders]);

  /** Extra chart series derived from analytics + raw orders */
  const dailyRevenueBarData = useMemo(() => {
    const g = dashboardStats?.graphData ?? [];
    return g.map((row) => ({
      ...row,
      label: (() => {
        try {
          const d = new Date(row.date.includes('T') ? row.date : `${row.date}T12:00:00`);
          return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        } catch {
          return row.date;
        }
      })(),
    }));
  }, [dashboardStats?.graphData]);

  const ordersPerDayBarData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const raw = o.timestamp || o.createdAt;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => {
        let label = date;
        try {
          label = new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });
        } catch {
          /* keep key */
        }
        return { date, label, orders: count };
      });
  }, [orders]);

  const orderStatusBarData = useMemo(() => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-transit': 'In transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const s = String(o.status || 'unknown').toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    const orderKeys = ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'];
    return orderKeys
      .filter((k) => (counts[k] || 0) > 0)
      .map((key) => ({ name: labels[key], count: counts[key] || 0, key }));
  }, [orders]);

  const paymentMethodBarData = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'delivered');
    const map = new Map<string, number>();
    delivered.forEach((o) => {
      let m = String(o.paymentMethod || 'Not recorded').trim();
      if (!m) m = 'Not recorded';
      m = m.replace(/_/g, ' ');
      const label = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const chartTooltipStyle = {
    backgroundColor: '#020817',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    boxShadow: '0 0px 25px -5px rgb(0 0 0 / 0.35)',
  };

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

      {/* Additional analytics charts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#f97316]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Pipeline &amp; distribution</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-900/50 pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <IndianRupee className="text-[#f97316] w-4 h-4" /> Daily revenue
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Completed orders — amount per day</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[260px] w-full">
                {dailyRevenueBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyRevenueBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}
                        formatter={(value: number) => [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Revenue']}
                      />
                      <Bar dataKey="amount" name="Revenue" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <BarChart3 className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No daily revenue yet</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-900/50 pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="text-blue-400 w-4 h-4" /> Orders per day
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-medium mt-1">All statuses — last 14 days with activity</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[260px] w-full">
                {ordersPerDayBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersPerDayBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Activity className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No order history</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-900/50 pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Truck className="text-emerald-400 w-4 h-4" /> Order pipeline
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Count by current status</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[260px] w-full">
                {orderStatusBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={orderStatusBarData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={88}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {orderStatusBarData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={
                              {
                                pending: '#f59e0b',
                                confirmed: '#3b82f6',
                                'in-transit': '#6366f1',
                                delivered: '#22c55e',
                                cancelled: '#64748b',
                              }[entry.key] || '#f97316'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Truck className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No orders loaded</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-900/50 pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <CreditCard className="text-violet-400 w-4 h-4" /> Payment mix
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Delivered orders only</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[260px] w-full">
                {paymentMethodBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodBarData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar dataKey="count" name="Orders" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <CreditCard className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No completed payments yet</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-3 bg-[#0a101f] border-slate-800 shadow-xl flex flex-col">
          <CardHeader className="border-b border-slate-900/50 pb-4">
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="text-yellow-500 w-4 h-4" /> Operational AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-[10px] text-slate-500 font-medium mb-4 leading-relaxed">
              Short-range signals from your live order ledger and daily trends (rules engine — refreshes with dashboard data).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operationalAiInsights.map(({ title, body, Icon, borderClass }, i) => (
                <div
                  key={`${title}-${i}`}
                  className={`p-4 bg-[#020817] rounded-xl border transition-all group ${borderClass}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-slate-300 shrink-0" />
                    <p className="text-[11px] font-semibold text-white uppercase tracking-wider">{title}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{body}</p>
                </div>
              ))}
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
