import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the auth page, but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }



  // Force onboarding if profile is incomplete
  if (user && !user.isProfileComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Optional: Prevent completed users from visiting onboarding again
  if (user && user.isProfileComplete && location.pathname === '/onboarding') {
    if (user.role === 'station') return <Navigate to="/station" replace />;
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
} 