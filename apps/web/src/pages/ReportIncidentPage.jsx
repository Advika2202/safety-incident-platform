import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { CategoryBadge, SeverityBadge, StatusBadge } from "../components/Badge";

const CATEGORIES = ["NEAR_MISS", "INJURY", "HAZARD"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const emptyForm = {
  title: "",
  description: "",
  category: "HAZARD",
  severity: "MEDIUM",
  location: "",
};

export default function ReportIncidentPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);

  async function loadMyReports() {
    try {
      const all = await api.listIncidents(token);
      setMyReports(all.filter((i) => i.reporterId === user.id));
    } catch {
      // non-fatal for this view
    }
  }

  useEffect(() => {
    loadMyReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await api.createIncident(token, form);
      setForm(emptyForm);
      setSuccess(true);
      loadMyReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="text-xl font-semibold text-slate-900">Report a safety incident</h1>
        <p className="mt-1 text-sm text-slate-500">
          Flag hazards, near-misses, or injuries as soon as you spot them.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. Frayed crane cable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="What happened, where, and what did you observe?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Location <span className="text-slate-400">(optional)</span>
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. Site B - Tower Crane 3"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600">
              Incident reported. Safety managers have been notified.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold text-slate-900">Your recent reports</h2>
        <div className="mt-3 space-y-3">
          {myReports.length === 0 && (
            <p className="text-sm text-slate-500">You haven't reported anything yet.</p>
          )}
          {myReports.map((incident) => (
            <div
              key={incident.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-900">{incident.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <CategoryBadge category={incident.category} />
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
