import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Truck, ArrowLeft, TrendingUp, MapPin, AlertCircle, Info, MessageSquare, Phone, Store, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
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
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedStations, fetchedOrders] = await Promise.all([
        api.getStations(),
        api.getOrders()
      ]);

      setStations(fetchedStations);

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
      // Use the specific fuel type endpoint
      if (orderData.fuelType === 'Petrol') {
        await api.createPetrolOrder(orderData);
      } else {
        await api.createDieselOrder(orderData);
      }

      toast({
        title: "Order Successful",
        description: `Your ${orderData.fuelType} order has been placed.`,
      });

      setSelectedStation(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Could not process order.",
        variant: "destructive",
      });
    }
  };

  // ── STATION DETAIL VIEW ───────────────────────────────────────────────────
  if (selectedStation) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 -ml-4 gap-2 border border-transparent hover:border-slate-800"
            onClick={() => setSelectedStation(null)}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status:</span>
            <Badge variant="outline" className="bg-green-500/5 border-green-500/20 text-green-400 font-bold px-3">
              LIVE & OPERATIONAL
            </Badge>
          </div>
        </div>

        {/* Professional Minimal Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border border-slate-800 shadow-sm flex-shrink-0">
              <img
                src={selectedStation.avatar || '/placeholder-station.png'}
                alt={selectedStation.businessName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row flex-wrap items-center md:items-start gap-2 md:gap-4 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{selectedStation.businessName}</h1>
                <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-transparent">
                  {selectedStation.fuelProvider}
                </Badge>
              </div>
              <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-slate-400">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {selectedStation.pumpLocation.city}, {selectedStation.pumpLocation.state}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Open 24/7</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> {selectedStation.phone || "Contact Avail."}</p>
              </div>
            </div>
            <div className="w-full md:w-auto grid grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-0">
              <div className="bg-slate-950 border border-slate-800/50 p-3 md:p-4 rounded-lg text-center flex-1">
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mb-1">Petrol Price</p>
                <p className="text-xl md:text-2xl font-mono font-bold text-white">₹{selectedStation.fuelPrices.petrol}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800/50 p-3 md:p-4 rounded-lg text-center flex-1">
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mb-1">Diesel Price</p>
                <p className="text-xl md:text-2xl font-mono font-bold text-white">₹{selectedStation.fuelPrices.diesel}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="order" className="w-full">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 h-14 rounded-lg mb-8 w-max md:w-auto min-w-full md:min-w-0 justify-start md:justify-center">
              <TabsTrigger value="order" className="rounded-md h-full px-6 md:px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold whitespace-nowrap">
                Place Order
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-md h-full px-6 md:px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold whitespace-nowrap">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-md h-full px-6 md:px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold whitespace-nowrap">
                Information
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-md h-full px-6 md:px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold whitespace-nowrap">
                Location & Contact
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-transparent">
            <TabsContent value="order" className="mt-0 outline-none">
              <FuelOrderForm onSubmit={handleOrderSubmit} station={selectedStation} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-0 outline-none">
              <StationReviews stationId={selectedStation._id} />
            </TabsContent>
            <TabsContent value="about" className="mt-0 outline-none">
              <StationAbout station={selectedStation as any} />
            </TabsContent>
            <TabsContent value="contact" className="mt-0 outline-none">
              <StationContact station={selectedStation as any} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // ── DASHBOARD MAIN VIEW ───────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Operations <span className="text-[#f97316]">Center</span>
          </h1>
          <p className="text-slate-400 font-medium">Monitoring fuel partners and delivery logistics for {user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-[#0a101f] border border-slate-800 text-slate-300 py-2 px-4 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">System Stable</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Active Tracking */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#f97316]" /> Active Shipments
            </h2>
            <div className="bg-[#f97316]/10 text-[#f97316] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f97316]/20">
              {activeOrders.length}
            </div>
          </div>

          <div className="bg-[#0a101f] border border-slate-800 rounded-xl p-6 min-h-[400px]">
            <div className="flex items-center gap-2 text-[#f97316] mb-6">
              <TrendingUp className="w-4 h-4 rotate-45" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Manifest</span>
            </div>

            <div className="bg-[#020817] border border-slate-800 rounded-lg p-3 mb-8 flex justify-between items-center group cursor-pointer hover:border-slate-700 transition-colors">
              <span className="text-xs font-bold text-slate-400">Select Active Shipment</span>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors rotate-90" />
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No operational manifest found.</p>
            </div>
          </div>
        </div>

        {/* Main Content: Station Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Store className="w-4 h-4 text-[#f97316]" /> Fuel Partners
            </h2>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              SHOWING {stations.length} AVAILABLE LOCATIONS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stations.map(station => (
              <Card key={station._id} className="bg-[#0a101f] border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl overflow-hidden flex flex-col group">
                <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 bg-white p-1">
                    <img src={station.avatar || '/placeholder-station.png'} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black text-lg truncate group-hover:text-[#f97316] transition-colors">{station.businessName}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{station.fuelProvider} Partner</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${station.isAvailable ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                </div>

                <CardContent className="p-6 flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-[#020817] border border-slate-800/50">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Petrol</p>
                      <p className="text-2xl font-black text-white">₹{station.fuelPrices.petrol}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#020817] border border-slate-800/50">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Diesel</p>
                      <p className="text-2xl font-black text-white">₹{station.fuelPrices.diesel}</p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-[#1e293b] border border-slate-700 text-white hover:bg-white hover:text-[#020817] font-black uppercase text-xs tracking-widest h-12 transition-all"
                    onClick={() => setSelectedStation(station)}
                    disabled={!station.isAvailable}
                  >
                    View & Order
                  </Button>
                </CardContent>
              </Card>
            ))}

            {stations.length === 0 && !isLoading && (
              <div className="col-span-full py-40 bg-[#0a101f]/50 border border-dashed border-slate-800 rounded-2xl text-center">
                <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-white font-black uppercase tracking-widest">No Operational Partners</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-xs mt-4 leading-relaxed font-bold">There are currently no active fuel delivery partners in your area. Logistics systems are monitoring for updates.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
