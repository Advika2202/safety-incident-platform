import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ managerOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (managerOnly && user.role !== "MANAGER") return <Navigate to="/report" replace />;

  return <Outlet />;
}
