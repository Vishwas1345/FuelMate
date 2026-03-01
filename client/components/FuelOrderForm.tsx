import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, MapPin, Car, ChevronRight, ShoppingCart, Clock, Zap, TrendingDown, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentDialog from './PaymentDialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Calculate estimated delivery time (25-30 min average)
  const estimatedDeliveryTime = useMemo(() => {
    const baseTime = 25;
    const distanceFactor = user?.addresses?.[0]?.city?.toLowerCase() === station?.pumpLocation?.city?.toLowerCase() ? 0 : 5;
    return baseTime + distanceFactor;
  }, [user, station]);

  // Calculate savings vs going to station
  const savings = useMemo(() => {
    const timeSaved = 30; // minutes
    const avgTimeValue = 2; // ₹ per minute
    return timeSaved * avgTimeValue;
  }, []);

  const bill = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const fuelCost = qty * prices[fuelType];
    const platformFee = qty * 2;
    const isFreeDelivery = user?.addresses?.[0]?.city?.toLowerCase() === station?.pumpLocation?.city?.toLowerCase();
    const deliveryFee = isFreeDelivery ? 0 : (fuelType === 'petrol' ? 35 : 40);
    const total = fuelCost + platformFee + deliveryFee;
    return { fuelCost, platformFee, deliveryFee, total, isFreeDelivery };
  }, [fuelType, quantity, station, user, prices]);

  // Quick quantity suggestions based on vehicle type
  const getQuickQuantities = () => {
    const selectedVeh = user?.vehicles?.find((v: any) => v.plateNumber === selectedVehicle);
    if (selectedVeh?.type === 'bike') return ['3', '5', '7', '10'];
    if (selectedVeh?.type === 'truck') return ['15', '20', '25', '30'];
    return ['5', '10', '15', '20'];
  };

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentOpen(true);
  };

  const handleConfirmOrder = async (paymentMethod: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        stationId: station._id,
        selectedStation: station.businessName,
        brand: station.fuelProvider,
        fuelType: fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
        quantity: parseFloat(quantity),
        deliveryAddress: selectedAddress,
        vehiclePlate: selectedVehicle,
        paymentMethod,
        billSummary: bill,
        totalPrice: bill.total
      });
      setIsPaymentOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = quantity && parseFloat(quantity) > 0 && selectedAddress && selectedVehicle;

  return (
    <TooltipProvider>
      <div className="w-full animate-in fade-in duration-500">
        <form onSubmit={handleOpenPayment} className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Form Controls */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            
            {/* Fuel Type Selection - Enhanced */}
            <Card className="bg-slate-900/50 border-slate-800/50 rounded-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-orange-500" />
                  Select Fuel Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFuelType('petrol')}
                    className={`relative p-4 rounded-md border-2 transition-all text-left ${
                      fuelType === 'petrol'
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                        : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    {fuelType === 'petrol' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-lg mb-1 ${fuelType === 'petrol' ? 'text-white' : 'text-slate-300'}`}>
                          Petrol
                        </p>
                        <p className="text-sm text-orange-500/80 font-medium">₹{prices.petrol}/L</p>
                      </div>
                      <Fuel className={`w-8 h-8 ${fuelType === 'petrol' ? 'text-orange-500' : 'text-slate-600'}`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFuelType('diesel')}
                    className={`relative p-4 rounded-md border-2 transition-all text-left ${
                      fuelType === 'diesel'
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                        : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    {fuelType === 'diesel' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-lg mb-1 ${fuelType === 'diesel' ? 'text-white' : 'text-slate-300'}`}>
                          Diesel
                        </p>
                        <p className="text-sm text-blue-500/80 font-medium">₹{prices.diesel}/L</p>
                      </div>
                      <Fuel className={`w-8 h-8 ${fuelType === 'diesel' ? 'text-blue-500' : 'text-slate-600'}`} />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Selector - Enhanced */}
            <Card className="bg-slate-900/50 border-slate-800/50 rounded-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    Quantity (Liters)
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-white">
                      <p className="text-sm">Maximum 20 liters per order</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseFloat(val) >= 1 && parseFloat(val) <= 20)) {
                        setQuantity(val);
                      }
                    }}
                    className="bg-slate-950/50 border-slate-800/50 text-white font-semibold text-2xl h-14 rounded-md focus:border-orange-500 transition-all text-center pr-12"
                    placeholder="0"
                    max="20"
                    min="1"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Liters</div>
                </div>
                
                {/* Quick Select Buttons */}
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Quick Select</Label>
                  <div className="flex flex-wrap gap-2">
                    {getQuickQuantities().map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setQuantity(val)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                          quantity === val
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                            : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {val}L
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Info */}
                {quantity && parseFloat(quantity) > 0 && (
                  <div className="bg-slate-950/30 border border-slate-800/50 rounded-md p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Fuel Cost:</span>
                      <span className="text-white font-semibold">₹{bill.fuelCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Details - Clean and Simple */}
            <Card className="bg-slate-900/50 border-slate-800/50 rounded-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-400">Delivery Address</Label>
                    <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                      <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white h-11 rounded-md pl-3">
                        <SelectValue placeholder="Select address" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {user?.addresses?.map((addr: any, i: number) => (
                          <SelectItem key={i} value={addr.addressLine + ", " + addr.city} className="pl-3">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm capitalize">{addr.label}</p>
                                <p className="text-xs text-slate-400 truncate">{addr.addressLine}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bill.isFreeDelivery && selectedAddress && (
                      <div className="flex items-center gap-1.5 text-xs text-green-500 mt-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Free delivery in your city!</span>
                      </div>
                    )}
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-400">Vehicle</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger className="bg-slate-950/50 border-slate-800/50 text-white h-11 rounded-md pl-3">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {user?.vehicles?.map((v: any, i: number) => (
                          <SelectItem key={i} value={v.plateNumber} className="pl-3">
                            <div className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm capitalize truncate">{v.model}</p>
                                <p className="text-xs text-slate-400 truncate">{v.plateNumber}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Value Features Card */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-blue-500/10 border-orange-500/20 rounded-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-md">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">Time & Money Saved</p>
                    <p className="text-xs text-slate-400">
                      Save approximately {estimatedDeliveryTime} minutes and ₹{savings.toFixed(0)} by ordering online instead of visiting the station.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary - Enhanced */}
          <div className="col-span-12 lg:col-span-5">
            <Card className="bg-slate-900/50 border-slate-800/50 rounded-md overflow-hidden flex flex-col h-full sticky top-6">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    Order Summary
                  </CardTitle>
                  <Badge className="bg-slate-950 text-orange-400 border border-slate-800/50 text-xs">Live</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5 flex-1">
                {/* Estimated Delivery Time */}
                <div className="bg-slate-950/30 border border-slate-800/50 rounded-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-md">
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Estimated Delivery</p>
                      <p className="text-lg font-semibold text-white">{estimatedDeliveryTime} minutes</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-sm">Unit Price</span>
                    <span className="text-white font-medium">₹{prices[fuelType].toFixed(2)}/L</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-sm">Quantity</span>
                    <span className="text-white font-medium">{quantity || 0} L</span>
                  </div>

                  <div className="h-px bg-slate-800/50 my-2" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Fuel Cost</span>
                      <span className="text-white font-medium">₹{bill.fuelCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Service Fee</span>
                      <span className="text-white font-medium">₹{bill.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Delivery</span>
                      <span className={`font-medium ${bill.deliveryFee === 0 ? 'text-green-500' : 'text-white'}`}>
                        {bill.deliveryFee === 0 ? (
                          <span className="flex items-center gap-1">
                            <span>Free</span>
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        ) : (
                          `₹${bill.deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-slate-800/50 mt-auto">
                  <div className="flex justify-between items-end mb-5">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Total Amount</p>
                      <p className="text-3xl font-semibold text-white">₹{bill.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-all gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFormValid ? (
                      <>
                        Proceed to Payment <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Complete all fields
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Secure & Encrypted</span>
                  </div>
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
    </TooltipProvider>
  );
};

export default FuelOrderForm;
