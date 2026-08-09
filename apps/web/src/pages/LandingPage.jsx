import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Logo from "../components/Logo";

const FEATURES = [
  {
    icon: "📋",
    title: "Report in seconds",
    description:
      "Workers flag hazards, near-misses, and injuries from the field in a few taps — no paperwork, no delay.",
  },
  {
    icon: "📊",
    title: "Live safety dashboard",
    description:
      "Managers see every open incident, filter by severity or category, and track trends across sites at a glance.",
  },
  {
    icon: "🔔",
    title: "Instant high-severity alerts",
    description:
      "Critical reports trigger an automatic alert the moment they're filed — nothing sits unnoticed in a queue.",
  },
];

export default function LandingPage() {
  const { user, isManager } = useAuth();

  if (user) {
    return <Navigate to={isManager ? "/dashboard" : "/report"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Logo />
            </span>
            SiteGuard
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
          Built for construction &amp; oil &amp; gas sites
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Catch hazards before they become incidents.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          SiteGuard gives frontline workers a fast way to report safety issues, and gives
          safety managers a live view of every site — with automatic alerts the moment
          something critical comes in.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        SiteGuard — a safety incident reporting platform.
      </footer>
    </div>
  );
}
