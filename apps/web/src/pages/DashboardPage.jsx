import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { CategoryBadge, SeverityBadge, StatusBadge } from "../components/Badge";

const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = ["NEAR_MISS", "INJURY", "HAZARD"];

const SEVERITY_COLORS = {
  LOW: "#94a3b8",
  MEDIUM: "#f59e0b",
  HIGH: "#fb923c",
  CRITICAL: "#ef4444",
};

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-slate-900"}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ status: "", severity: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listIncidents(token, filters);
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    const bySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
    for (const incident of incidents) {
      byStatus[incident.status] = (byStatus[incident.status] ?? 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] ?? 0) + 1;
    }
    return { byStatus, bySeverity };
  }, [incidents]);

  const chartData = SEVERITIES.map((severity) => ({
    severity,
    count: stats.bySeverity[severity],
  }));

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      await api.updateIncidentStatus(token, id, status);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Safety dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Live view of all reported incidents across your sites.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={incidents.length} />
        <StatCard label="Open" value={stats.byStatus.OPEN} accent="text-blue-600" />
        <StatCard label="In review" value={stats.byStatus.IN_REVIEW} accent="text-amber-600" />
        <StatCard label="Resolved" value={stats.byStatus.RESOLVED} accent="text-emerald-600" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-900">Incidents by severity</p>
        <div className="mt-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="severity" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Incident</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Reporter</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Severity</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && incidents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No incidents match these filters.
                </td>
              </tr>
            )}
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {incident.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{incident.reporter?.name}</td>
                <td className="px-4 py-3">
                  <CategoryBadge category={incident.category} />
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={incident.status}
                    disabled={updatingId === incident.id}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
