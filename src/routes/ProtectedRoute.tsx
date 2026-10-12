import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./../features/auth/AuthContext";
import { isAuthenticated } from "../api/auth";

export default function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}