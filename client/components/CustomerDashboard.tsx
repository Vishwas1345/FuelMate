import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Fuel, Truck, ArrowLeft, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import FuelOrderForm from './FuelOrderForm';
import OrderTracking from './OrderTracking';
import { useAuth } from '@/contexts/AuthContext';

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

type FormData = {
  fuelType: 'Petrol' | 'Diesel';
  quantity: string;
  brand: string;
  selectedStation: string;
  deliveryAddress: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking';
};

const BASE_PRICES = {
  Petrol: 102.50,
  Diesel: 89.75
};

const generateRandomPrice = (basePrice: number) => {
  const fluctuation = (Math.random() * 4 - 2);
  return Number((basePrice + fluctuation).toFixed(2));
};

declare global {
  interface Window {
    orderSystem: any;
  }
}

type Station = {
  _id: string;
  businessName: string;
  pumpLocation: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  fuelProvider: string;
  isAvailable: boolean;
  fuelPrices: {
    petrol: number;
    diesel: number;
  };
  avatar: string;
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
  const [pastOrders, setPastOrders] = useState<CustomerOrder[]>([]);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [fuelPrices, setFuelPrices] = useState({
    Petrol: BASE_PRICES.Petrol,
    Diesel: BASE_PRICES.Diesel
  });

  useEffect(() => {
    const fetchStations = async () => {
      // @ts-ignore
      const city = user?.addresses?.[0]?.city;
      try {
        const url = city
          ? `${import.meta.env.VITE_BACKEND_URL}/api/users/stations?city=${encodeURIComponent(city)}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/users/stations`;

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStations(data);
        }
      } catch (error) {
        console.error("Failed to fetch stations", error);
      }

      if (!window.orderSystem) {
        setIsLoading(false);
        return;
      }

      const updateOrdersState = () => {
        const allOrders = [
          ...window.orderSystem.orders,
          ...window.orderSystem.orderHistory
        ];
        const formattedOrders = allOrders.map(order => ({
          ...order,
          quantity: Number(order.quantity) || 0,
          price: Number(order.price) || 0,
          timestamp: new Date(order.timestamp),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined
        }));
        setLocalOrders(formattedOrders);
        setIsLoading(false);
      };

      window.orderSystem.subscribeToUpdates(updateOrdersState);
      updateOrdersState();

      return () => {
        window.orderSystem.listeners = window.orderSystem.listeners.filter(
          (listener: any) => listener !== updateOrdersState
        );
      };
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (!localOrders) return;

    const customerOrders = localOrders.map(order => ({
      id: order._id,
      status: order.status as 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled',
      fuelType: order.fuelType,
      quantity: Number(order.quantity),
      brand: order.brand,
      price: Number(order.price || order.totalPrice),
      deliveryAddress: order.deliveryAddress,
      timestamp: new Date(order.createdAt || order.timestamp),
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      paymentMethod: order.paymentMethod,
      driver: order.driver
    }));

    setActiveOrders(customerOrders.filter(o =>
      o.status === 'pending' || o.status === 'confirmed' || o.status === 'in-transit'
    ));
    setPastOrders(customerOrders.filter(o => o.status === 'delivered'));
  }, [localOrders]);

  useEffect(() => {
    setFuelPrices({
      Petrol: generateRandomPrice(BASE_PRICES.Petrol),
      Diesel: generateRandomPrice(BASE_PRICES.Diesel)
    });
    const interval = setInterval(() => {
      setFuelPrices({
        Petrol: generateRandomPrice(BASE_PRICES.Petrol),
        Diesel: generateRandomPrice(BASE_PRICES.Diesel)
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = async (orderData: FormData) => {
    try {
      const quantity = parseFloat(orderData.quantity);
      if (isNaN(quantity) || quantity <= 0) throw new Error('Please enter a valid quantity');
      if (!orderData.fuelType || !orderData.brand || !orderData.deliveryAddress || !orderData.paymentMethod || !orderData.selectedStation) {
        throw new Error('Please fill in all required fields');
      }

      const totalPrice = quantity * fuelPrices[orderData.fuelType];

      window.orderSystem.addOrder({
        customer: user?.name || 'Unknown',
        fuelType: orderData.fuelType,
        quantity,
        brand: orderData.brand,
        price: totalPrice,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod
      });

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and is waiting for confirmation.",
      });

      setSelectedStation(null);
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── ORDER VIEW ─────────────────────────────────────────────────────────────
  if (selectedStation) {
    return (
      <div className="container px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white pl-0 gap-2"
            onClick={() => setSelectedStation(null)}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Stations
          </Button>
        </div>

        {/* Station info banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-orange-500/30 flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex-shrink-0 border-2 border-orange-500/40">
            <img
              src={selectedStation.avatar || '/placeholder-station.png'}
              alt={selectedStation.businessName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-lg leading-tight">{selectedStation.businessName}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 flex-shrink-0" /> {selectedStation.fuelProvider} Partner
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
              {selectedStation.pumpLocation?.addressLine}, {selectedStation.pumpLocation?.city}
            </p>
          </div>
          <div className="flex gap-4 text-right ml-auto">
            <div>
              <p className="text-xs text-gray-500">Petrol</p>
              <p className="text-orange-400 font-mono font-bold text-sm">₹{selectedStation.fuelPrices?.petrol || fuelPrices.Petrol}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Diesel</p>
              <p className="text-blue-400 font-mono font-bold text-sm">₹{selectedStation.fuelPrices?.diesel || fuelPrices.Diesel}</p>
            </div>
          </div>
        </div>

        <FuelOrderForm onSubmit={handleOrderSubmit} fuelPrices={fuelPrices} />
      </div>
    );
  }

  // ── MAIN DASHBOARD VIEW ────────────────────────────────────────────────────
  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="mb-4">
        <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome back, <span className="text-orange-500">{user?.name}</span>
        </h1>
      </div>

      {/* Station Cards */}
      {stations.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Fuel className="text-orange-500" /> Available Fuel Stations Nearby
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Card key={station._id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all duration-300 group overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-900 bg-white overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                      <img src={station.avatar || '/placeholder-station.png'} alt={station.businessName} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <Badge className={`absolute top-4 right-4 ${station.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                    {station.isAvailable ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
                <CardHeader className="pt-10 pb-2">
                  <CardTitle className="text-lg text-white group-hover:text-orange-400 transition-colors">{station.businessName}</CardTitle>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {station.fuelProvider} Partner
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-center text-sm p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                      <span className="text-gray-400">Petrol</span>
                      <span className="font-mono text-orange-400 font-bold">₹{station.fuelPrices?.petrol || "101.5"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                      <span className="text-gray-400">Diesel</span>
                      <span className="font-mono text-blue-400 font-bold">₹{station.fuelPrices?.diesel || "92.5"}</span>
                    </div>
                    <Button
                      className="w-full mt-2 bg-slate-800 hover:bg-orange-600 text-white border border-slate-700 hover:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      variant="outline"
                      disabled={!station.isAvailable}
                      onClick={() => setSelectedStation(station)}
                    >
                      Order from here <TrendingUp className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : !isLoading && (
        <div className="mb-10 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">We're Sorry!</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Currently, there are no fuel stations available near you. Our partners might be offline or out of delivery range. Please check back later!
          </p>
        </div>
      )}

      {/* Order Tracking */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-white">Loading...</div>
        </div>
      ) : (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="text-orange-500" /> Your Orders
          </h2>
          <OrderTracking
            activeOrders={activeOrders}
            trackingOrderId={trackingOrderId}
            onTrackOrder={(id) => setTrackingOrderId(id)}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
