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
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsChangingPassword(true);

      // Validate passwords
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Update password in database
      await updatePassword(currentPassword, newPassword);

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsDialogOpen(false);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container px-4 py-6 md:py-8 max-w-5xl">

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-400">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label htmlFor="order-updates" className="flex-1">Order status updates</Label>
              <Switch
                id="order-updates"
                checked={notifications.orderUpdates}
                onCheckedChange={() => handleNotificationChange('orderUpdates')}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label htmlFor="delivery-updates" className="flex-1">Delivery notifications</Label>
              <Switch
                id="delivery-updates"
                checked={notifications.deliveryUpdates}
                onCheckedChange={() => handleNotificationChange('deliveryUpdates')}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label htmlFor="promotions" className="flex-1">Promotions and offers</Label>
              <Switch
                id="promotions"
                checked={notifications.promotions}
                onCheckedChange={() => handleNotificationChange('promotions')}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label htmlFor="email-notifications" className="flex-1">Email notifications</Label>
              <Switch
                id="email-notifications"
                checked={notifications.emailNotifications}
                onCheckedChange={() => handleNotificationChange('emailNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-400" />
              About & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="about" className="border-slate-800">
                <AccordionTrigger className="text-white hover:text-white">About FuelMate</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <p>FuelMate is a revolutionary service that delivers fuel right to your doorstep. Our mission is to make fuel delivery convenient, safe, and affordable for everyone.</p>
                  <p className="mt-2">Founded by Vishwas Tiwari (CEO & Founder, FuelMate), a visionary entrepreneur committed to revolutionizing the fuel delivery industry. Under his leadership, FuelMate has emerged as a pioneering force in bringing innovative solutions to meet modern fuel delivery needs.</p>
                  <p className="mt-2">Version 1.2.0</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq" className="border-slate-800">
                <AccordionTrigger className="text-white hover:text-white">Frequently Asked Questions</AccordionTrigger>
                <AccordionContent className="text-gray-300 space-y-3">
                  <div>
                    <h4 className="font-medium text-white">How does fuel delivery work?</h4>
                    <p className="text-sm">We deliver fuel directly to your location using specialized vehicles that are safe and compliant with all regulations.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Is there a minimum order quantity?</h4>
                    <p className="text-sm">Yes, the minimum order is 5 liters of fuel.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">How long does delivery take?</h4>
                    <p className="text-sm">Delivery times typically range from 30 minutes to 2 hours depending on your location and current demand.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" className="border-slate-800">
                <AccordionTrigger className="text-white hover:text-white">Contact Support</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <p>Email: support@fuelmate.com</p>
                  <p>Phone: +91 1800 123 4567</p>
                  <p className="mt-2">Available 24/7 for your support needs.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-400" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
