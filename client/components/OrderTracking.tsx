import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MapboxMap from './MapboxMap';
import { Phone, Mail, Truck, Clock, CheckCircle, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type Order = {
  id: string;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  fuelType: string;
  quantity: number;
  brand: string;
  price: number;
  deliveryAddress: string;
  timestamp: Date;
  estimatedDelivery?: Date;
  paymentMethod?: string;
  driver?: {
    name: string;
    phone: string;
    email: string;
    currentLocation?: string;
    coordinates?: { lat: number; lng: number };
  };
};

interface OrderTrackingProps {
  activeOrders: Order[];
  trackingOrderId: string | null;
  onTrackOrder: (orderId: string) => void;
}

const OrderTracking = ({ activeOrders, trackingOrderId, onTrackOrder }: OrderTrackingProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    activeOrders.find(o => o.id === trackingOrderId) || (activeOrders.length > 0 ? activeOrders[0] : null)
  );

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'pending': return 15;
      case 'confirmed': return 40;
      case 'in-transit': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const statusMap = {
    'pending': { label: 'In Queue', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'confirmed': { label: 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'in-transit': { label: 'Dispatching', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'delivered': { label: 'Completed', color: 'text-green-500', bg: 'bg-green-500/10' },
    'cancelled': { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-lg shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-800/20 border-b border-slate-800 py-4">
        <CardTitle className="text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-2">
          <Navigation className="h-4 w-4 text-orange-500" /> Live Manifest
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div>
          <Select
            value={selectedOrder?.id || ''}
            onValueChange={(value) => {
              onTrackOrder(value);
              setSelectedOrder(activeOrders.find(o => o.id === value) || null);
            }}
          >
            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white font-bold h-12 rounded-lg">
              <SelectValue placeholder="Select Active Shipment" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {activeOrders.map(order => (
                <SelectItem key={order.id} value={order.id} className="focus:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusMap[order.status].color.replace('text', 'bg')}`} />
                    <span className="font-mono text-xs uppercase">#{order.id.slice(-6)} — {order.fuelType} ({order.quantity}L)</span>
                  </div>
                </SelectItem>
              ))}
              {activeOrders.length === 0 && <p className="p-4 text-xs text-slate-500 text-center">No active manifest</p>}
            </SelectContent>
          </Select>
        </div>

        {selectedOrder ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Logistic Progress */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${statusMap[selectedOrder.status].color}`}>
                  {statusMap[selectedOrder.status].label}
                </span>
                <span className="text-white font-mono text-xs">{getStatusProgress(selectedOrder.status)}%</span>
              </div>
              <Progress value={getStatusProgress(selectedOrder.status)} className="h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* Shipment Data */}
            <div className="space-y-4 bg-slate-950/50 p-6 rounded-lg border border-slate-800/50">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  <MapPin className="h-4 w-4 text-slate-500 font-bold" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Destination Address</p>
                  <p className="text-xs text-white font-medium leading-relaxed">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Est. Arrival</p>
                  <p className="text-xs text-white font-medium">
                    {selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toLocaleTimeString() : "PENDING DISPATCH"}
                  </p>
                </div>
              </div>
            </div>

            {/* Personnel */}
            {selectedOrder.driver && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest">Courier In-Charge</p>
                    <p className="text-sm font-bold text-white uppercase">{selectedOrder.driver.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 bg-slate-950 border border-slate-800 text-orange-500 hover:bg-orange-500 hover:text-white">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 bg-slate-950 border border-slate-800 text-orange-500 hover:bg-orange-500 hover:text-white">
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Telemetry View */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.2em]">Operational Telemetry</p>
              <div className="h-48 rounded-lg overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
                <MapboxMap
                  address={selectedOrder.deliveryAddress}
                  driverLocation={selectedOrder.driver?.coordinates}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold text-[10px] md:text-xs h-10">
                SUPPORT TICKET
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent border-slate-800 text-slate-400 hover:text-white font-bold text-[10px] md:text-xs h-10">
                FULL LOGS
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-500 text-sm font-medium">No operational manifest found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
