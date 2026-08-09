import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import DashboardPage from "./pages/DashboardPage";
import IncidentDetailPage from "./pages/IncidentDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/report" element={<ReportIncidentPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Route>
        <Route element={<ProtectedRoute managerOnly />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
