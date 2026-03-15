import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Truck, ArrowLeft, TrendingUp, MapPin, AlertCircle, Info, MessageSquare, Phone, Store, Clock, ShieldCheck, ChevronRight, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FuelOrderForm from './FuelOrderForm';
import OrderTracking from './OrderTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StationReviews from './StationReviews';
import StationAbout from './StationAbout';
import StationContact from './StationContact';
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

type Station = {
  _id: string;
  businessName: string;
  pumpLocation: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  fuelProvider: string;
  isAvailable: boolean;
  fuelPrices: {
    petrol: number;
    diesel: number;
  };
  avatar: string;
  about?: string;
  history?: string;
  startingYear?: number;
  email?: string;
  businessPhone?: string;
  phone?: string;
  name?: string;
  role?: string;
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedStations, fetchedOrders, fetchedAnalytics] = await Promise.all([
        api.getStations(),
        api.getOrders(),
        api.getAnalytics().catch(() => null)
      ]);

      setStations(fetchedStations);
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
      console.error("Dashboard fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = async (orderData: any) => {
    try {
      // Use the dedicated place order endpoint
      const response = await api.placeOrder(orderData);

      toast({
        title: "Order Placed Successfully",
        description: `Your ${orderData.fuelType} order has been placed and is being processed.`,
      });

      setSelectedStation(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Could not process order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── STATION DETAIL VIEW ───────────────────────────────────────────────────
  if (selectedStation) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Top Navigation Bar - Aligned with grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-slate-500 hover:text-white hover:bg-slate-800/30 gap-2 text-[10px] font-bold uppercase tracking-widest px-0"
              onClick={() => setSelectedStation(null)}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Status</span>
              <Badge variant="outline" className="bg-green-500/5 border-green-500/20 text-green-500 text-[10px] font-bold uppercase py-0.5">
                Operational
              </Badge>
            </div>
          </div>
        </div>

        {/* Station Header - Full width grid aligned */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 bg-[#0a101f] border border-slate-800/60 rounded-xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all duration-700" />
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 relative z-10">
              {/* Logo and Name */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white p-1 border border-slate-800/50 flex-shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={selectedStation.avatar || '/placeholder-station.png'}
                    alt={selectedStation.businessName}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">{selectedStation.businessName}</h1>
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-none text-[9px] font-bold uppercase tracking-widest px-2">
                      {selectedStation.fuelProvider}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em]">Service</p>
                </div>
              </div>
              
              {/* Vertical Divider for desktop */}
              <div className="hidden lg:block w-px h-16 bg-slate-800/40" />

              {/* Station Metadata Details */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-[11px] font-semibold text-slate-400">
                  <div className="flex items-center gap-2.5 group/item">
                    <div className="w-8 h-8 rounded-lg bg-[#020817] flex items-center justify-center border border-slate-800 shadow-inner">
                      <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-0.5">Location</span>
                      <span className="text-slate-300">{selectedStation.pumpLocation.city}, {selectedStation.pumpLocation.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#020817] flex items-center justify-center border border-slate-800 shadow-inner">
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-0.5">Hours</span>
                      <span className="text-slate-300">Open 24/7 Operations</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#020817] flex items-center justify-center border border-slate-800 shadow-inner">
                      <Phone className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-0.5">Support</span>
                      <span className="text-slate-300">{selectedStation.phone || "Contact Enabled"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Cards - Sophisticated Typography */}
              <div className="flex gap-3 flex-shrink-0 lg:ml-auto">
                <div className="bg-[#020817] border border-slate-800/60 p-3 rounded-xl text-center min-w-[90px] shadow-inner group/price">
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5 px-2">Petrol</p>
                  <p className="text-xl font-bold text-white tracking-tighter">₹{selectedStation.fuelPrices.petrol}</p>
                </div>
                <div className="bg-[#020817] border border-slate-800/60 p-3 rounded-xl text-center min-w-[90px] shadow-inner group/price">
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5 px-2">Diesel</p>
                  <p className="text-xl font-bold text-white tracking-tighter">₹{selectedStation.fuelPrices.diesel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Advanced Branding */}
        <Tabs defaultValue="order" className="w-full">
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12">
              <TabsList className="bg-[#0a101f] border border-slate-800/60 p-1 h-12 rounded-xl w-full md:w-auto overflow-x-auto overflow-y-hidden justify-start no-scrollbar shadow-lg">
                <TabsTrigger value="order" className="rounded-lg h-full px-6 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all duration-300">
                  Place Order
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg h-full px-6 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all duration-300">
                  Client Reviews
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-lg h-full px-6 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all duration-300">
                    About Station
                </TabsTrigger>
                <TabsTrigger value="contact" className="rounded-lg h-full px-6 data-[state=active]:bg-[#f97316] data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all duration-300">
                    Contact
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <TabsContent value="order" className="col-span-12 mt-0 outline-none">
              <FuelOrderForm onSubmit={handleOrderSubmit} station={selectedStation} />
            </TabsContent>
            <TabsContent value="reviews" className="col-span-12 mt-0 outline-none">
              <StationReviews stationId={selectedStation._id} />
            </TabsContent>
            <TabsContent value="about" className="col-span-12 mt-0 outline-none">
              <StationAbout station={selectedStation as any} />
            </TabsContent>
            <TabsContent value="contact" className="col-span-12 mt-0 outline-none">
              <StationContact station={selectedStation as any} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // ── DASHBOARD MAIN VIEW ───────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-1.5">
              Fuel <span className="text-orange-500">Partners</span>
            </h1>
            <p className="text-slate-400 text-sm">Select a partner station to place your fuel order.</p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-slate-900/50 border border-slate-800/50 text-slate-300 py-1.5 px-3 rounded-md flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium">Online</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex items-center justify-between border-b border-slate-800/50 pb-3 mb-6">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-500" /> Available Stations
          </h2>
          <div className="text-xs text-slate-500 font-medium">
            {stations.length} Active
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map(station => (
            <Card key={station._id} className="bg-[#0a101f] border-slate-800/60 hover:border-orange-500/30 transition-all duration-300 overflow-hidden flex flex-col group shadow-xl">
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-md overflow-hidden border border-slate-800/50 bg-[#020817] p-1 group-hover:border-orange-500/50 transition-colors">
                  <img src={station.avatar || '/placeholder-station.png'} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-500 transition-colors">{station.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/50 px-2 py-0">{station.fuelProvider}</Badge>
                    <div className={`w-1.5 h-1.5 rounded-full ${station.isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>

              <CardContent className="p-5 flex-1 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 rounded-xl bg-[#020817] border border-slate-800/50 group-hover:border-orange-500/20 transition-colors shadow-inner">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Petrol</p>
                    <p className="text-2xl font-semibold text-white">₹{station.fuelPrices.petrol}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[#020817] border border-slate-800/50 group-hover:border-orange-500/20 transition-colors shadow-inner">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Diesel</p>
                    <p className="text-2xl font-semibold text-white">₹{station.fuelPrices.diesel}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="truncate">{station.pumpLocation.city}, {station.pumpLocation.state}</span>
                  </div>
                  <Button
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 font-medium h-11 rounded-md transition-all"
                    onClick={() => setSelectedStation(station)}
                    disabled={!station.isAvailable}
                  >
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {stations.length === 0 && !isLoading && (
            <div className="col-span-full py-32 bg-slate-900/30 border border-dashed border-slate-800/50 rounded-md text-center">
              <div className="w-16 h-16 rounded-md border-2 border-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">No Stations Available</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">No fuel stations are currently available in your area.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
