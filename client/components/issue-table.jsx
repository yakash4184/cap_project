"use client";

import { StatusBadge } from "@/components/status-badge";
import { SectionCard } from "@/components/section-card";
import { formatDate } from "@/lib/formatters";

export function IssueTable({
  issues,
  showSelection = false,
  selectedIds = [],
  onToggleSelect,
  onToggleAll,
  renderActions,
  emptyMessage = "No issues found",
}) {
  const allSelected = issues.length > 0 && issues.every((issue) => selectedIds.includes(issue._id));
  const hasActions = Boolean(renderActions);

  return (
    <SectionCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50/90 text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              {showSelection ? (
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onToggleAll?.()}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
              ) : null}
              <th className="px-5 py-4">Issue</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Reported</th>
              {hasActions ? <th className="px-5 py-4">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td
                  colSpan={(showSelection ? 1 : 0) + 5 + (hasActions ? 1 : 0)}
                  className="px-5 py-16 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {issues.map((issue) => (
              <tr
                key={issue._id}
                className="border-b border-slate-100 bg-white/70 text-sm text-slate-700 transition hover:bg-white"
              >
                {showSelection ? (
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(issue._id)}
                      onChange={() => onToggleSelect?.(issue._id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                ) : null}
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{issue.title}</p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                    {issue.description}
                  </p>
                </td>
                <td className="px-5 py-4 capitalize">{issue.category}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="px-5 py-4">{issue.assignedDepartment}</td>
                <td className="px-5 py-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {formatDate(issue.createdAt)}
                </td>
                {hasActions ? (
                  <td className="px-5 py-4">{renderActions(issue)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
