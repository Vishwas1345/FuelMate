import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Fuel, MapPin, Car, Info, ChevronRight, Fuel as FuelIcon, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentDialog from './PaymentDialog';
import { Badge } from '@/components/ui/badge';

interface FuelOrderFormProps {
  onSubmit: (data: any) => void;
  station: any;
}

const FuelOrderForm: React.FC<FuelOrderFormProps> = ({ onSubmit, station }) => {
  const { user } = useAuth();
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [quantity, setQuantity] = useState<string>('5');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.addresses?.length) {
      setSelectedAddress(user.addresses[0].addressLine + ", " + user.addresses[0].city);
    }
    if (user?.vehicles?.length) {
      setSelectedVehicle(user.vehicles[0].plateNumber);
    }
  }, [user]);

  const prices = {
    petrol: station?.fuelPrices?.petrol || 101.5,
    diesel: station?.fuelPrices?.diesel || 92.5
  };

  const bill = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const fuelCost = qty * prices[fuelType];
    const platformFee = qty * 2;
    const isFreeDelivery = user?.addresses?.[0]?.city?.toLowerCase() === station?.pumpLocation?.city?.toLowerCase();
    const deliveryFee = isFreeDelivery ? 0 : (fuelType === 'petrol' ? 35 : 40);
    const total = fuelCost + platformFee + deliveryFee;
    return { fuelCost, platformFee, deliveryFee, total, isFreeDelivery };
  }, [fuelType, quantity, station, user, prices]);

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentOpen(true);
  };

  const handleConfirmOrder = async (paymentMethod: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        stationId: station._id,
        selectedStation: station.businessName, // Required by model
        brand: station.fuelProvider,
        fuelType: fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
        quantity: parseFloat(quantity),
        deliveryAddress: selectedAddress,
        vehiclePlate: selectedVehicle,
        paymentMethod,
        billSummary: bill,
        totalPrice: bill.total // Required by model
      });
      setIsPaymentOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <form onSubmit={handleOpenPayment} className="grid grid-cols-12 gap-6">

        {/* Left Column: Form Controls */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Fuel Selector */}
          <div className="space-y-3">
            <Label className="text-slate-400 font-medium text-sm">Select Fuel Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFuelType('petrol')}
                className={`flex items-center justify-between p-4 rounded-md border transition-all ${fuelType === 'petrol'
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-slate-800/50 bg-slate-900/50 hover:border-slate-700'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-semibold text-base ${fuelType === 'petrol' ? 'text-white' : 'text-slate-400'}`}>Petrol</p>
                  <p className="text-xs text-orange-500/70 mt-0.5">₹{prices.petrol}/L</p>
                </div>
                <FuelIcon className={`w-6 h-6 ${fuelType === 'petrol' ? 'text-orange-500' : 'text-slate-600'}`} />
              </button>

              <button
                type="button"
                onClick={() => setFuelType('diesel')}
                className={`flex items-center justify-between p-4 rounded-md border transition-all ${fuelType === 'diesel'
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-slate-800/50 bg-slate-900/50 hover:border-slate-700'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-semibold text-base ${fuelType === 'diesel' ? 'text-white' : 'text-slate-400'}`}>Diesel</p>
                  <p className="text-xs text-blue-500/70 mt-0.5">₹{prices.diesel}/L</p>
                </div>
                <FuelIcon className={`w-6 h-6 ${fuelType === 'diesel' ? 'text-blue-500' : 'text-slate-600'}`} />
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label className="text-slate-400 font-medium text-sm">Quantity (Liters)</Label>
            <div className="relative">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-900/50 border-slate-800/50 text-white font-mono text-xl h-12 rounded-md focus:border-orange-500 transition-all text-center"
                placeholder="0"
                max="20"
                min="1"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">L</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['5', '10', '15', '20'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`flex-1 min-w-[60px] py-2 rounded-md text-xs font-medium transition-all border ${quantity === val ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  {val}L
                </button>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div className="space-y-3">
            <Label className="text-slate-400 font-medium text-sm">Delivery Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-800/50 text-white h-11 rounded-md">
                    <SelectValue placeholder="Select Address" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {user?.addresses?.map((addr: any, i: number) => (
                      <SelectItem key={i} value={addr.addressLine + ", " + addr.city}>
                        {addr.label}: {addr.addressLine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-800/50 text-white h-11 rounded-md">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {user?.vehicles?.map((v: any, i: number) => (
                      <SelectItem key={i} value={v.plateNumber}>
                        {v.model} ({v.plateNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="bg-slate-900/50 border-slate-800/50 rounded-md overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-800/30 border-b border-slate-800/50 flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                <ShoppingCart className="w-4 h-4 text-orange-500" /> Order Summary
              </h3>
              <Badge className="bg-slate-950 text-orange-400 border border-slate-800/50 text-xs">Preview</Badge>
            </div>

            <CardContent className="p-6 space-y-5 flex-1">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Unit Price</span>
                  <span className="text-white font-medium">₹{prices[fuelType].toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Quantity</span>
                  <span className="text-white font-medium">{quantity || 0} L</span>
                </div>

                <div className="h-px bg-slate-800/50 my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Fuel Cost</span>
                  <span className="text-white font-medium">₹{bill.fuelCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Platform Fee</span>
                  <span className="text-white font-medium">₹{bill.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Delivery</span>
                  <span className={`font-medium ${bill.deliveryFee === 0 ? 'text-green-500' : 'text-white'}`}>
                    {bill.deliveryFee === 0 ? 'Free' : `₹${bill.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-800/50">
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total</p>
                    <p className="text-3xl font-semibold text-white">₹{bill.total.toFixed(2)}</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!quantity || !selectedAddress || !selectedVehicle}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-all gap-2"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Secure connection
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handleConfirmOrder}
        amount={bill.total}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default FuelOrderForm;
