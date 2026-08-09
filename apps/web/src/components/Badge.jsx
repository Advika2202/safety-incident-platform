const SEVERITY_STYLES = {
  LOW: "bg-slate-100 text-slate-700 ring-slate-600/20",
  MEDIUM: "bg-amber-100 text-amber-800 ring-amber-600/20",
  HIGH: "bg-orange-100 text-orange-800 ring-orange-600/20",
  CRITICAL: "bg-red-100 text-red-800 ring-red-600/20",
};

const STATUS_STYLES = {
  OPEN: "bg-blue-100 text-blue-800 ring-blue-600/20",
  IN_REVIEW: "bg-amber-100 text-amber-800 ring-amber-600/20",
  RESOLVED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
};

function BaseBadge({ label, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  return (
    <BaseBadge
      label={severity}
      className={SEVERITY_STYLES[severity] ?? "bg-slate-100 text-slate-700 ring-slate-600/20"}
    />
  );
}

export function StatusBadge({ status }) {
  return (
    <BaseBadge
      label={status.replace("_", " ")}
      className={STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 ring-slate-600/20"}
    />
  );
}

export function CategoryBadge({ category }) {
  return (
    <BaseBadge
      label={category.replace("_", " ")}
      className="bg-slate-100 text-slate-600 ring-slate-500/20"
    />
  );
}
