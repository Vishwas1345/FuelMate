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

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [fetchedOrders, fetchedAnalytics] = await Promise.all([
                api.getOrders(),
                api.getAnalytics().catch(() => null)
            ]);

            setAnalyticsData(fetchedAnalytics);

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
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        Logistics <span className="text-[#f97316]">Intelligence</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Real-time tracking and consumption analytics for {user?.name}</p>
                </div>
                <div className="flex gap-4">
                    <Badge className="bg-[#0a101f] border border-slate-800 text-slate-300 py-2 px-4 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">Network Online</span>
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tracking Section */}
                <div className="lg:col-span-12">
                    <Tabs defaultValue="manifest" className="w-full">
                        <TabsList className="bg-[#0a101f] border border-slate-800 p-1 h-14 rounded-xl mb-8">
                            <TabsTrigger value="manifest" className="rounded-lg h-full px-8 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-black uppercase text-xs tracking-widest">
                                Live Tracking
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-lg h-full px-8 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-black uppercase text-xs tracking-widest">
                                Consumption Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manifest" className="outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <div className="bg-[#0a101f] border border-slate-800 rounded-xl p-6 h-full shadow-2xl">
                                        <h3 className="text-xs font-black text-[#f97316] uppercase tracking-[0.2em] mb-6">Status Overview</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-[#020817] border border-slate-800 rounded-lg">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Manifests</p>
                                                <p className="text-2xl font-black text-white">{activeOrders.length}</p>
                                            </div>
                                            <div className="p-4 bg-[#020817] border border-slate-800 rounded-lg">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fleet Status</p>
                                                <p className="text-sm font-black text-green-500 uppercase">Operational</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="bg-[#0a101f] border border-slate-800 rounded-xl p-6 min-h-[500px] shadow-2xl relative overflow-hidden">
                                        {activeOrders.length > 0 ? (
                                            <OrderTracking
                                                activeOrders={activeOrders}
                                                trackingOrderId={trackingOrderId}
                                                onTrackOrder={setTrackingOrderId}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                                <div className="w-24 h-24 rounded-full border-2 border-slate-800 flex items-center justify-center mb-8 bg-[#020817]">
                                                    <ShieldCheck className="w-12 h-12 text-slate-700" />
                                                </div>
                                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">No Active Logistics</h3>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">The system is in standby. No active fuel shipments are currently being tracked in your sector.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Highlights */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-[#0a101f] border border-slate-800 rounded-xl p-6 shadow-2xl">
                                        <div className="flex items-center gap-2 text-[#f97316] mb-8">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Summary</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-5 bg-[#020817] border border-slate-800 rounded-xl">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Throughput</p>
                                                <p className="text-3xl font-black text-white">{analyticsData?.totalFuel || 0} <span className="text-xs text-slate-600">Liters</span></p>
                                            </div>
                                            <div className="p-5 bg-[#020817] border border-slate-800 rounded-xl">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Expenditure</p>
                                                <p className="text-3xl font-black text-white">₹{analyticsData?.totalAmount?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[#f97316]/5 border border-[#f97316]/20 rounded-xl">
                                        <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Usage Insight
                                        </p>
                                        <p className="text-xs text-slate-400 font-bold leading-relaxed px-1">
                                            {analyticsData?.totalFuel > 100
                                                ? "Your consumption profile indicates high operational activity. Recommend auditing bulk fuel sources for better pricing."
                                                : "Operational parameters remain within standard thresholds for individual logistics profiling."}
                                        </p>
                                    </div>
                                </div>

                                {/* Graph */}
                                <div className="lg:col-span-2">
                                    <div className="bg-[#0a101f] border border-slate-800 rounded-xl p-8 min-h-[500px] shadow-2xl flex flex-col">
                                        <div className="flex justify-between items-center mb-12">
                                            <div className="flex items-center gap-2 text-[#f97316]">
                                                <TrendingUp className="w-4 h-4 rotate-45" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volume Index Trend</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 font-black uppercase px-3 py-1">Synced with Server</Badge>
                                        </div>

                                        <div className="flex-1 bg-[#020817]/50 border border-slate-800/50 rounded-2xl p-8 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                                            </div>

                                            {analyticsData?.dailyTrends?.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={analyticsData.dailyTrends}>
                                                        <defs>
                                                            <linearGradient id="mainTelemetry" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                        <XAxis dataKey="date"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                                            dy={15}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                                            itemStyle={{ color: '#f97316', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                                                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                                            cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                        />
                                                        <Area type="monotone" dataKey="quantity" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#mainTelemetry)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full w-full flex flex-col items-center justify-center opacity-20">
                                                    <Activity className="w-12 h-12 mb-4" />
                                                    <p className="text-xs font-black uppercase tracking-widest">Aggregating Historical Logs...</p>
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
