import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { User, Phone, Mail, Wallet, CalendarRange, Car, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const initialDrivers = [
    {
        id: 'd1',
        name: "Amit Verma",
        phone: "+91 98765 43210",
        email: "amit.verma@fuelmate.com",
        status: "Active",
        salary: 25000,
        leavesTotal: 12,
        leavesUsed: 3,
        tripsToday: 4,
        rating: 4.8
    },
    {
        id: 'd2',
        name: "Rajesh Kumar",
        phone: "+91 87654 32109",
        email: "rajesh.kumar@fuelmate.com",
        status: "On Leave",
        salary: 22000,
        leavesTotal: 12,
        leavesUsed: 12,
        tripsToday: 0,
        rating: 4.5
    },
    {
        id: 'd3',
        name: "Priya Patel",
        phone: "+91 76543 21098",
        email: "priya.patel@fuelmate.com",
        status: "Active",
        salary: 27000,
        leavesTotal: 15,
        leavesUsed: 5,
        tripsToday: 6,
        rating: 4.9
    }
];

type DriverStatus = 'Active' | 'On Leave';
type Driver = {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: DriverStatus;
    salary: number;
    leavesTotal: number;
    leavesUsed: number;
    tripsToday: number;
    rating: number;
};

export const StationDriversManager = () => {
    const storageKey = 'fuelmate:stationDrivers';
    const [drivers, setDrivers] = useState<Driver[]>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return initialDrivers as Driver[];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) return parsed as Driver[];
            return initialDrivers as Driver[];
        } catch {
            return initialDrivers as Driver[];
        }
    });
    const { toast } = useToast();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDriver, setNewDriver] = useState({
        name: '',
        phone: '',
        email: '',
        salary: ''
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(drivers));
        } catch {
            // ignore persistence errors (private mode, quota, etc.)
        }
    }, [drivers]);

    const stats = useMemo(() => {
        const activeCount = drivers.filter(d => d.status === 'Active').length;
        const payroll = drivers.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
        return { activeCount, payroll };
    }, [drivers]);

    const handlePaySalary = (driverId: string, name: string) => {
        toast({
            title: "Salary Processed",
            description: `Monthly salary has been initiated for ${name}`,
        });
    };

    const handleGrantLeave = (driverId: string, name: string) => {
        toast({
            title: "Leave Granted",
            description: `Time-off request approved for ${name}`,
        });
    };

    const resetRegisterForm = () => {
        setNewDriver({ name: '', phone: '', email: '', salary: '' });
    };

    const handleRegisterPartner = async () => {
        const name = newDriver.name.trim();
        const phone = newDriver.phone.trim();
        const email = newDriver.email.trim().toLowerCase();
        const salary = Number(String(newDriver.salary).replace(/[^\d.]/g, ''));

        if (!name || !phone || !email || !Number.isFinite(salary) || salary <= 0) {
            toast({
                title: "Missing details",
                description: "Please provide name, phone, email, and a valid salary.",
                variant: "destructive",
            });
            return;
        }

        const emailTaken = drivers.some(d => d.email.toLowerCase() === email);
        if (emailTaken) {
            toast({
                title: "Partner already exists",
                description: "A delivery partner with this email is already registered.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
            const created: Driver = {
                id,
                name,
                phone,
                email,
                status: 'Active',
                salary,
                leavesTotal: 12,
                leavesUsed: 0,
                tripsToday: 0,
                rating: 5.0
            };

            setDrivers(prev => [created, ...prev]);
            toast({
                title: "Partner registered",
                description: `${name} has been added to Delivery Partners.`,
            });
            setIsRegisterOpen(false);
            resetRegisterForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full px-4 md:px-0 space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
                <div>
                    <h1 className="text-2xl md:text-5xl font-bold text-white tracking-tighter mb-2">
                        Delivery <span className="text-[#f97316]">Partners</span>
                    </h1>
                    <p className="text-[11px] md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">
                        Manage your delivery team and payroll
                    </p>
                </div>
                <Button
                    onClick={() => setIsRegisterOpen(true)}
                    className="w-full md:w-auto bg-[#f97316] hover:bg-[#f97316]/90 text-white text-[11px] font-bold uppercase tracking-widest h-12 px-10 shadow-lg shadow-orange-500/20 border-none transition-all hover:scale-[1.02] active:scale-95"
                >
                    + Register Partner
                </Button>
            </div>

            <Dialog open={isRegisterOpen} onOpenChange={(open) => {
                setIsRegisterOpen(open);
                if (!open) resetRegisterForm();
            }}>
                <DialogContent className="bg-[#0a101f] border-slate-800 text-white rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">Register Delivery Partner</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Add a new partner to your delivery team.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-slate-300">Full name</Label>
                            <Input
                                value={newDriver.name}
                                onChange={(e) => setNewDriver(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Rahul Sharma"
                                className="bg-[#020817] border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-slate-300">Phone</Label>
                            <Input
                                value={newDriver.phone}
                                onChange={(e) => setNewDriver(p => ({ ...p, phone: e.target.value }))}
                                placeholder="e.g. +91 98765 43210"
                                className="bg-[#020817] border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-slate-300">Email</Label>
                            <Input
                                value={newDriver.email}
                                onChange={(e) => setNewDriver(p => ({ ...p, email: e.target.value }))}
                                placeholder="e.g. partner@fuelmate.com"
                                className="bg-[#020817] border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-slate-300">Monthly salary (₹)</Label>
                            <Input
                                inputMode="numeric"
                                value={newDriver.salary}
                                onChange={(e) => setNewDriver(p => ({ ...p, salary: e.target.value }))}
                                placeholder="e.g. 25000"
                                className="bg-[#020817] border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsRegisterOpen(false)}
                            className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/40"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegisterPartner}
                            className="bg-[#f97316] hover:bg-[#f97316]/90 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Register Partner'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <User className="h-12 w-12 text-[#f97316]" />
                    </div>
                    <CardHeader className="pb-1 px-4 pt-4 md:pt-6">
                        <CardTitle className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Partners
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 md:pb-6">
                        <div className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                            {drivers.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Car className="h-12 w-12 text-green-500" />
                    </div>
                    <CardHeader className="pb-1 px-4 pt-4 md:pt-6">
                        <CardTitle className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 md:pb-6">
                        <div className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                            {stats.activeCount}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a101f] border-slate-800/60 shadow-xl relative overflow-hidden group col-span-2 lg:col-span-1 border-t border-t-orange-500/20">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Wallet className="h-12 w-12 text-blue-500" />
                    </div>
                    <CardHeader className="pb-1 px-4 pt-4 md:pt-6">
                        <CardTitle className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Monthly Payroll
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 md:pb-6">
                        <div className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                            ₹{stats.payroll.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#0a101f] border-slate-800/60 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-[#020817]/30 p-6 md:p-8">
                    <CardTitle className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em]">Delivery Partners</CardTitle>
                    <CardDescription className="text-[11px] text-slate-500 font-medium mt-1">List of all your delivery team members</CardDescription>
                </CardHeader>
                <CardContent className="p-5 md:p-8 lg:p-10">
                    <div className="space-y-3">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-[#020817] border border-slate-800/50 rounded-xl p-4 md:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 md:gap-6 hover:border-[#f97316]/30 transition-all duration-300">

                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-[#0a101f] flex items-center justify-center border border-slate-800 shadow-inner group-hover:border-[#f97316]/50 transition-colors">
                                        <User className="h-6 w-6 md:h-7 md:w-7 text-slate-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-sm md:text-base font-bold text-white tracking-tight truncate">{driver.name}</h3>
                                            <Badge variant="outline" className={`text-[9px] uppercase tracking-tighter px-1.5 py-0 border-none rounded-sm ${driver.status === 'Active' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                                                {driver.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-600" /> {driver.phone}</span>
                                            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-600" /> {driver.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 flex-1 lg:max-w-md pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-600 mb-1">Monthly Salary</span>
                                        <span className="text-xs md:text-sm text-white font-bold tracking-tight">₹{driver.salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-600 mb-1">Leaves Used</span>
                                        <span className="text-xs md:text-sm text-white font-bold tracking-tight">{driver.leavesUsed} <span className="text-slate-600">/ {driver.leavesTotal}</span></span>
                                    </div>
                                    <div className="flex flex-col col-span-2 sm:col-span-1">
                                        <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-600 mb-1">Trips Today</span>
                                        <span className="text-xs md:text-sm text-white font-bold tracking-tight">{driver.tripsToday}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-3 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/50">
                                    <div className="lg:hidden flex flex-col">
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#f97316]">Actions</span>
                                        <span className="text-[10px] text-slate-500">More options</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#0a101f] border-slate-800 text-white min-w-[160px] p-2 rounded-xl shadow-2xl">
                                            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-orange-400 focus:text-orange-400 focus:bg-slate-800 rounded-lg p-3 mb-1" onClick={() => handlePaySalary(driver.id, driver.name)}>
                                                <Wallet className="h-4 w-4 mr-2" /> Pay Salary
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-[10px] font-bold uppercase tracking-widest focus:bg-slate-800 rounded-lg p-3" onClick={() => handleGrantLeave(driver.id, driver.name)}>
                                                <CalendarRange className="h-4 w-4 mr-2" /> Grant Leave
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StationDriversManager;
