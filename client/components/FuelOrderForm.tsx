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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <form onSubmit={handleOpenPayment} className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

        {/* Left Column: Form Controls */}
        <div className="lg:col-span-3 space-y-6 md:space-y-8">
          {/* Fuel Selector */}
          <div className="space-y-4">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">1. Select Fuel Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setFuelType('petrol')}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${fuelType === 'petrol'
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-slate-800 bg-slate-900/50 grayscale hover:grayscale-0'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-black tracking-tight ${fuelType === 'petrol' ? 'text-white' : 'text-slate-500'}`}>PETROL</p>
                  <p className="text-xs font-mono text-orange-500/70">₹{prices.petrol}/L</p>
                </div>
                <FuelIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${fuelType === 'petrol' ? 'text-orange-500' : 'text-slate-700'}`} />
              </button>

              <button
                type="button"
                onClick={() => setFuelType('diesel')}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${fuelType === 'diesel'
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-slate-800 bg-slate-900/50 grayscale hover:grayscale-0'
                  }`}
              >
                <div className="text-left">
                  <p className={`font-black tracking-tight ${fuelType === 'diesel' ? 'text-white' : 'text-slate-500'}`}>DIESEL</p>
                  <p className="text-xs font-mono text-blue-500/70">₹{prices.diesel}/L</p>
                </div>
                <FuelIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${fuelType === 'diesel' ? 'text-blue-500' : 'text-slate-700'}`} />
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">2. Specify Quantity</Label>
            <div className="relative">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white font-mono text-xl md:text-2xl h-14 md:h-16 rounded-lg focus:border-orange-500 transition-all text-center"
                placeholder="0"
                max="20"
                min="1"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm md:text-base">LITRES</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['5', '10', '15', '20'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`flex-1 min-w-[60px] py-2 rounded-md text-xs font-bold transition-all border ${quantity === val ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                >
                  {val}L
                </button>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div className="space-y-4">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">3. Logistics & Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-12 rounded-lg">
                    <SelectValue placeholder="Select Destination" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {user?.addresses?.map((addr: any, i: number) => (
                      <SelectItem key={i} value={addr.addressLine + ", " + addr.city}>
                        {addr.label.toUpperCase()} : {addr.addressLine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-12 rounded-lg">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {user?.vehicles?.map((v: any, i: number) => (
                      <SelectItem key={i} value={v.plateNumber}>
                        {v.model.toUpperCase()} ({v.plateNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 rounded-lg overflow-hidden flex flex-col h-full shadow-lg">
            <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-orange-500" /> Order Summary
              </h3>
              <Badge className="bg-slate-950 font-mono text-orange-400 border border-slate-800">PREVIEW</Badge>
            </div>

            <CardContent className="p-8 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-medium text-sm">Unit Price ({fuelType})</span>
                  <span className="text-white font-mono">₹{prices[fuelType].toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Volume Requested</span>
                  <span className="text-white font-mono">{quantity || 0} L</span>
                </div>

                <div className="h-px bg-slate-800 my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Fuel Cost</span>
                  <span className="text-white font-mono">₹{bill.fuelCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Platform Service</span>
                  <span className="text-white font-mono">₹{bill.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Delivery Logistics</span>
                  <span className={`font-mono ${bill.deliveryFee === 0 ? 'text-green-500' : 'text-white'}`}>
                    {bill.deliveryFee === 0 ? 'COMPLIMENTARY' : `₹${bill.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-800">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Total Payable</p>
                    <p className="text-4xl font-black text-white">₹{bill.total.toFixed(2)}</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!quantity || !selectedAddress || !selectedVehicle}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-lg font-black rounded-lg shadow-lg hover:shadow-orange-500/10 transition-all gap-3"
                >
                  PROCEED TO PAYMENT <ChevronRight className="w-5 h-5" />
                </Button>

                <p className="text-[9px] text-slate-500 text-center mt-4 uppercase tracking-widest font-bold">
                  Secure Server Connection Active
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
