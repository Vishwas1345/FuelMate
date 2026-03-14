import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
    Check, X, Clock, Truck, Phone, Mail, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import MapView from './MapView';

type Driver = {
    name: string;
    phone: string;
    email: string;
    currentLocation?: string;
};

const availableDrivers: Driver[] = [
    {
        name: "Amit Verma",
        phone: "+91 98765 43210",
        email: "amit.verma@fuelmate.com",
        currentLocation: "Adajan, Surat"
    },
    {
        name: "Rajesh Kumar",
        phone: "+91 87654 32109",
        email: "rajesh.kumar@fuelmate.com",
        currentLocation: "City Light, Surat"
    },
    {
        name: "Priya Patel",
        phone: "+91 76543 21098",
        email: "priya.patel@fuelmate.com",
        currentLocation: "Vesu, Surat"
    }
];

export const StationOrdersDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const fetchedOrders = await api.getOrders().catch(() => []);
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            }
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            let driverDetails = undefined;
            if (newStatus === 'in-transit') {
                driverDetails = selectedDriver || availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
            }

            await api.updateOrderStatus(orderId, newStatus, driverDetails);

            // Update local state optimistic
            setOrders(orders.map(o => o.id === orderId || o._id === orderId ? { ...o, status: newStatus, driver: driverDetails } : o));
            if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === orderId)) {
                setSelectedOrder({ ...selectedOrder, status: newStatus, driver: driverDetails });
            }

            let toastMessage = "";
            switch (newStatus) {
                case 'confirmed':
                    toastMessage = `Order ${orderId} confirmed and ready for delivery.`;
                    break;
                case 'in-transit':
                    toastMessage = `Order ${orderId} in transit with ${driverDetails?.name}.`;
                    break;
                case 'delivered':
                    toastMessage = `Order ${orderId} delivered successfully.`;
                    break;
                case 'cancelled':
                    toastMessage = `Order ${orderId} has been rejected.`;
                    break;
                default:
                    toastMessage = `Order ${orderId} updated to ${newStatus}`;
            }

            toast({
                title: "Order Updated",
                description: toastMessage,
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update order status.",
                variant: "destructive"
            });
        }
    };

    const pendingOrders = orders.filter(order => order.status === 'pending');
    const activeOrders = orders.filter(order => order.status === 'confirmed' || order.status === 'in-transit');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5" />;
            case 'confirmed': return <Check className="h-5 w-5" />;
            case 'in-transit': return <Truck className="h-5 w-5" />;
            case 'delivered': return <Check className="h-5 w-5" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
            case 'confirmed':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
            case 'in-transit':
                return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">In Transit</Badge>;
            case 'delivered':
                return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                        Manage <span className="text-[#f97316]">Orders</span>
                    </h1>
                    <p className="text-slate-400 font-medium tracking-tight">Review, accept, and dispatch fuel deliveries</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-5 lg:col-span-4 space-y-6">
                    <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
                        <CardHeader>
                            <CardTitle className="text-white">Order Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="pending" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-slate-900">
                                    <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                        Pending
                                    </TabsTrigger>
                                    <TabsTrigger value="active" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                        Active
                                    </TabsTrigger>
                                    <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                        All
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="pending" className="space-y-4 mt-4">
                                    {pendingOrders.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                            <p className="text-gray-500">No pending orders</p>
                                        </div>
                                    ) : (
                                        pendingOrders.map(order => (
                                            <div
                                                key={order._id || order.id}
                                                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id || selectedOrder?._id === order._id ? 'bg-orange-500 text-white' : 'bg-slate-900 hover:bg-slate-800'}`}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">Order #{order.id || order._id?.slice(-6)}</h3>
                                                        <p className="text-sm opacity-90">{order.customer?.name || order.customer}</p>
                                                    </div>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                                                    <p className="opacity-75">{new Date(order.timestamp || order.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="active" className="space-y-4 mt-4">
                                    {activeOrders.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                            <p className="text-gray-500">No active orders</p>
                                        </div>
                                    ) : (
                                        activeOrders.map(order => (
                                            <div
                                                key={order._id || order.id}
                                                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id || selectedOrder?._id === order._id ? 'bg-orange-500 text-white' : 'bg-slate-900 hover:bg-orange-500 hover:text-white'}`}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">Order #{order.id || order._id?.slice(-6)}</h3>
                                                        <p className="text-sm opacity-90">{order.customer?.name || order.customer}</p>
                                                    </div>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                                                    <p className="opacity-90">
                                                        {order.status === 'in-transit' && (order.driverName || order.driver?.name)
                                                            ? `Driver: ${order.driverName || order.driver?.name}`
                                                            : new Date(order.timestamp || order.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="all" className="space-y-4 mt-4">
                                    {orders.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                            <p className="text-gray-500">No orders</p>
                                        </div>
                                    ) : (
                                        orders.map(order => (
                                            <div
                                                key={order._id || order.id}
                                                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id || selectedOrder?._id === order._id ? 'bg-orange-500 text-white' : 'bg-slate-900 hover:bg-orange-500 hover:text-white'}`}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">Order #{order.id || order._id?.slice(-6)}</h3>
                                                        <p className="text-sm opacity-90">{order.customer?.name || order.customer}</p>
                                                    </div>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <p className="opacity-90">{order.fuelType} - {order.quantity}L</p>
                                                    <p className="opacity-75">{new Date(order.timestamp || order.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-7 lg:col-span-8">
                    <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
                        <CardHeader>
                            <CardTitle className="text-white">Order Details & Dispatch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedOrder ? (
                                <div>
                                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                                        <div className="bg-slate-900 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-400">Customer Name</p>
                                                    <p className="font-medium text-white">{selectedOrder.customer?.name || selectedOrder.customer}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Delivery Address</p>
                                                    <p className="font-medium text-white">{selectedOrder.deliveryAddress}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Order Time</p>
                                                    <p className="font-medium text-white">{new Date(selectedOrder.timestamp || selectedOrder.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-white mb-4">Order Information</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-400">Fuel Type</p>
                                                    <p className="font-medium text-white">{selectedOrder.fuelType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Quantity</p>
                                                    <p className="font-medium text-white">{selectedOrder.quantity} liters</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Amount</p>
                                                    <p className="font-medium text-white">₹{(selectedOrder.price || selectedOrder.totalPrice || 0).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Status</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusIcon(selectedOrder.status)}
                                                        {getStatusBadge(selectedOrder.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedOrder.status === 'pending' && (
                                        <div className="mb-6 bg-slate-900 p-4 rounded-lg border border-orange-500/30">
                                            <h3 className="text-lg font-medium text-white mb-3">Require Action: Dispatch Driver</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {availableDrivers.map((driver) => (
                                                    <div
                                                        key={driver.name}
                                                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedDriver?.name === driver.name
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-slate-800 hover:bg-slate-700'
                                                            }`}
                                                        onClick={() => setSelectedDriver(driver)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-5 w-5" />
                                                            <p className="font-medium">{driver.name}</p>
                                                        </div>
                                                        <div className="mt-2 text-sm opacity-90">
                                                            <p className="flex items-center gap-1">
                                                                <Truck className="h-3 w-3" /> {driver.currentLocation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedOrder.driver && (
                                        <div className="mb-6 bg-slate-900 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-white mb-2">Assigned Driver</h3>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-3 mb-3 md:mb-0">
                                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <User className="h-7 w-7 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{selectedOrder.driver.name}</p>
                                                        <p className="text-sm text-gray-400">{selectedOrder.driver.currentLocation || 'On Route'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-slate-800 text-white">
                                                        <Phone className="h-4 w-4" />
                                                        {selectedOrder.driver.phone || 'Call'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-white mb-3">Delivery Map</h3>
                                        <div className="h-64 rounded-lg overflow-hidden border border-slate-700">
                                            <MapView address={selectedOrder.deliveryAddress} />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {selectedOrder.status === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => updateOrderStatus(selectedOrder.id || selectedOrder._id, 'confirmed')}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                                    disabled={!selectedDriver}
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Accept & Dispatch
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => updateOrderStatus(selectedOrder.id || selectedOrder._id, 'cancelled')}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Reject Order
                                                </Button>
                                            </>
                                        )}

                                        {selectedOrder.status === 'confirmed' && (
                                            <Button
                                                onClick={() => updateOrderStatus(selectedOrder.id || selectedOrder._id, 'in-transit')}
                                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                            >
                                                <Truck className="mr-2 h-4 w-4" />
                                                Start Delivery
                                            </Button>
                                        )}

                                        {selectedOrder.status === 'in-transit' && (
                                            <Button
                                                onClick={() => updateOrderStatus(selectedOrder.id || selectedOrder._id, 'delivered')}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                Mark as Delivered
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-400">Select an order from the queue to manage</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StationOrdersDashboard;
