import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import NotificationsBell from "./NotificationsBell";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Layout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Logo />
              </span>
              SiteGuard
            </span>
            {user && (
              <nav className="flex items-center gap-1">
                <NavLink to="/report" className={navLinkClass}>
                  Report Incident
                </NavLink>
                {isManager && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                )}
              </nav>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              {isManager && <NotificationsBell />}
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
