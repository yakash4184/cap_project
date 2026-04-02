import clsx from "clsx";

import { statusColors } from "@/lib/constants";

export function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide",
        statusColors[status] || "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}

