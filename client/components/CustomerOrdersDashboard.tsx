import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Truck, Activity, Zap, ShieldCheck,
  IndianRupee, CreditCard, BarChart3, PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import OrderTracking from './OrderTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from '@/services/api';

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

const CHART_tooltip = {
  backgroundColor: '#020817',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
};

const FUEL_COLORS: Record<string, string> = {
  Petrol: '#f97316',
  Diesel: '#3b82f6',
  Other: '#64748b',
};

function normalizeFuelLabel(fuelType: string): 'Petrol' | 'Diesel' | 'Other' {
  const f = String(fuelType || '').toLowerCase();
  if (f.includes('diesel')) return 'Diesel';
  if (f.includes('petrol') || f.includes('gasoline')) return 'Petrol';
  return 'Other';
}

export const CustomerOrdersDashboard = () => {
    useAuth();
    const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
    const [allOrders, setAllOrders] = useState<CustomerOrder[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const buildAnalyticsFallback = (orders: any[]) => {
        const delivered = (orders || []).filter(o => String(o.status || '').toLowerCase() === 'delivered');
        const totalFuel = delivered.reduce((acc, o) => acc + (Number(o.quantity) || 0), 0);
        const totalAmount = delivered.reduce((acc, o) => acc + (Number(o.totalPrice ?? o.price) || 0), 0);

        const map = new Map<string, { date: string; quantity: number; amount: number }>();
        for (const o of delivered) {
            const date = o.createdAt ? new Date(o.createdAt) : (o.timestamp ? new Date(o.timestamp) : new Date());
            const key = Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
            const prev = map.get(key) || { date: key, quantity: 0, amount: 0 };
            prev.quantity += Number(o.quantity) || 0;
            prev.amount += Number(o.totalPrice ?? o.price) || 0;
            map.set(key, prev);
        }

        const dailyTrends = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
        return { totalFuel, totalAmount, dailyTrends };
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [fetchedOrders, fetchedAnalytics] = await Promise.all([
                api.getOrders(),
                api.getAnalytics().catch(() => null)
            ]);

            const fallback = buildAnalyticsFallback(fetchedOrders);
            const mergedAnalytics = {
                ...(fetchedAnalytics || {}),
                totalFuel: fetchedAnalytics?.totalFuel ?? fallback.totalFuel,
                totalAmount: fetchedAnalytics?.totalAmount ?? fallback.totalAmount,
                dailyTrends: (Array.isArray(fetchedAnalytics?.dailyTrends) && fetchedAnalytics.dailyTrends.length > 0)
                    ? fetchedAnalytics.dailyTrends
                    : fallback.dailyTrends,
            };
            setAnalyticsData(mergedAnalytics);

            const formattedOrders = fetchedOrders.map((order: any) => ({
                id: order._id,
                status: order.status,
                fuelType: order.fuelType,
                quantity: order.quantity,
                brand: order.brand,
                price: order.totalPrice,
                deliveryAddress: order.deliveryAddress,
                timestamp: new Date(order.createdAt),
                estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
                deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
                paymentMethod: order.paymentMethod,
                driver: order.driver
            }));

            setAllOrders(formattedOrders);
            setActiveOrders(formattedOrders.filter((o: any) =>
                ['pending', 'confirmed', 'in-transit'].includes(o.status)
            ));
        } catch (error) {
            console.error("Orders Dashboard fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const deliveredOrders = useMemo(
        () => allOrders.filter((o) => String(o.status).toLowerCase() === 'delivered'),
        [allOrders],
    );

    const dailySpendBarData = useMemo(() => {
        const trends = analyticsData?.dailyTrends ?? [];
        return trends.map((row: any) => ({
            ...row,
            label: (() => {
                try {
                    const raw = String(row.date);
                    const d = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);
                    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                } catch {
                    return row.date;
                }
            })(),
        }));
    }, [analyticsData?.dailyTrends]);

    const fuelMixData = useMemo(() => {
        const map = new Map<string, number>();
        deliveredOrders.forEach((o) => {
            const label = normalizeFuelLabel(o.fuelType);
            map.set(label, (map.get(label) || 0) + (Number(o.quantity) || 0));
        });
        return (['Petrol', 'Diesel', 'Other'] as const)
            .map((name) => ({ name, litres: Math.round((map.get(name) || 0) * 10) / 10 }))
            .filter((r) => r.litres > 0);
    }, [deliveredOrders]);

    const paymentBarData = useMemo(() => {
        const map = new Map<string, number>();
        deliveredOrders.forEach((o) => {
            let m = String(o.paymentMethod || 'Not recorded').trim();
            if (!m) m = 'Not recorded';
            m = m.replace(/_/g, ' ');
            const label = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
            map.set(label, (map.get(label) || 0) + 1);
        });
        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [deliveredOrders]);

    const orderStatusBarData = useMemo(() => {
        const labels: Record<string, string> = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            'in-transit': 'In transit',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };
        const counts: Record<string, number> = {};
        allOrders.forEach((o) => {
            const s = String(o.status || 'unknown').toLowerCase();
            counts[s] = (counts[s] || 0) + 1;
        });
        const orderKeys = ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'];
        return orderKeys
            .filter((k) => (counts[k] || 0) > 0)
            .map((key) => ({ name: labels[key], count: counts[key] || 0, key }));
    }, [allOrders]);

    const logisticsInsights = useMemo(() => {
        const trends = analyticsData?.dailyTrends ?? [];
        const lines: string[] = [];
        if (deliveredOrders.length === 0) {
            return ['Complete a delivery to unlock consumption trends, fuel mix, and payment breakdowns.'];
        }
        const totalL = Number(analyticsData?.totalFuel) || 0;
        if (totalL >= 100) {
            lines.push(
                `Cumulative ${Math.round(totalL)}L delivered — spacing larger bookings can smooth weekly cash outflow.`,
            );
        }
        if (trends.length >= 2) {
            const qty = trends.map((t: any) => Number(t.quantity) || 0);
            const last = qty[qty.length - 1];
            const prev = qty[qty.length - 2];
            if (prev > 0 && last > prev * 1.15) {
                lines.push(`Latest period (${last}L) is above the prior bar (${prev}L) — demand uptick on your account.`);
            } else if (prev > 0 && last < prev * 0.85) {
                lines.push('Recent litres are softer than the previous period — often aligns with fewer trips or smaller drums.');
            }
        }
        const avgTicket =
            deliveredOrders.length > 0
                ? deliveredOrders.reduce((a, o) => a + (Number(o.price) || 0), 0) / deliveredOrders.length
                : 0;
        if (avgTicket > 0) {
            lines.push(
                `Average fulfilled order ≈ ₹${Math.round(avgTicket).toLocaleString('en-IN')} — pair with the spend bars below.`,
            );
        }
        if (lines.length === 0) {
            lines.push('Consumption is steady. Use the charts below for spend, fuel mix, and payment habits.');
        }
        return lines.slice(0, 3);
    }, [deliveredOrders, analyticsData?.dailyTrends, analyticsData?.totalFuel]);

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-1.5">
                        Orders <span className="text-orange-500">Dashboard</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Track your orders and view consumption analytics</p>
                </div>
                <div className="flex gap-3">
                    <Badge className="bg-slate-900/50 border border-slate-800/50 text-slate-300 py-1.5 px-3 rounded-md flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium">Online</span>
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tracking Section */}
                <div className="lg:col-span-12">
                    <Tabs defaultValue="manifest" className="w-full">
                        <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1 h-11 rounded-md mb-6">
                            <TabsTrigger value="manifest" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium text-sm">
                                Live Tracking
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium text-sm">
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manifest" className="outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1">
                                    <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 h-full shadow-xl">
                                        <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Status Overview</h3>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-[#020817] border border-slate-800/50 rounded-lg shadow-inner">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Orders</p>
                                                <p className="text-2xl font-semibold text-white">{activeOrders.length}</p>
                                            </div>
                                            <div className="p-4 bg-[#020817] border border-slate-800/50 rounded-lg shadow-inner">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                                                <p className="text-sm font-bold text-green-500 uppercase tracking-tighter">Operational</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-6 min-h-[500px] relative overflow-hidden shadow-xl">
                                        {activeOrders.length > 0 ? (
                                            <OrderTracking
                                                activeOrders={activeOrders}
                                                trackingOrderId={trackingOrderId}
                                                onTrackOrder={setTrackingOrderId}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                                <div className="w-16 h-16 rounded-xl border-2 border-slate-800/50 flex items-center justify-center mb-4 bg-[#020817] shadow-inner">
                                                    <ShieldCheck className="w-8 h-8 text-slate-700" />
                                                </div>
                                                <h3 className="text-white font-semibold text-base mb-2">No Active Orders</h3>
                                                <p className="text-sm text-slate-500 max-w-sm">No active fuel orders are currently being tracked.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="outline-none">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Highlights */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 shadow-xl">
                                            <div className="flex items-center gap-2 text-orange-500 mb-6">
                                                <Zap className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Summary</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-[#020817] border border-slate-800/50 rounded-lg shadow-inner">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Total Fuel</p>
                                                    <p className="text-2xl font-semibold text-white">{analyticsData?.totalFuel || 0} <span className="text-xs text-slate-600 font-bold tracking-normal uppercase">Liters</span></p>
                                                </div>
                                                <div className="p-4 bg-[#020817] border border-slate-800/50 rounded-lg shadow-inner">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Total Spent</p>
                                                    <p className="text-2xl font-semibold text-white">₹{analyticsData?.totalAmount?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Activity className="w-4 h-4" /> Logistics Pulse
                                            </p>
                                            <ul className="space-y-2.5">
                                                {logisticsInsights.map((line, i) => (
                                                    <li key={i} className="text-[11px] text-slate-500 font-bold leading-relaxed flex gap-2">
                                                        <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Main trend */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-6 flex flex-col shadow-xl">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Consumption trend</span>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 font-bold bg-[#020817] px-2 py-0.5">
                                                    {Array.isArray(analyticsData?.dailyTrends) ? `${analyticsData.dailyTrends.length} pts` : '0 pts'}
                                                </Badge>
                                            </div>

                                            <div className="h-[420px] bg-[#020817] border border-slate-800/40 rounded-xl p-6 relative overflow-hidden shadow-inner">
                                                {analyticsData?.dailyTrends?.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={analyticsData.dailyTrends}>
                                                            <defs>
                                                                <linearGradient id="mainTelemetry" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
                                                            <XAxis
                                                                dataKey="date"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                                                dy={15}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                                                label={{ value: 'Litres', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={CHART_tooltip}
                                                                itemStyle={{ color: '#f97316', fontWeight: 'bold', fontSize: '12px' }}
                                                                labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                                                cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                                                            />
                                                            <Area type="monotone" dataKey="quantity" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#mainTelemetry)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                                        <div className="w-14 h-14 rounded-xl border border-slate-800/60 bg-[#0a101f] flex items-center justify-center shadow-inner mb-4">
                                                            <Activity className="w-7 h-7 text-slate-600" />
                                                        </div>
                                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No summary data yet</p>
                                                        <p className="text-xs text-slate-600 mt-2 max-w-sm">
                                                            Analytics appears after at least one delivered order. If you have delivered orders, hit refresh or sync.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 className="w-5 h-5 text-orange-500" />
                                        <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Spend &amp; breakdown</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 shadow-xl overflow-hidden">
                                            <div className="flex items-center gap-2 text-slate-300 mb-1">
                                                <IndianRupee className="w-4 h-4 text-orange-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Daily spend</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-3">Delivered orders — amount per day</p>
                                            <div className="h-[240px] w-full">
                                                {dailySpendBarData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={dailySpendBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                            <XAxis
                                                                dataKey="label"
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
                                                                tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                                                            />
                                                            <Tooltip
                                                                contentStyle={CHART_tooltip}
                                                                formatter={(value: number) =>
                                                                    [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Spent']
                                                                }
                                                            />
                                                            <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} name="Spent" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                                        No spend history
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 shadow-xl overflow-hidden">
                                            <div className="flex items-center gap-2 text-slate-300 mb-1">
                                                <PieChartIcon className="w-4 h-4 text-orange-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fuel mix</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-3">Litres delivered by type</p>
                                            <div className="h-[240px] w-full flex items-center">
                                                {fuelMixData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={fuelMixData.map((d) => ({ name: d.name, value: d.litres }))}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={52}
                                                                outerRadius={72}
                                                                paddingAngle={4}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {fuelMixData.map((entry) => (
                                                                    <Cell key={entry.name} fill={FUEL_COLORS[entry.name] || '#64748b'} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={CHART_tooltip}
                                                                formatter={(value: number) => [`${value} L`, 'Delivered']}
                                                            />
                                                            <Legend
                                                                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                                                formatter={(value) => <span className="text-slate-400 font-semibold">{value}</span>}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                                        No fuel mix yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 shadow-xl overflow-hidden">
                                            <div className="flex items-center gap-2 text-slate-300 mb-1">
                                                <CreditCard className="w-4 h-4 text-violet-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Payments</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-3">Delivered orders by method</p>
                                            <div className="h-[240px] w-full">
                                                {paymentBarData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={paymentBarData} margin={{ top: 8, right: 8, left: 0, bottom: 36 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                                                                interval={0}
                                                                angle={-25}
                                                                textAnchor="end"
                                                                height={44}
                                                            />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                                                            <Tooltip contentStyle={CHART_tooltip} formatter={(value: number) => [value, 'Orders']} />
                                                            <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                                        No payment data
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-5 shadow-xl overflow-hidden">
                                            <div className="flex items-center gap-2 text-slate-300 mb-1">
                                                <Truck className="w-4 h-4 text-emerald-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Order pipeline</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-3">All orders by status</p>
                                            <div className="h-[240px] w-full">
                                                {orderStatusBarData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            layout="vertical"
                                                            data={orderStatusBarData}
                                                            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
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
                                                            <Tooltip contentStyle={CHART_tooltip} formatter={(value: number) => [value, 'Orders']} />
                                                            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26}>
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
                                                    <div className="h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                                        No orders
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};
