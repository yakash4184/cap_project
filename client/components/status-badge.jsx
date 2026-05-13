import clsx from "clsx";

import { statusColors } from "@/lib/constants";

export function StatusBadge({ status }) {
  const label =
    status === "in-progress"
      ? "In Progress"
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        statusColors[status] || "bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </span>
  );
}
