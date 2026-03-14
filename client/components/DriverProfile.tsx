import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, MapPin, Phone, Mail, Calendar, Truck, 
  IndianRupee, Droplets, TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type DriverInfo = {
  name: string;
  email: string;
  phone: string;
  currentLocation: string;
  joinDate: Date;
  totalDeliveries: number;
  totalFuelDelivered: number;
  totalEarnings: number;
  averageOrderValue: number;
};

const DriverProfile = () => {
  const { user, updateProfile } = useAuth();
  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    joinDate: new Date(),
    totalDeliveries: 0,
    totalFuelDelivered: 0,
    totalEarnings: 0,
    averageOrderValue: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    setDriverInfo({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      currentLocation: user.currentLocation || '',
      joinDate: user.createdAt ? new Date(user.createdAt) : new Date(),
      totalDeliveries: user.totalDeliveries || 0,
      totalFuelDelivered: user.totalFuelDelivered || 0,
      totalEarnings: user.totalEarnings || 0,
      averageOrderValue: user.averageOrderValue || 0
    });
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (driverInfo.phone && !phoneRegex.test(driverInfo.phone)) {
        throw new Error('Invalid phone number format');
      }

      // Validate location
      if (driverInfo.currentLocation && driverInfo.currentLocation.trim().length < 5) {
        throw new Error('Location must be at least 5 characters long');
      }

      await updateProfile({
        name: driverInfo.name,
        phone: driverInfo.phone,
        currentLocation: driverInfo.currentLocation
      });

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Driver Profile</h1>
          <p className="text-gray-400">Manage your profile and track your performance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <User className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={driverInfo.name}
                        onChange={(e) => setDriverInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700 border border-slate-600 rounded px-3 py-1 w-full mt-1"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-white">{driverInfo.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={driverInfo.phone}
                        onChange={(e) => setDriverInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-slate-700 border border-slate-600 rounded px-3 py-1 w-full mt-1"
                        placeholder="Enter phone number (e.g., +91 9876543210)"
                        pattern="[+]?[0-9]{10,15}"
                      />
                    ) : (
                      <p className="text-white">{driverInfo.phone || 'Add phone number'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-400">Email Address</p>
                    <p className="text-white">{driverInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Current Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={driverInfo.currentLocation}
                        onChange={(e) => setDriverInfo(prev => ({ ...prev, currentLocation: e.target.value }))}
                        className="bg-slate-700 border border-slate-600 rounded px-3 py-1 w-full mt-1"
                        placeholder="Enter your current location"
                        minLength={5}
                      />
                    ) : (
                      <p className="text-white">{driverInfo.currentLocation || 'Add current location'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="text-white">{driverInfo.joinDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Deliveries</p>
                        <p className="text-2xl font-bold text-white">{driverInfo.totalDeliveries}</p>
                        <p className="text-sm text-gray-400">All time</p>
                      </div>
                      <Truck className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Fuel Delivered</p>
                        <p className="text-2xl font-bold text-white">{driverInfo.totalFuelDelivered.toFixed(2)}L</p>
                        <p className="text-sm text-gray-400">All time</p>
                      </div>
                      <Droplets className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Earnings</p>
                        <p className="text-2xl font-bold text-white">₹{driverInfo.totalEarnings.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">All time</p>
                      </div>
                      <IndianRupee className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Average Order Value</p>
                        <p className="text-2xl font-bold text-white">₹{driverInfo.averageOrderValue.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">Per delivery</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile; 