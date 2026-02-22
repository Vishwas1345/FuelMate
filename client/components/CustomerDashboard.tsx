import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Truck, ArrowLeft, TrendingUp, MapPin, AlertCircle, Info, MessageSquare, Phone, Store, Clock } from 'lucide-react';
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
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border border-slate-800 shadow-sm flex-shrink-0">
              <img
                src={selectedStation.avatar || '/placeholder-station.png'}
                alt={selectedStation.businessName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">{selectedStation.businessName}</h1>
                <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-transparent">
                  {selectedStation.fuelProvider}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {selectedStation.pumpLocation.city}, {selectedStation.pumpLocation.state}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Open 24/7</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> {selectedStation.phone || "Contact Avail."}</p>
              </div>
            </div>
            <div className="w-full md:w-auto grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-lg text-center min-w-[120px]">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Petrol Price</p>
                <p className="text-2xl font-mono font-bold text-white">₹{selectedStation.fuelPrices.petrol}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-lg text-center min-w-[120px]">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Diesel Price</p>
                <p className="text-2xl font-mono font-bold text-white">₹{selectedStation.fuelPrices.diesel}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 h-14 rounded-lg mb-8 w-full md:w-auto">
            <TabsTrigger value="order" className="rounded-md h-full px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold">
              Place Order
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-md h-full px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-md h-full px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold">
              Information
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-md h-full px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-bold">
              Location & Contact
            </TabsTrigger>
          </TabsList>

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
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Operations <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-slate-400 font-medium">Monitoring fuel partners and delivery logistics for {user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-slate-900 border-slate-700 text-slate-300 py-2 px-4 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-2" /> System Stable
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Active Tracking */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" /> Active Shipments
            </h2>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{activeOrders.length}</Badge>
          </div>

          <OrderTracking
            activeOrders={activeOrders}
            trackingOrderId={trackingOrderId}
            onTrackOrder={setTrackingOrderId}
          />
        </div>

        {/* Main Content: Station Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-500" /> Fuel Partners
            </h2>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Showing {stations.length} Available Locations
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stations.map(station => (
              <Card key={station._id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-800 bg-white">
                    <img src={station.avatar || '/placeholder-station.png'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{station.businessName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{station.fuelProvider} Partner</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`w-2 h-2 rounded-full ${station.isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                  </div>
                </div>
                <CardContent className="p-6 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-2 rounded bg-slate-950 border border-slate-800/50">
                      <p className="text-[9px] text-slate-500 uppercase font-black">Petrol</p>
                      <p className="text-lg font-mono font-bold text-white">₹{station.fuelPrices.petrol}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-slate-950 border border-slate-800/50">
                      <p className="text-[9px] text-slate-500 uppercase font-black">Diesel</p>
                      <p className="text-lg font-mono font-bold text-white">₹{station.fuelPrices.diesel}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-slate-800 border-slate-700 text-white hover:bg-orange-500 hover:border-orange-500 font-bold h-11"
                    onClick={() => setSelectedStation(station)}
                    disabled={!station.isAvailable}
                  >
                    View & Order
                  </Button>
                </CardContent>
              </Card>
            ))}

            {stations.length === 0 && !isLoading && (
              <div className="col-span-full py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg text-center">
                <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg">No Stations Found</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm mt-2">There are currently no active fuel delivery partners in your area. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
