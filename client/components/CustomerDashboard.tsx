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
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 gap-2"
              onClick={() => setSelectedStation(null)}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 font-medium px-2 py-0.5">
                Operational
              </Badge>
            </div>
          </div>
        </div>

        {/* Station Header - Full width grid aligned */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 bg-slate-900/50 border border-slate-800/50 rounded-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo and Name - Tightly Aligned */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-white border border-slate-800/50 flex-shrink-0">
                  <img
                    src={selectedStation.avatar || '/placeholder-station.png'}
                    alt={selectedStation.businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-semibold text-white tracking-tight">{selectedStation.businessName}</h1>
              </div>
              
              {/* Badge and Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-700 text-xs">
                    {selectedStation.fuelProvider}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" /> {selectedStation.pumpLocation.city}, {selectedStation.pumpLocation.state}</p>
                  <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" /> Open 24/7</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" /> {selectedStation.phone || "Contact Available"}</p>
                </div>
              </div>
              
              {/* Price Cards - Horizontal and Compact */}
              <div className="flex gap-2 flex-shrink-0 sm:ml-auto">
                <div className="bg-slate-950/50 border border-slate-800/50 px-3 py-2 rounded-md text-center min-w-[65px]">
                  <p className="text-[10px] text-slate-500 font-medium mb-0.5">Petrol</p>
                  <p className="text-base font-semibold text-white">₹{selectedStation.fuelPrices.petrol}</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/50 px-3 py-2 rounded-md text-center min-w-[65px]">
                  <p className="text-[10px] text-slate-500 font-medium mb-0.5">Diesel</p>
                  <p className="text-base font-semibold text-white">₹{selectedStation.fuelPrices.diesel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Full width grid aligned */}
        <Tabs defaultValue="order" className="w-full">
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12">
              <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1 h-11 rounded-md w-full md:w-auto justify-start">
                <TabsTrigger value="order" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium whitespace-nowrap text-sm">
                  Place Order
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium whitespace-nowrap text-sm">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium whitespace-nowrap text-sm">
                  Information
                </TabsTrigger>
                <TabsTrigger value="contact" className="rounded-sm h-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium whitespace-nowrap text-sm">
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
            <Card key={station._id} className="bg-slate-900/50 border-slate-800/50 hover:border-orange-500/30 transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-md overflow-hidden border border-slate-800/50 bg-white p-1 group-hover:border-orange-500/50 transition-colors">
                  <img src={station.avatar || '/placeholder-station.png'} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-500 transition-colors">{station.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 font-medium px-2 py-0">{station.fuelProvider}</Badge>
                    <div className={`w-1.5 h-1.5 rounded-full ${station.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>

              <CardContent className="p-5 flex-1 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 rounded-md bg-slate-950/50 border border-slate-800/50 group-hover:border-orange-500/20 transition-colors">
                    <p className="text-xs text-slate-500 font-medium mb-2">Petrol</p>
                    <p className="text-2xl font-semibold text-white">₹{station.fuelPrices.petrol}</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-slate-950/50 border border-slate-800/50 group-hover:border-orange-500/20 transition-colors">
                    <p className="text-xs text-slate-500 font-medium mb-2">Diesel</p>
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
