import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToHash from "@/components/ScrollToHash";

import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Index from "./pages/Index";
import StationDashboard from "./pages/StationDashboard";
import StationOrders from "./pages/StationOrders";
import StationDrivers from "./pages/StationDrivers";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import OrdersDashboard from "./pages/OrdersDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import ChatWidget from "@/components/ChatWidget";
import AppLayout from "@/components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ScrollToTop />
        <ScrollToHash />
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes - Marketing Site */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard Routes with Sidebar Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/station" element={<StationDashboard />} />
            <Route path="/station/orders" element={<StationOrders />} />
            <Route path="/station/drivers" element={<StationDrivers />} />
            <Route path="/customer" element={<Index />} />
            <Route path="/orders-dashboard" element={<OrdersDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
