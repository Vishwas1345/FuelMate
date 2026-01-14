import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Download, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';
import MapView from '@/components/MapView';
import { toast } from '@/components/ui/use-toast';

type UserInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
  orderCount: number;
};

type OrderHistory = {
  id: string;
  date: Date;
  fuelType: string;
  quantity: number;
  brand: string;
  price: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
};

const baseURL = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const { user, userOrders, updateProfile, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Initialize with safe defaults
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: new Date(),
    orderCount: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // First effect: Update userInfo when user data is available
  useEffect(() => {
    if (!user || !user.name) {
      setIsProfileLoading(false);
      return;
    }

    try {
      setUserInfo({
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        joinDate: user.createdAt ? new Date(user.createdAt) : new Date(),
        orderCount: userOrders?.length || 0
      });
    } catch (error) {
      console.error('Error updating user info:', error);
      // Set default values if there's an error
      setUserInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        joinDate: new Date(),
        orderCount: 0
      });
    }
    setIsProfileLoading(false);
  }, [user, userOrders]);

  // Second effect: Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsProfileLoading(false);
          return;
        }

        const response = await fetch(`${baseURL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUserInfo(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          address: data.address || prev.address,
          joinDate: data.createdAt ? new Date(data.createdAt) : prev.joinDate
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Keep existing data on error
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Third effect: Update order history
  useEffect(() => {
    const updateOrderHistory = () => {
      if (!window.orderSystem) return;

      try {
        const history = window.orderSystem.orderHistory.map(order => ({
          id: order.id,
          date: new Date(order.timestamp),
          fuelType: order.fuelType,
          quantity: order.quantity,
          brand: order.brand,
          price: order.price,
          status: order.status,
          paymentMethod: order.paymentMethod || 'Unknown',
          paymentStatus: 'Paid'
        }));

        setOrderHistory(history);
      } catch (error) {
        console.error('Error updating order history:', error);
      }
    };

    updateOrderHistory();

    if (window.orderSystem) {
      window.orderSystem.subscribeToUpdates(updateOrderHistory);
    }

    return () => {
      if (window.orderSystem) {
        window.orderSystem.listeners = window.orderSystem.listeners.filter(
          listener => listener !== updateOrderHistory
        );
      }
    };
  }, []);

  // Show loading state if auth is loading or profile is loading
  if (isLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <span className="text-white text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <span className="text-white text-lg">Please log in to view your profile</span>
        </div>
      </div>
    );
  }

  const handleEditProfile = async () => {
    setIsUpdating(true);
    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (userInfo.phone && !phoneRegex.test(userInfo.phone)) {
        throw new Error('Invalid phone number format');
      }

      // Validate address
      if (userInfo.address && userInfo.address.trim().length < 10) {
        throw new Error('Address must be at least 10 characters long');
      }

      await updateProfile({
        name: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address
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

  const getInitials = (name: string): string => {
    try {
      if (!name || typeof name !== 'string') return '?';
      const nameParts = name.trim().split(' ').filter(Boolean);
      if (nameParts.length === 0) return '?';
      if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    } catch (error) {
      console.error('Error getting initials:', error);
      return '?';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container px-4 py-4 md:py-8 max-w-7xl">
        {isMobile ? (
          // Mobile layout
          <div className="space-y-4">
            {/* Profile Card - Mobile */}
            <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600 relative">
                <div className="absolute -bottom-16 left-4">
                  <Avatar className="h-32 w-32 border-4 border-slate-900">
                    <AvatarFallback className="bg-slate-700 text-3xl">{getInitials(userInfo.name)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="pt-20 pb-2">
                <div className="flex flex-col items-start">
                  <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                    <Mail className="h-4 w-4" />
                    {userInfo.email}
                  </div>
                  <Badge className="mt-2 bg-orange-600 hover:bg-orange-700">Active Member</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white">{userInfo.phone || 'Add phone number'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white">{userInfo.joinDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Package className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Orders</p>
                      <p className="text-white">{userInfo.orderCount} Orders</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Delivery Address</p>
                      <p className="text-white">{userInfo.address || 'Add delivery address'}</p>
                    </div>
                  </div>
                  {userInfo.address && (
                    <div className="h-[200px] mt-4 rounded-lg overflow-hidden border border-slate-700">
                      <MapView address={userInfo.address} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order History - Mobile */}
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Order History
                </CardTitle>
                <CardDescription className="text-gray-400">View and manage your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.slice(0, 3).map((order) => (
                      <div key={order.id} className="p-4 border border-slate-800 rounded-lg bg-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              {order.id}
                              <Badge variant="outline" className={`${order.status === 'Delivered' ? 'border-green-500 text-green-400' :
                                order.status === 'In Transit' ? 'border-blue-500 text-blue-400' :
                                  'border-orange-500 text-orange-400'
                                }`}>
                                {order.status}
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-400">{order.date.toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-400">₹{order.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{order.paymentMethod} • {order.paymentStatus}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Fuel: </span>
                            <span className="text-white">{order.fuelType}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Quantity: </span>
                            <span className="text-white">{order.quantity}L</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Brand: </span>
                            <span className="text-white">{order.brand}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-orange-400 font-semibold">₹{order.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg mb-1">No Orders Yet</p>
                    <p className="text-sm">Place your first fuel order to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Desktop layout
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-orange-500 to-orange-600 relative">
                  <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2">
                    <Avatar className="h-48 w-48 border-4 border-slate-900">
                      <AvatarFallback className="bg-slate-700 text-4xl">{getInitials(userInfo.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <CardHeader className="pt-28 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="text-center w-full">
                      <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                      <div className="flex items-center justify-center gap-1 text-gray-400 mt-1">
                        <Mail className="h-4 w-4" />
                        {userInfo.email}
                      </div>
                      <Badge className="mt-2 bg-orange-600 hover:bg-orange-700">Active Member</Badge>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setIsEditing(false)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300"
                          onClick={handleEditProfile}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <Phone className="h-5 w-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Phone Number</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-slate-700 border border-slate-600 rounded px-3 py-1 w-full mt-1"
                            placeholder="Enter phone number (e.g., +91 9876543210)"
                            pattern="[+]?[0-9]{10,15}"
                          />
                        ) : (
                          <p className="text-white">{userInfo.phone || 'Add phone number'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-400">Member Since</p>
                        <p className="text-white">{userInfo.joinDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <Package className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-400">Total Orders</p>
                        <p className="text-white">{userInfo.orderCount} Orders</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Delivery Address</p>
                        {isEditing ? (
                          <textarea
                            value={userInfo.address}
                            onChange={(e) => setUserInfo(prev => ({ ...prev, address: e.target.value }))}
                            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 w-full h-24"
                            placeholder="Enter complete delivery address (minimum 10 characters)"
                            minLength={10}
                          />
                        ) : (
                          <p className="text-white">{userInfo.address || 'Add delivery address'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {userInfo.address && !isEditing && (
                    <div className="mt-6 h-[250px] rounded-lg overflow-hidden border border-slate-700">
                      <MapView address={userInfo.address} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-8">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Order History
                  </CardTitle>
                  <CardDescription className="text-gray-400">View and manage your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orderHistory.length > 0 ? (
                    <div className="space-y-4">
                      {orderHistory.map((order) => (
                        <div key={order.id} className="p-4 border border-slate-800 rounded-lg bg-slate-800/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white flex items-center gap-2">
                                {order.id}
                                <Badge variant="outline" className={`${order.status === 'Delivered' ? 'border-green-500 text-green-400' :
                                  order.status === 'In Transit' ? 'border-blue-500 text-blue-400' :
                                    'border-orange-500 text-orange-400'
                                  }`}>
                                  {order.status}
                                </Badge>
                              </h3>
                              <p className="text-sm text-gray-400">{order.date.toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-400">₹{order.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-400">{order.paymentMethod} • {order.paymentStatus}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Fuel Type: </span>
                              <span className="text-white">{order.fuelType}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Brand: </span>
                              <span className="text-white">{order.brand}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Quantity: </span>
                              <span className="text-white">{order.quantity} liters</span>
                            </div>
                            <div className="flex justify-end">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-slate-700">
                                <Download className="h-4 w-4 mr-1" /> Invoice
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg mb-1">No Orders Yet</p>
                      <p className="text-sm">Place your first fuel order to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
