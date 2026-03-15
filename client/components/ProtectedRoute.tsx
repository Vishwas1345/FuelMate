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



  // Force all authenticated users to under-construction page
  if (location.pathname !== '/under-construction') {
    return <Navigate to="/under-construction" replace />;
  }

  return <>{children}</>;
} 