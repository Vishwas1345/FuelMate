import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MapView from '@/components/MapView';
import { MapPin, Crosshair, Fuel } from 'lucide-react';
import { IndianRupee } from 'lucide-react';

// Define available fuel stations for each brand
const fuelStations = {
  'Indian Oil': [
    { id: 'io_ring_road', name: 'Indian Oil Station - Ring Road', address: 'Ring Road, Surat', distance: '2.1 km' },
    { id: 'io_adajan', name: 'Indian Oil Station - Adajan', address: 'Adajan Main Road, Surat', distance: '3.5 km' }
  ],
  'Bharat Petroleum': [
    { id: 'bp_vesu', name: 'BP Station - Vesu', address: 'Vesu Main Road, Surat', distance: '1.8 km' },
    { id: 'bp_piplod', name: 'BP Station - Piplod', address: 'Piplod, Dumas Road, Surat', distance: '4.2 km' }
  ],
  'Hindustan Petroleum': [
    { id: 'hp_athwa', name: 'HP Station - Athwa', address: 'Athwa Lines, Surat', distance: '2.7 km' },
    { id: 'hp_city_light', name: 'HP Station - City Light', address: 'City Light Road, Surat', distance: '3.9 km' }
  ],
  'Shell': [
    { id: 'shell_ghod_dod', name: 'Shell Station - Ghod Dod Road', address: 'Ghod Dod Road, Surat', distance: '2.2 km' },
    { id: 'shell_udhna', name: 'Shell Station - Udhna', address: 'Udhna Main Road, Surat', distance: '5.0 km' }
  ],
  'Reliance': [
    { id: 'rel_katargam', name: 'Reliance Station - Katargam', address: 'Katargam, Surat', distance: '3.3 km' },
    { id: 'rel_varachha', name: 'Reliance Station - Varachha', address: 'Varachha Road, Surat', distance: '4.5 km' }
  ]
};

const formSchema = z.object({
  fuelType: z.enum(['Petrol', 'Diesel']),
  quantity: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 20;
  }, "Quantity must be between 1 and 20 liters"),
  brand: z.string().min(1, "Please select a fuel brand"),
  selectedStation: z.string().min(1, "Please select a fuel station"),
  deliveryAddress: z.string().min(1, "Please enter a delivery address"),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'netbanking'], {
    required_error: "Please select a payment method"
  })
});

type FormData = z.infer<typeof formSchema>;

interface FuelOrderFormProps {
  onSubmit: (data: FormData) => void;
  fuelPrices: {
    Petrol: number;
    Diesel: number;
  };
}

// List of random Surat locations
const suratLocations = [
  'Ghod Dod Road, Surat',
  'Adajan, Surat',
  'Magdalla, Surat',
  'City Light, Surat',
  // 'Ring Road, Surat',
  'Katargam, Surat',
  'Varachha, Surat',
  'Athwa, Surat',
  'Piplod, Surat',
  'Udhna, Surat',
  'Dumas Road, Surat',
  'Pal, Surat',
  // 'Parle Point, Surat',
  'Majura Gate, Surat',
  'Sarthana, Surat',
  // 'Nanpura, Surat'
];

const FuelOrderForm: React.FC<FuelOrderFormProps> = ({ onSubmit, fuelPrices }) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [nearestStations, setNearestStations] = useState<Array<{ id: string; name: string; address: string; distance: string }>>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuelType: 'Petrol',
      quantity: '1',
      brand: '',
      selectedStation: '',
      deliveryAddress: '',
      paymentMethod: 'cash'
    }
  });

  // Calculate total amount whenever fuel type or quantity changes
  useEffect(() => {
    const fuelType = form.watch('fuelType');
    const quantity = form.watch('quantity');
    const numQuantity = parseInt(quantity) || 0;
    const pricePerLiter = fuelPrices[fuelType];
    const total = Number((pricePerLiter * numQuantity).toFixed(2));
    setTotalAmount(total);
  }, [form.watch('fuelType'), form.watch('quantity'), fuelPrices]);

  const handleBrandChange = (value: string) => {
    form.setValue('brand', value);
    form.setValue('selectedStation', ''); // Reset selected station when brand changes
    setSelectedBrand(value);
    setSelectedStation('');
    const stations = fuelStations[value as keyof typeof fuelStations] || [];
    setNearestStations(stations);
  };

  const handleStationSelect = (station: { id: string; name: string; address: string; distance: string }) => {
    setSelectedStation(station.name);
    form.setValue('selectedStation', station.id);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted;
              setUserLocation(address);
              form.setValue('deliveryAddress', address);
            }
          } catch (error) {
            toast({
              title: "Location Error",
              description: "Could not fetch your address. Please enter manually.",
              variant: "destructive",
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location. Please allow location access or enter manually.",
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('quantity', value);
    
    const numValue = parseInt(value);
    if (numValue > 20) {
      toast({
        title: 'Quantity Limit Exceeded',
        description: 'Maximum order quantity is 20 liters',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      // Reset form and state
      form.reset({
        fuelType: 'Petrol',
        quantity: '1',
        brand: '',
        selectedStation: '',
        deliveryAddress: '',
        paymentMethod: 'cash'
      });
      setSelectedBrand('');
      setNearestStations([]);
      setSelectedStation('');
      setUserLocation('');
    } catch (error) {
      // Let the parent component handle the error toast
      throw error;
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Fuel className="h-5 w-5 text-orange-500" />
          Place Fuel Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fuelType" className="text-white">Fuel Type</Label>
              <Select
                onValueChange={(value) => form.setValue('fuelType', value as 'Petrol' | 'Diesel')}
                defaultValue={form.getValues('fuelType')}
              >
                <SelectTrigger id="fuelType" className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol - ₹{fuelPrices.Petrol}/L</SelectItem>
                  <SelectItem value="Diesel">Diesel - ₹{fuelPrices.Diesel}/L</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-white">Quantity (in liters)</Label>
              <Input
                id="quantity"
                type="number"
                {...form.register('quantity')}
                className="bg-slate-800 border-slate-700 text-white"
                min="1"
                max="20"
                onChange={(e) => {
                  handleQuantityChange(e);
                  form.trigger('quantity');
                }}
              />
              {form.formState.errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.quantity.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Maximum 20 liters per order</p>
            </div>

            {/* Price Summary Card */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Price per liter</p>
                  <p className="text-lg font-semibold text-white">₹{fuelPrices[form.getValues('fuelType')]}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-gray-400">Total Amount</p>
                  <p className="text-lg font-semibold text-orange-500">₹{totalAmount}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs text-gray-400">
                  {form.watch('quantity') || 0} liters of {form.watch('fuelType')} at ₹{fuelPrices[form.watch('fuelType')]}/L
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="brand" className="text-white">Preferred Brand</Label>
              <Select
                onValueChange={handleBrandChange}
                defaultValue={form.getValues('brand')}
              >
                <SelectTrigger id="brand" className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indian Oil">Indian Oil</SelectItem>
                  <SelectItem value="Bharat Petroleum">Bharat Petroleum</SelectItem>
                  <SelectItem value="Hindustan Petroleum">Hindustan Petroleum</SelectItem>
                  <SelectItem value="Shell">Shell</SelectItem>
                  <SelectItem value="Reliance">Reliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedBrand && nearestStations.length > 0 && (
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-2">Select Nearest {selectedBrand} Station in Surat</h3>
                <div className="space-y-3">
                  {nearestStations.map((station) => (
                    <div key={station.id} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="station"
                        id={station.id}
                        value={station.id}
                        checked={form.getValues('selectedStation') === station.id}
                        onChange={() => {
                          setSelectedStation(station.name);
                          form.setValue('selectedStation', station.id);
                        }}
                        className="text-orange-500 focus:ring-orange-500 h-4 w-4 border-gray-600 bg-gray-700 mt-2"
                      />
                      <Label htmlFor={station.id} className="text-sm text-gray-300 cursor-pointer">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-orange-500 mt-1" />
                          <div>
                            <p className="font-medium">{station.name}</p>
                            <p className="text-gray-400">{station.address}</p>
                            <p className="text-orange-500">{station.distance}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="deliveryAddress" className="text-white">Delivery Address</Label>
              <div className="relative flex gap-2 items-center">
                <Input
                  id="deliveryAddress"
                  value={userLocation || form.getValues('deliveryAddress')}
                  onChange={(e) => {
                    form.setValue('deliveryAddress', e.target.value);
                    setUserLocation(e.target.value);
                  }}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white px-3 py-2 text-xs whitespace-nowrap flex items-center gap-2"
                  onClick={() => {
                    const randomLocation = suratLocations[Math.floor(Math.random() * suratLocations.length)];
                    setUserLocation(randomLocation);
                    form.setValue('deliveryAddress', randomLocation);
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  Use Current Location
                </Button>
              </div>
              <div className="mt-2 h-[250px] rounded-md overflow-hidden border border-slate-700">
                <div className="w-full h-full">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.41709397844!2d72.73988438253697!3d21.1593402994649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1745851551947!5m2!1sen!2sin" width={"100%"} height={"100%"}  loading="lazy" ></iframe>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Payment Method *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
                  <input
                    type="radio"
                    id="cash"
                    value="cash"
                    {...form.register('paymentMethod')}
                    className="text-orange-500 focus:ring-orange-500 h-4 w-4 border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="cash" className="flex items-center space-x-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-white">Cash</span>
                      <p className="text-xs text-gray-400">Pay on delivery</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
                  <input
                    type="radio"
                    id="card"
                    value="card"
                    {...form.register('paymentMethod')}
                    className="text-orange-500 focus:ring-orange-500 h-4 w-4 border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-white">Card</span>
                      <p className="text-xs text-gray-400">Credit/Debit</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
                  <input
                    type="radio"
                    id="upi"
                    value="upi"
                    {...form.register('paymentMethod')}
                    className="text-orange-500 focus:ring-orange-500 h-4 w-4 border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="upi" className="flex items-center space-x-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-white">UPI</span>
                      <p className="text-xs text-gray-400">GPay/PhonePe</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
                  <input
                    type="radio"
                    id="netbanking"
                    value="netbanking"
                    {...form.register('paymentMethod')}
                    className="text-orange-500 focus:ring-orange-500 h-4 w-4 border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="netbanking" className="flex items-center space-x-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9-4 9 4m-9-4v20m9-16l-9 4m0 0L3 6m0 16l9-4m9 4l-9-4m0 4V4" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-white">Net Banking</span>
                      <p className="text-xs text-gray-400">All Indian Banks</p>
                    </div>
                  </Label>
                </div>
              </div>
              {form.formState.errors.paymentMethod && (
                <p className="text-red-500 text-xs mt-2">{form.formState.errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!selectedStation || !form.getValues('deliveryAddress')}
            >
              Place Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FuelOrderForm;
