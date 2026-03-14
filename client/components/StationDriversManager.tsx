import React, { useState } from 'react';
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

export const StationDriversManager = () => {
    const [drivers, setDrivers] = useState(initialDrivers);
    const { toast } = useToast();

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

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Delivery <span className="text-[#f97316]">Partners</span>
                    </h1>
                    <p className="text-slate-400 font-medium tracking-tight">Manage partner payrolls, leaves, and activity</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                    + Add New Partner
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
                            <User className="h-3 w-3 text-[#f97316]" />
                            Total Partners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white mb-1">
                            {drivers.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
                            <Car className="h-3 w-3 text-green-500" />
                            Active Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white mb-1">
                            {drivers.filter(d => d.status === 'Active').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0a101f] border-slate-800 shadow-xl group hover:border-[#f97316]/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
                            <Wallet className="h-3 w-3 text-blue-500" />
                            Monthly Payroll
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white mb-1">
                            ₹{(drivers.reduce((acc, curr) => acc + curr.salary, 0)).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Partner Roster</CardTitle>
                    <CardDescription className="text-slate-400">View and manage your station's delivery workforce</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-600 transition-colors">

                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                                        <User className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-white tracking-tight">{driver.name}</h3>
                                            <Badge variant="outline" className={driver.status === 'Active' ? 'text-green-500 border-green-500/30 bg-green-500/10 py-0' : 'text-amber-500 border-amber-500/30 bg-amber-500/10 py-0'}>
                                                {driver.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {driver.phone}</span>
                                            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {driver.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto mt-4 md:mt-0">
                                    <div className="flex flex-col border-l border-slate-800 pl-4">
                                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">Base Salary</span>
                                        <span className="text-white font-bold">₹{driver.salary.toLocaleString()}/mo</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800 pl-4">
                                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">Leaves Used</span>
                                        <span className="text-white font-bold">{driver.leavesUsed} <span className="text-slate-500">/ {driver.leavesTotal}</span></span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-800 pl-4 col-span-2 md:col-span-1">
                                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">Trips Today</span>
                                        <span className="text-white font-bold">{driver.tripsToday}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                                            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-orange-400 focus:text-orange-400 focus:bg-slate-800" onClick={() => handlePaySalary(driver.id, driver.name)}>
                                                <Wallet className="h-4 w-4 mr-2" /> Payroll
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer focus:bg-slate-800" onClick={() => handleGrantLeave(driver.id, driver.name)}>
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
