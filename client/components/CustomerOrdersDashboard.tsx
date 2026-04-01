import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, TrendingUp, ChevronRight, Activity, Zap, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

export const CustomerOrdersDashboard = () => {
    const { user } = useAuth();
    const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
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
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                                            {analyticsData?.totalFuel > 100
                                                ? "High-volume throughput detected. Synchronize bunkering for efficiency."
                                                : "Operational throughput within baseline parameters."}
                                        </p>
                                    </div>
                                </div>

                                {/* Graph */}
                                <div className="lg:col-span-2">
                                    <div className="bg-[#0a101f] border border-slate-800/60 rounded-xl p-6 min-h-[500px] flex flex-col shadow-xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Order Summary</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 font-bold bg-[#020817] px-2 py-0.5">ESTABLISHED</Badge>
                                        </div>

                                        <div className="flex-1 bg-[#020817] border border-slate-800/40 rounded-xl p-6 relative overflow-hidden shadow-inner">
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
                                                        <XAxis dataKey="date"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                                            dy={15}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                                            itemStyle={{ color: '#f97316', fontWeight: 'bold', fontSize: '12px' }}
                                                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                                            cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                                                        />
                                                        <Area type="monotone" dataKey="quantity" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#mainTelemetry)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full w-full flex flex-col items-center justify-center opacity-20">
                                                    <Activity className="w-10 h-10 mb-3" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">No terminal data</p>
                                                </div>
                                            )}
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
