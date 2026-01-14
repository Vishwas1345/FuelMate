import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrderCard from './OrderCard';
import MapboxMap from './MapboxMap';
import { Phone, Mail, User, Search, MapPin, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getDriverCoordinates = (order: Order | null) => {
    if (!order || order.status !== 'in-transit' || !order.driver) return null;
    
    if (order.driver.coordinates) {
      return order.driver.coordinates;
    }
    
    return { lat: 21.1702 + (Math.random() * 0.03), lng: 72.8311 + (Math.random() * 0.03) };
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'pending':
        return 25;
      case 'confirmed':
        return 50;
      case 'in-transit':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', icon: <Clock className="h-4 w-4" /> },
      { id: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle className="h-4 w-4" /> },
      { id: 'in-transit', label: 'In Transit', icon: <Truck className="h-4 w-4" /> },
      { id: 'delivered', label: 'Delivered', icon: <CheckCircle className="h-4 w-4" /> },
    ];

    return steps.map((step, index) => {
      const isActive = steps.findIndex(s => s.id === status) >= index;
      return (
        <div key={step.id} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive ? 'bg-orange-500 text-white' : 'bg-slate-700 text-gray-400'
          }`}>
            {step.icon}
          </div>
          <div className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
            {step.label}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-orange-500" />
          Track Your Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select
            value={trackingOrderId || ''}
            onValueChange={(value) => {
              onTrackOrder(value);
              const order = activeOrders.find(o => o.id === value);
              setSelectedOrder(order || null);
            }}
          >
            <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select an order to track" />
            </SelectTrigger>
            <SelectContent>
              {activeOrders.filter((order, index, self) => 
                index === self.findIndex((o) => o.id === order.id)
              ).map(order => (
                <SelectItem key={order.id} value={order.id}>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'in-transit' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {order.status.replace('-', ' ')}
                    </Badge>
                    <span className="truncate">Order #{order.id} - {order.fuelType}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'in-transit' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {selectedOrder.status.replace('-', ' ')}
                    </Badge>
                    <span className="text-white truncate">{selectedOrder.fuelType} - {selectedOrder.quantity}L</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span className="text-white truncate">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span className="text-white truncate">
                      Ordered: {new Date(selectedOrder.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.estimatedDelivery && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-white truncate">
                        Estimated Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Delivery Progress</h3>
                <div className="space-y-4">
                  <Progress value={getStatusProgress(selectedOrder.status)} className="h-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {getStatusSteps(selectedOrder.status)}
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.driver && (
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Driver Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Driver Name</p>
                    <p className="text-white font-medium">{selectedOrder.driver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Contact</p>
                    <p className="text-white font-medium">{selectedOrder.driver.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Driver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Message Driver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Delivery Tracking</h3>
              <div className="h-64 rounded-lg overflow-hidden border border-slate-700">
                <MapboxMap 
                  address={selectedOrder.deliveryAddress} 
                  driverLocation={getDriverCoordinates(selectedOrder)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1">
                View Order Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
