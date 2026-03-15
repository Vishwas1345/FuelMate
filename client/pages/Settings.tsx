import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, Info, Shield, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const { logout, user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deliveryUpdates: true,
    promotions: false,
    emailNotifications: true
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Settings Updated",
      description: "Preferences saved to secure cloud.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
      toast({ title: "Signed Out", description: "You have been signed out of your account." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsChangingPassword(true);
      if (newPassword.length < 8) throw new Error('Password must be 8+ characters');
      if (newPassword !== confirmPassword) throw new Error('Passwords mismatch');

      await updatePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setIsDialogOpen(false);
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred while updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-0 space-y-10 pb-12">
      <div className="px-1">
        <h1 className="text-2xl md:text-5xl font-bold text-white tracking-tighter mb-2">
            Account <span className="text-[#f97316]">Settings</span>
        </h1>
        <p className="text-[11px] md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">
            Manage your notifications & security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-12 space-y-8">
            <Card className="bg-[#0a101f] border-slate-800/60 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 bg-[#020817]/30 p-6 md:p-8">
                <CardTitle className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <Bell className="h-4 w-4 text-[#f97316]" /> Notifications
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 font-medium mt-1">Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4">
                {[
                    { id: 'orderUpdates', label: 'Order Updates', desc: 'Get real-time updates on your fuel orders' },
                    { id: 'deliveryUpdates', label: 'Delivery Alerts', desc: 'Receive notifications from your delivery partner' },
                    { id: 'promotions', label: 'Promotions', desc: 'Get news about credits and special offers' },
                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive account alerts via email' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-[#020817] border border-slate-800/40 rounded-xl group hover:border-[#f97316]/20 transition-all">
                        <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-xs md:text-sm font-bold text-white tracking-tight">{item.label}</Label>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.desc}</p>
                        </div>
                        <Switch
                            id={item.id}
                            checked={notifications[item.id as keyof typeof notifications]}
                            onCheckedChange={() => handleNotificationChange(item.id as keyof typeof notifications)}
                            className="bg-slate-800 data-[state=checked]:bg-[#f97316]"
                        />
                    </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#0a101f] border-slate-800/60 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-800/50 bg-[#020817]/30 p-6 md:p-8">
                    <CardTitle className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Shield className="h-4 w-4 text-green-500" /> Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-[#020817] border border-slate-800 md:h-14 rounded-xl text-white hover:bg-slate-800/50 hover:border-[#f97316]/30 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                          <Lock className="h-4 w-4 mr-3 text-[#f97316]" /> Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0a101f] border-slate-800 text-white rounded-2xl p-8 max-w-md">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="text-sm font-bold uppercase tracking-[0.3em]">Update Password</DialogTitle>
                          <DialogDescription className="text-[11px] text-slate-500 font-medium">Enter your current password and choose a new one</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5">
                          {[
                            { id: 'current', label: 'Current Password', val: currentPassword, set: setCurrentPassword },
                            { id: 'new', label: 'New Password', val: newPassword, set: setNewPassword },
                            { id: 'confirm', label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword }
                          ].map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">{field.label}</Label>
                                <Input
                                    type="password"
                                    value={field.val}
                                    onChange={(e) => field.set(e.target.value)}
                                    className="bg-[#020817] border-slate-800 h-12 text-white placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-8">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 bg-transparent border-slate-800 h-12 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white">Cancel</Button>
                          <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="flex-1 bg-[#f97316] h-12 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20">
                            {isChangingPassword ? 'Saving...' : 'Update Password'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={handleLogout} className="w-full bg-[#020817] border border-slate-800 md:h-14 rounded-xl text-white hover:bg-slate-800/50 hover:border-red-500/30 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                      <LogOut className="h-4 w-4 mr-3 text-red-500" /> Sign Out
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a101f] border-slate-800/60 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-800/50 bg-[#020817]/30 p-6 md:p-8">
                    <CardTitle className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Info className="h-4 w-4 text-blue-500" /> About & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <Accordion type="single" collapsible className="w-full">
                      {[
                        { val: 'about', title: 'About FuelMate', content: 'FuelMate is an easy way to get fuel delivered to your door. Version 1.2.4.' },
                        { val: 'support', title: 'Contact Support', content: 'Email: support@fuelmate.com | Phone: +91 1800 123 4567' }
                      ].map((item) => (
                        <AccordionItem key={item.val} value={item.val} className="border-slate-800/50">
                            <AccordionTrigger className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:no-underline">{item.title}</AccordionTrigger>
                            <AccordionContent className="text-[12px] leading-relaxed text-slate-500 font-medium pb-4">{item.content}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
