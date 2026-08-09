import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";

const POLL_INTERVAL_MS = 8000;
const LAST_SEEN_KEY = "sip_notifications_last_seen";

export default function NotificationsBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  // Persisted so a page refresh doesn't silently mark everything "seen" —
  // only actually opening the bell should do that.
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? Number(stored) : 0;
  });
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.listNotifications(token);
        if (!cancelled) setNotifications(data);
      } catch {
        // silent — this is a best-effort background poll
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unseenCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > lastSeenAt
  ).length;

  function toggleOpen() {
    setOpen((prev) => {
      if (!prev) {
        const now = Date.now();
        setLastSeenAt(now);
        localStorage.setItem(LAST_SEEN_KEY, String(now));
      }
      return !prev;
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Alerts"
      >
        🔔
        {unseenCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
            Alerts
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No high-severity alerts yet.
              </p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                to={`/incidents/${n.incidentId}`}
                onClick={() => setOpen(false)}
                className="block border-b border-slate-50 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <p className="text-slate-800">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
