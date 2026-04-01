import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, MapPin, Car, ChevronRight, ShoppingCart, Clock, Zap, TrendingDown, Info, CheckCircle2, AlertCircle, Plus, Compass } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import PaymentDialog from './PaymentDialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FuelOrderFormProps {
  onSubmit: (data: any) => void;
  station: any;
}

const formatAddressForDelivery = (addr: any) => {
  if (!addr) return '';
  const line = [addr.addressLine, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean)
    .join(', ');
  return line || '';
};

const FuelOrderForm: React.FC<FuelOrderFormProps> = ({ onSubmit, station }) => {
  const { user, updateProfile, setUser } = useAuth();
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [quantity, setQuantity] = useState<string>('5');
  /** Index into user.addresses / user.vehicles so every row is listed with unique Select values */
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>('0');
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<string>('0');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'home',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await api.getProfile();
        if (!cancelled) setUser(fresh);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, station?._id]);

  useEffect(() => {
    const aLen = user?.addresses?.length ?? 0;
    const vLen = user?.vehicles?.length ?? 0;
    setSelectedAddressIndex((prev) => {
      const i = parseInt(prev, 10);
      if (aLen === 0) return '0';
      if (Number.isNaN(i) || i < 0 || i >= aLen) return '0';
      return String(i);
    });
    setSelectedVehicleIndex((prev) => {
      const i = parseInt(prev, 10);
      if (vLen === 0) return '0';
      if (Number.isNaN(i) || i < 0 || i >= vLen) return '0';
      return String(i);
    });
  }, [user?.addresses, user?.vehicles]);

  const selectedAddr = user?.addresses?.[parseInt(selectedAddressIndex, 10)];
  const selectedVeh = user?.vehicles?.[parseInt(selectedVehicleIndex, 10)];
  const selectedAddress = formatAddressForDelivery(selectedAddr);
  const selectedVehicle = selectedVeh?.plateNumber || '';

  const prices = {
    petrol: station?.fuelPrices?.petrol || 101.5,
    diesel: station?.fuelPrices?.diesel || 92.5
  };

  // Calculate estimated delivery time (25-30 min average)
  const estimatedDeliveryTime = useMemo(() => {
    const baseTime = 25;
    const distanceFactor = selectedAddr?.city?.toLowerCase() === station?.pumpLocation?.city?.toLowerCase() ? 0 : 5;
    return baseTime + distanceFactor;
  }, [selectedAddr, station]);

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
    const addr = user?.addresses?.[parseInt(selectedAddressIndex, 10)];
    const isFreeDelivery = addr?.city?.toLowerCase() === station?.pumpLocation?.city?.toLowerCase();
    const deliveryFee = isFreeDelivery ? 0 : (fuelType === 'petrol' ? 35 : 40);
    const total = fuelCost + platformFee + deliveryFee;
    return { fuelCost, platformFee, deliveryFee, total, isFreeDelivery };
  }, [fuelType, quantity, station, user, prices, selectedAddressIndex]);

  // Quick quantity suggestions based on vehicle type
  const handleAddAddress = async () => {
    if (!newAddress.addressLine || !newAddress.city) return;
    try {
      const updatedAddresses = [...(user.addresses || []), newAddress];
      await updateProfile({ addresses: updatedAddresses });
      setSelectedAddressIndex(String(updatedAddresses.length - 1));
      setIsAddressDialogOpen(false);
      setNewAddress({
        label: 'home',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      });
    } catch (error) {
      console.error("Failed to add address", error);
    }
  };

  const getQuickQuantities = () => {
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
            <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 pb-4">
                <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-[#f97316]" />
                  Fuel Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-4 h-4 text-[#f97316]" />
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
            <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#f97316]" />
                    Load Capacity (Liters)
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-[10px] text-white">
                      <p className="font-bold uppercase tracking-widest">Protocol Limit: 20L</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
            <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f97316]" />
                  Delivery adress
                </CardTitle>
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase tracking-widest text-[#f97316] hover:bg-[#f97316]/5 border border-[#f97316]/20 px-2">
                      <Plus className="w-3 h-3 mr-1" /> Add Node
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a101f] border-slate-800 text-white rounded-2xl shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white uppercase tracking-widest text-sm font-bold">New Delivery Node</DialogTitle>
                      <DialogDescription className="text-slate-500 text-xs">Define a new operational coordinate for fuel drops.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Label</Label>
                        <Select value={newAddress.label} onValueChange={(val) => setNewAddress({ ...newAddress, label: val })}>
                          <SelectTrigger className="col-span-3 bg-[#020817] border-slate-800 text-white rounded-xl h-11">
                            <SelectValue placeholder="Node Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a101f] border-slate-800 text-white">
                            <SelectItem value="home">Home Base</SelectItem>
                            <SelectItem value="work">Operation Center</SelectItem>
                            <SelectItem value="other">Secondary Node</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Address</Label>
                        <Input
                          value={newAddress.addressLine}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                          className="col-span-3 bg-[#020817] border-slate-800 text-white rounded-xl h-11"
                          placeholder="Sector, Landmark"
                        />
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1 space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">City</Label>
                             <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="bg-[#020817] border-slate-800 text-white rounded-xl h-11"
                              placeholder="City"
                             />
                         </div>
                         <div className="flex-1 space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Zip</Label>
                             <Input
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                              className="bg-[#020817] border-slate-800 text-white rounded-xl h-11"
                              placeholder="6-Digit"
                             />
                         </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsAddressDialogOpen(false)} className="text-slate-500 uppercase tracking-widest text-[10px] font-bold hover:bg-slate-800/50">Abort</Button>
                      <Button onClick={handleAddAddress} className="bg-[#f97316] hover:bg-[#f97316]/90 text-white uppercase tracking-widest text-[10px] font-bold px-6 shadow-lg shadow-orange-500/20">Establish Node</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Node Address</Label>
                    <Select
                      value={user?.addresses?.length ? selectedAddressIndex : undefined}
                      onValueChange={setSelectedAddressIndex}
                      disabled={!user?.addresses?.length}
                    >
                      <SelectTrigger className="bg-[#020817] border-slate-800/60 text-white h-12 rounded-xl pl-3 shadow-inner">
                        <SelectValue placeholder={user?.addresses?.length ? 'Target Node' : 'Add an address in Profile'} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a101f] border-slate-800 text-white shadow-2xl rounded-xl max-h-[280px] overflow-y-auto">
                        {user?.addresses?.map((addr: any, i: number) => (
                          <SelectItem key={i} value={String(i)} className="focus:bg-slate-800/50 focus:text-white py-3 cursor-pointer">
                            <div className="flex items-start gap-3 w-full max-w-[280px]">
                              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-[10px] uppercase tracking-wider text-white capitalize">{addr.label}</span>
                                  <div className="h-1 w-1 rounded-full bg-slate-700" />
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{addr.city}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate">{addr.addressLine}</p>
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
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Unit</Label>
                    <Select
                      value={user?.vehicles?.length ? selectedVehicleIndex : undefined}
                      onValueChange={setSelectedVehicleIndex}
                      disabled={!user?.vehicles?.length}
                    >
                      <SelectTrigger className="bg-[#020817] border-slate-800/60 text-white h-12 rounded-xl pl-3 shadow-inner">
                        <SelectValue placeholder={user?.vehicles?.length ? 'Select Unit' : 'Add a vehicle in Profile'} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a101f] border-slate-800 text-white shadow-2xl rounded-xl max-h-[280px] overflow-y-auto">
                        {user?.vehicles?.map((v: any, i: number) => (
                          <SelectItem key={i} value={String(i)} className="focus:bg-slate-800/50 focus:text-white py-3 cursor-pointer">
                            <div className="flex items-start gap-3 w-full max-w-[280px]">
                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Car className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-[10px] uppercase tracking-wider text-white capitalize">{v.model}</span>
                                  <div className="h-1 w-1 rounded-full bg-slate-700" />
                                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{v.type}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-mono font-medium tracking-wider uppercase">{v.plateNumber}</p>
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
            <Card className="bg-[#0a101f] border-slate-800 shadow-xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-90">Efficiency Metrics</p>
                      <div className="text-right">
                        <p className="font-bold uppercase tracking-widest">Min Limit: 20L</p>
                        <p className="text-[9px] text-slate-500 font-medium">Standard Capacity</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Optimizing operations will save approximately {estimatedDeliveryTime} minutes and ₹{savings.toFixed(0)} compared to traditional station transit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary - Enhanced */}
          <div className="col-span-12 lg:col-span-5">
            <Card className="bg-[#0a101f] border-slate-800/60 shadow-2xl rounded-xl overflow-hidden flex flex-col h-full sticky top-6">
              <CardHeader className="border-b border-slate-800/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#f97316]" />
                    Manifest Summary
                  </CardTitle>
                  <Badge variant="outline" className="bg-[#f97316]/5 border-[#f97316]/20 text-[#f97316] text-[10px] font-bold uppercase py-0.5">Live Data</Badge>
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
