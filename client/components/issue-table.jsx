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
      <div className="md:hidden">
        {showSelection ? (
          <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Select issues
            </p>
            <button
              type="button"
              onClick={() => onToggleAll?.()}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
        ) : null}

        {issues.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">{emptyMessage}</div>
        ) : null}

        <div className="divide-y divide-blue-100">
          {issues.map((issue) => (
            <article key={issue._id} className="space-y-3 bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink">{issue.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{issue.description}</p>
                </div>
                {showSelection ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(issue._id)}
                    onChange={() => onToggleSelect?.(issue._id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 capitalize">
                  {issue.category}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1">
                  {issue.assignedDepartment}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 uppercase tracking-[0.14em]">
                  {formatDate(issue.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={issue.status} />
                {hasActions ? <div>{renderActions(issue)}</div> : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left">
          <thead className="border-b border-blue-100 bg-blue-50/75 text-xs uppercase tracking-[0.22em] text-slate-500">
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
                className="border-b border-blue-50 bg-white/80 text-sm text-slate-700 transition hover:bg-blue-50/40"
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
