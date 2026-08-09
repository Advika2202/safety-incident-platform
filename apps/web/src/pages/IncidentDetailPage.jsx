import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { CategoryBadge, SeverityBadge, StatusBadge } from "../components/Badge";

const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED"];

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { token, isManager } = useAuth();
  const [incident, setIncident] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  async function load() {
    try {
      const data = await api.getIncident(token, id);
      setIncident(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const data = await api.updateIncidentStatus(token, id, status);
      setIncident((prev) => ({ ...prev, status: data.status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!incident) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/dashboard" className="text-sm text-slate-500 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-semibold text-slate-900">{incident.title}</h1>
          <StatusBadge status={incident.status} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <CategoryBadge category={incident.category} />
          <SeverityBadge severity={incident.severity} />
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
          {incident.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
          <div>
            <dt className="text-slate-500">Reported by</dt>
            <dd className="font-medium text-slate-900">{incident.reporter?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="font-medium text-slate-900">{incident.location || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Reported at</dt>
            <dd className="font-medium text-slate-900">
              {new Date(incident.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Last updated</dt>
            <dd className="font-medium text-slate-900">
              {new Date(incident.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>

        {isManager && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-700">Update status</p>
            <div className="mt-2 flex gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={updating || incident.status === status}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
                    incident.status === status
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
