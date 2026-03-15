import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit, Mail, Phone, Calendar, Package, MapPin,
  Car, Truck, Building2, Fuel, Plus, Trash2, Save, X, ShieldCheck, Download,
  LogOut, Star, ArrowLeft, Activity
} from 'lucide-react';
import MapView from '@/components/MapView';
import { toast } from '@/components/ui/use-toast';

// Types matching the schema
type Address = {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

type Vehicle = {
  type: string;
  model: string;
  plateNumber: string;
};

type UserProfileData = {
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'station';
  joinDate: Date;
  avatar?: string;
  // Customer Fields
  dob?: string;
  gender?: string;
  addresses: Address[];
  vehicles: Vehicle[];
  // Station Fields
  businessName?: string;
  businessPhone?: string;
  fuelProvider?: string;
  gstNumber?: string;
  pumpLocation?: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  trucksNeeded?: number;
  driversNeeded?: number;
};

const UserProfile = () => {
  const { user, updateProfile, isLoading: isAuthLoading, logout, userOrders, getOrders } = useAuth();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog States
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);

  const [newAddress, setNewAddress] = useState<Address>({
    label: 'home',
    addressLine: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: ''
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    type: 'car',
    model: '',
    plateNumber: ''
  });

  // Initialize Profile Data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: (user.role as 'customer' | 'station') || 'customer',
        joinDate: user.createdAt ? new Date(user.createdAt) : new Date(),
        avatar: user.avatar,
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : undefined,
        gender: user.gender,
        addresses: user.addresses || [],
        vehicles: user.vehicles || [],
        businessName: user.businessName,
        businessPhone: user.businessPhone,
        fuelProvider: user.fuelProvider,
        gstNumber: user.gstNumber,
        pumpLocation: user.pumpLocation,
        trucksNeeded: user.trucksNeeded,
        driversNeeded: user.driversNeeded,
      });
    }
  }, [user]);

  // Sync Orders
  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const handleSaveProfile = async () => {
    if (!profileData) return;
    setIsSaving(true);
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        dob: profileData.dob,
        gender: profileData.gender as any,
        addresses: profileData.addresses as any,
        vehicles: profileData.vehicles as any,
        businessName: profileData.businessName,
        businessPhone: profileData.businessPhone,
        pumpLocation: profileData.pumpLocation
      });
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!profileData) return;
    if (!newAddress.addressLine || !newAddress.city || !newAddress.zipCode) {
      toast({ title: "Validation Error", description: "Please fill in all required address fields.", variant: "destructive" });
      return;
    }
    const updatedAddresses = [...profileData.addresses, newAddress];
    setProfileData({ ...profileData, addresses: updatedAddresses });
    setIsAddressDialogOpen(false);
    setNewAddress({ label: 'home', addressLine: '', city: '', state: '', country: 'India', zipCode: '' }); // Reset
  };

  const handleRemoveAddress = (index: number) => {
    if (!profileData) return;
    const updatedAddresses = profileData.addresses.filter((_, i) => i !== index);
    setProfileData({ ...profileData, addresses: updatedAddresses });
  };

  const handleAddVehicle = () => {
    if (!profileData) return;
    if (!newVehicle.model || !newVehicle.plateNumber) {
      toast({ title: "Validation Error", description: "Please fill in vehicle model and plate number.", variant: "destructive" });
      return;
    }
    const updatedVehicles = [...profileData.vehicles, newVehicle];
    setProfileData({ ...profileData, vehicles: updatedVehicles });
    setIsVehicleDialogOpen(false);
    setNewVehicle({ type: 'car', model: '', plateNumber: '' }); // Reset
  };

  const handleRemoveVehicle = (index: number) => {
    if (!profileData) return;
    const updatedVehicles = profileData.vehicles.filter((_, i) => i !== index);
    setProfileData({ ...profileData, vehicles: updatedVehicles });
  };

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  if (isAuthLoading || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  const isStation = profileData.role === 'station';

  return (
    <div className="w-full">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT COLUMN: Profile Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden sticky top-8">
            <div className="h-32 bg-gradient-to-br from-orange-600 to-amber-600 relative opacity-90">
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <CardContent className="pt-0 relative">
              <div className="flex flex-col items-center -mt-16 mb-4">
                <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-xl bg-slate-800">
                  <AvatarImage src={profileData.avatar} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-slate-800 text-white">{getInitials(profileData.name)}</AvatarFallback>
                </Avatar>

                <div className="text-center mt-3 space-y-1">
                  <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
                  <p className="text-sm text-gray-400">{profileData.email}</p>
                  <Badge className={`mt-2 ${isStation ? 'bg-blue-600' : 'bg-orange-500'}`}>
                    {isStation ? 'Fuel Partner' : 'Customer'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center text-sm text-gray-400 gap-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{profileData.phone || 'No phone added'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400 gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Joined {profileData.joinDate.toLocaleDateString()}</span>
                </div>
                {!isStation && profileData.addresses.length > 0 && (
                  <div className="flex items-center text-sm text-gray-400 gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{profileData.addresses[0].city}, {profileData.addresses[0].state}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isEditing ? "destructive" : "default"}
                    className={isEditing ? "w-full" : "w-full bg-orange-600 hover:bg-orange-700 text-white"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit className="w-4 h-4" /> Edit Profile</>}
                  </Button>
                  <Button variant="secondary" className="w-full hover:bg-slate-800" onClick={logout}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
                {isEditing && (
                  <Button
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Details & Forms */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#0a101f] border border-slate-800 p-1 h-12 rounded-lg w-auto inline-flex">
              <TabsTrigger value="overview" className="h-full rounded-md px-6 text-[11px] font-semibold uppercase tracking-widest data-[state=active]:bg-[#f97316] data-[state=active]:text-white text-slate-500 transition-all">Overview</TabsTrigger>
              <TabsTrigger value="orders" className="h-full rounded-md px-6 text-[11px] font-semibold uppercase tracking-widest data-[state=active]:bg-[#f97316] data-[state=active]:text-white text-slate-500 transition-all">Orders & History</TabsTrigger>
              <TabsTrigger value="settings" className="h-full rounded-md px-6 text-[11px] font-semibold uppercase tracking-widest data-[state=active]:bg-[#f97316] data-[state=active]:text-white text-slate-500 transition-all">Settings</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">

              {/* Personal Information */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserIconOrBuilding isStation={isStation} />
                    {isStation ? 'Business Information' : 'Personal Information'}
                  </CardTitle>
                  <CardDescription>Manage your personal details and contact info.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-gray-400">Full Name</Label>
                    <Input
                      disabled={!isEditing}
                      value={isStation ? (profileData.businessName || '') : profileData.name}
                      onChange={(e) => isStation ? setProfileData({ ...profileData, businessName: e.target.value }) : setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-gray-400">Email Address</Label>
                    <Input disabled value={profileData.email} className="bg-slate-800/50 border-slate-700 text-gray-500" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-gray-400">Phone Number</Label>
                    <Input
                      disabled={!isEditing}
                      value={isStation ? (profileData.businessPhone || '') : profileData.phone}
                      onChange={(e) => isStation ? setProfileData({ ...profileData, businessPhone: e.target.value }) : setProfileData({ ...profileData, phone: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  {!isStation && (
                    <>
                      <div className="grid gap-2">
                        <Label className="text-gray-400">Date of Birth</Label>
                        <Input
                          type="date"
                          disabled={!isEditing}
                          value={profileData.dob || ''}
                          onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-gray-400">Gender</Label>
                        <Select disabled={!isEditing} value={profileData.gender} onValueChange={(val) => setProfileData({ ...profileData, gender: val })}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {isStation && (
                    <>
                      <div className="grid gap-2">
                        <Label className="text-gray-400">GST Number</Label>
                        <Input
                          disabled={!isEditing}
                          value={profileData.gstNumber || ''}
                          onChange={(e) => setProfileData({ ...profileData, gstNumber: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white uppercase"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-gray-400">Fuel Provider</Label>
                        <Select disabled={!isEditing} value={profileData.fuelProvider} onValueChange={(val) => setProfileData({ ...profileData, fuelProvider: val })}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select Provider" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="IndianOil">IndianOil</SelectItem>
                            <SelectItem value="BharatPetroleum">BharatPetroleum</SelectItem>
                            <SelectItem value="HP">HP</SelectItem>
                            <SelectItem value="Shell">Shell</SelectItem>
                            <SelectItem value="Reliance">Reliance</SelectItem>
                            <SelectItem value="Nayara">Nayara</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Station Pump Location */}
              {isStation && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MapPin className="text-blue-500" /> Pump Location
                    </CardTitle>
                    <CardDescription>Manage your station's physical location.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label className="text-gray-400">Address Line</Label>
                          <Input
                            disabled={!isEditing}
                            value={profileData.pumpLocation?.addressLine || ''}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              pumpLocation: {
                                ...(profileData.pumpLocation || { city: '', state: '', country: 'India', zipCode: '' }),
                                addressLine: e.target.value
                              }
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-gray-400">City</Label>
                            <Input
                              disabled={!isEditing}
                              value={profileData.pumpLocation?.city || ''}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                pumpLocation: {
                                  ...(profileData.pumpLocation || { addressLine: '', state: '', country: 'India', zipCode: '' }),
                                  city: e.target.value
                                }
                              })}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-gray-400">State</Label>
                            <Input
                              disabled={!isEditing}
                              value={profileData.pumpLocation?.state || ''}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                pumpLocation: {
                                  ...(profileData.pumpLocation || { addressLine: '', city: '', country: 'India', zipCode: '' }),
                                  state: e.target.value
                                }
                              })}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-gray-400">Zip Code</Label>
                            <Input
                              disabled={!isEditing}
                              value={profileData.pumpLocation?.zipCode || ''}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                pumpLocation: {
                                  ...(profileData.pumpLocation || { addressLine: '', city: '', state: '', country: 'India' }),
                                  zipCode: e.target.value
                                }
                              })}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-gray-400">Country</Label>
                            <Input
                              disabled={!isEditing}
                              value={profileData.pumpLocation?.country || 'India'}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                pumpLocation: {
                                  ...(profileData.pumpLocation || { addressLine: '', city: '', state: '', zipCode: '' }),
                                  country: e.target.value
                                }
                              })}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="h-[250px] rounded-lg overflow-hidden border border-slate-800 relative">
                        <MapView address={`${profileData.pumpLocation?.city || 'India'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Addresses Section */}
              {!isStation && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <MapPin className="text-orange-500" /> Delivery Addresses
                      </CardTitle>
                      <CardDescription>Manage your delivery locations.</CardDescription>
                    </div>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                          <Plus className="w-4 h-4 mr-2" /> Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                          <DialogDescription>Add a new delivery location to your profile.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Label</Label>
                            <Select value={newAddress.label} onValueChange={(val) => setNewAddress({ ...newAddress, label: val })}>
                              <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Label" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Address</Label>
                            <Input
                              value={newAddress.addressLine}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700"
                              placeholder="House/Flat No, Street"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">City</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700"
                              placeholder="City Name"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">State</Label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700"
                              placeholder="State"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Zip Code</Label>
                            <Input
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700"
                              placeholder="123456"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddAddress} className="bg-orange-600 hover:bg-orange-700">Add Address</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.addresses.map((addr, idx) => (
                        <div key={idx} className="relative p-4 rounded-lg bg-slate-800/30 border border-slate-800 group hover:border-slate-700 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="bg-slate-700 text-gray-300 capitalize">{addr.label}</Badge>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:bg-red-950/30 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveAddress(idx)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 font-medium">{addr.addressLine}</p>
                          <p className="text-xs text-gray-500 mt-1">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                      ))}
                      {profileData.addresses.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500 bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                          No addresses saved yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vehicles Section */}
              {!isStation && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Car className="text-blue-500" /> My Vehicles
                      </CardTitle>
                      <CardDescription>Manage your registered vehicles.</CardDescription>
                    </div>
                    <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Add New Vehicle</DialogTitle>
                          <DialogDescription>Register a new vehicle for fuel delivery.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select value={newVehicle.type} onValueChange={(val) => setNewVehicle({ ...newVehicle, type: val })}>
                              <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Vehicle Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="bike">Bike</SelectItem>
                                <SelectItem value="truck">Truck</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Model</Label>
                            <Input
                              value={newVehicle.model}
                              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700"
                              placeholder="e.g. Toyota Fortuner"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Plate No.</Label>
                            <Input
                              value={newVehicle.plateNumber}
                              onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                              className="col-span-3 bg-slate-800 border-slate-700 uppercase"
                              placeholder="KA 01 AB 1234"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddVehicle} className="bg-blue-600 hover:bg-blue-700">Add Vehicle</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {profileData.vehicles.map((v, idx) => (
                        <div key={idx} className="relative flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-800 group hover:border-slate-700 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400">
                            {v.type === 'bike' ? <div className="text-orange-500">🚲</div> :
                              v.type === 'truck' ? <Truck className="text-blue-500 w-5 h-5" /> :
                                <Car className="text-green-500 w-5 h-5" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{v.model}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{v.plateNumber}</p>
                          </div>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:bg-red-950/30 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveVehicle(idx)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {profileData.vehicles.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500 bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                          No vehicles registered.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="text-orange-500" /> Recent Orders
                    </CardTitle>
                    <CardDescription className="text-gray-400">View your fuel order history and receipts.</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => getOrders()}
                    className="text-slate-400 hover:text-white"
                  >
                    <Activity className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userOrders && userOrders.length > 0 ? (
                      [...userOrders]
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .map((order: any, idx) => (
                        <div key={order._id || order.id || idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-xl border border-slate-800/60 bg-[#0a101f] hover:bg-[#0a101f]/80 transition-all gap-4 group shadow-lg">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${order.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                              <Fuel className="w-6 h-6" />
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-bold opacity-90 text-sm tracking-tight">
                                    {order.fuelType || 'Fuel'} Order
                                  </h4>
                                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">#{order._id?.slice(-6) || order.id?.slice(-6) || '---'}</span>
                               </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Manifested on {new Date(order.createdAt || order.timestamp || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Badge variant="secondary" className="bg-[#020817] text-slate-400 text-[9px] font-bold border border-slate-800 px-2 py-0">
                                  {order.quantity}L VOL
                                </Badge>
                                <Badge variant="outline" className={`${order.status === 'delivered' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'} text-[9px] font-bold uppercase px-2 py-0`}>
                                  {order.status || 'pending'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                            <span className="text-2xl font-semibold text-white tracking-tighter">₹{order.totalPrice || order.price || 0}</span>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest hover:bg-blue-500/5">
                              <Download className="w-3 h-3 mr-1" /> Invoice
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        No orders found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="text-green-500" /> Account Security
                  </CardTitle>
                  <CardDescription>Manage your account security and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-800/30">
                    <div>
                      <h4 className="text-white font-medium">Password</h4>
                      <p className="text-sm text-gray-400">Regularly updating your password improves security.</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-gray-300">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/30 bg-red-900/10 mt-6">
                    <div>
                      <h4 className="text-red-400 font-medium">Delete Account</h4>
                      <p className="text-sm text-red-500/70">Permanently remove your account and all data.</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

const UserIconOrBuilding = ({ isStation }: { isStation: boolean }) => {
  return isStation ? <Building2 className="text-blue-500 w-5 h-5" /> : <Star className="text-orange-500 w-5 h-5" />;
};

export default UserProfile;
