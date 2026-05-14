"use client";

import { useMemo } from "react";

import { StatusBadge } from "@/components/status-badge";
import { SectionCard } from "@/components/section-card";
import { formatDate, formatDateTime } from "@/lib/formatters";

const AI_STATUS_STYLES = {
  verified: "bg-emerald-100 text-emerald-800",
  suspicious: "bg-rose-100 text-rose-800",
  "needs-review": "bg-amber-100 text-amber-800",
  unavailable: "bg-slate-100 text-slate-700",
};

export function IssueTable({
  issues,
  showSelection = false,
  showReporterDetails = false,
  showEvidencePreview = false,
  selectedIds = [],
  onToggleSelect,
  onToggleAll,
  renderActions,
  emptyMessage = "No issues found",
}) {
  const safeIssues = useMemo(() => {
    const seen = new Set();

    return issues.filter((issue, index) => {
      const id = issue?._id ? String(issue._id) : `missing-id-${index}`;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }, [issues]);

  const allSelected =
    safeIssues.length > 0 && safeIssues.every((issue) => selectedIds.includes(issue._id));
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

        {safeIssues.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">{emptyMessage}</div>
        ) : null}

        <div className="divide-y divide-blue-100">
          {safeIssues.map((issue, index) => (
            <article
              key={issue._id || `${issue.title || "issue"}-${issue.createdAt || index}-${index}`}
              className="space-y-3 bg-white px-4 py-4"
            >
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
                {issue.aiVerification?.status ? (
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${AI_STATUS_STYLES[issue.aiVerification.status] || AI_STATUS_STYLES["needs-review"]}`}
                  >
                    AI: {issue.aiVerification.status}
                  </span>
                ) : null}
              </div>

              {showEvidencePreview && issue.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-blue-100 bg-slate-50 p-2">
                  <img
                    src={issue.imageUrl}
                    alt={`Evidence for ${issue.title}`}
                    className="h-40 w-full rounded-lg object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}

              {showReporterDetails ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">
                    {issue.reportedBy?.name || "Unknown citizen"}
                  </p>
                  <p>{issue.reportedBy?.phoneNumber || "-"}</p>
                  <p className="truncate">{issue.reportedBy?.email || "-"}</p>
                </div>
              ) : null}

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
              {showReporterDetails ? <th className="px-5 py-4">Citizen</th> : null}
              {showReporterDetails ? <th className="px-5 py-4">Contact</th> : null}
              {showEvidencePreview ? <th className="px-5 py-4">Evidence</th> : null}
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Submitted</th>
              {hasActions ? <th className="px-5 py-4">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {safeIssues.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    (showSelection ? 1 : 0) +
                    5 +
                    (showReporterDetails ? 2 : 0) +
                    (showEvidencePreview ? 1 : 0) +
                    (hasActions ? 1 : 0)
                  }
                  className="px-5 py-16 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {safeIssues.map((issue, index) => (
              <tr
                key={issue._id || `${issue.title || "issue"}-${issue.createdAt || index}-${index}`}
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
                {showReporterDetails ? (
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">
                      {issue.reportedBy?.name || "Unknown citizen"}
                    </p>
                  </td>
                ) : null}
                {showReporterDetails ? (
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600">
                      {issue.reportedBy?.phoneNumber || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{issue.reportedBy?.email || "-"}</p>
                  </td>
                ) : null}
                {showEvidencePreview ? (
                  <td className="px-5 py-4">
                    {issue.imageUrl ? (
                      <a
                        href={issue.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-xl border border-blue-100 bg-slate-50 p-1"
                      >
                        <img
                          src={issue.imageUrl}
                          alt={`Evidence for ${issue.title}`}
                          className="h-16 w-20 rounded-md object-contain transition group-hover:scale-[1.02]"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </td>
                ) : null}
                <td className="px-5 py-4 capitalize">{issue.category}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={issue.status} />
                  {issue.aiVerification?.status ? (
                    <p
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${AI_STATUS_STYLES[issue.aiVerification.status] || AI_STATUS_STYLES["needs-review"]}`}
                    >
                      AI {issue.aiVerification.status}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4">{issue.assignedDepartment}</td>
                <td className="px-5 py-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {formatDateTime(issue.createdAt)}
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
