"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Layers3, ShieldCheck } from "lucide-react";

import { AnalyticsPanel } from "@/components/analytics-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { IssueEditorModal } from "@/components/issue-editor-modal";
import { IssueTable } from "@/components/issue-table";
import { MapPanel } from "@/components/map-panel";
import { SectionCard } from "@/components/section-card";
import { adminApi, issueApi } from "@/lib/api";
import { clearSession, getStoredSession } from "@/lib/auth";
import {
  issueCategories,
  issueStatuses,
  priorityLevels,
} from "@/lib/constants";

const initialFilters = {
  from: "",
  to: "",
  status: "",
  category: "",
  priorityLevel: "",
  department: "",
};
const initialStats = {
  totalIssues: 0,
  pendingIssues: 0,
  inProgressIssues: 0,
  resolvedIssues: 0,
  rejectedIssues: 0,
  stalePendingIssues: 0,
  averageFirstResponseHours: 0,
  averageResolutionHours: 0,
  priorityCounts: { low: 0, medium: 0, high: 0, critical: 0 },
  trendByCategory: {},
};
const LIVE_SYNC_INTERVAL_MS = 5000;
const AUTH_ERROR_PATTERNS = [
  "Unauthorized",
  "Forbidden",
  "Invalid or expired token",
  "User not found",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [filters, setFilters] = useState(initialFilters);
  const [bulkStatus, setBulkStatus] = useState("resolved");
  const [bulkDepartment, setBulkDepartment] = useState("Urban Services");
  const [selectedIds, setSelectedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [activeIssue, setActiveIssue] = useState(null);
  const [isSavingIssue, setIsSavingIssue] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);

  const redirectToAdminLogin = useCallback(() => {
    clearSession();
    setSession(null);
    setIsAuthorized(false);
    setAuthChecked(true);
    router.replace("/login?next=/admin&role=admin");
  }, [router]);

  const isAuthError = (message = "") =>
    AUTH_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  const scopedDepartment = session?.user?.department || "Urban Services";

  const topCategory = useMemo(
    () =>
      Object.entries(stats.trendByCategory || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A",
    [stats.trendByCategory]
  );

  const upsertIssue = useCallback((updatedIssue) => {
    setIssues((currentIssues) => {
      const existing = currentIssues.find((issue) => issue._id === updatedIssue._id);
      if (!existing) {
        return [updatedIssue, ...currentIssues];
      }

      return currentIssues.map((issue) =>
        issue._id === updatedIssue._id ? updatedIssue : issue
      );
    });
  }, []);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession?.token || storedSession?.user?.role !== "admin") {
      redirectToAdminLogin();
      return;
    }

    const sessionDepartment = storedSession.user?.department || "Urban Services";
    setSession(storedSession);
    setIsAuthorized(true);
    setAuthChecked(true);
    setBulkDepartment(sessionDepartment);
    setFilters((currentFilters) => ({
      ...currentFilters,
      department: sessionDepartment,
    }));
  }, [redirectToAdminLogin]);

  useEffect(() => {
    if (!isAuthorized || !session?.token) {
      return;
    }

    let pollTimer;

    const loadAdminData = async ({ silent = false } = {}) => {
      try {
        const [liveStats, liveIssues] = await Promise.all([
          adminApi.getStats(session.token),
          adminApi.filter({ token: session.token, filters: initialFilters }),
        ]);

        setStats(liveStats);
        setIssues(liveIssues);
        if (!silent) {
          setNotice("");
        }
      } catch (error) {
        if (isAuthError(error.message || "")) {
          redirectToAdminLogin();
          return;
        }
        if (!silent) {
          setNotice(error.message || "Unable to load admin dashboard data.");
        }
      }
    };

    loadAdminData();

    pollTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadAdminData({ silent: true });
      }
    }, LIVE_SYNC_INTERVAL_MS);

    return () => {
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, [isAuthorized, scopedDepartment, session?.token, upsertIssue]);

  const runFilter = async () => {
    if (!session?.token || session.user?.role !== "admin") {
      redirectToAdminLogin();
      return;
    }

    try {
      const filteredIssues = await adminApi.filter({
        token: session.token,
        filters,
      });

      setIssues(filteredIssues);
      setSelectedIds([]);
      setNotice("");
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToAdminLogin();
        return;
      }
      setNotice(error.message);
    }
  };

  const handleToggleSelect = (issueId) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(issueId)
        ? currentIds.filter((currentId) => currentId !== issueId)
        : [...currentIds, issueId]
    );
  };

  const handleToggleAll = () => {
    setSelectedIds((currentIds) =>
      currentIds.length === issues.length ? [] : issues.map((issue) => issue._id)
    );
  };

  const handleBulkUpdate = async () => {
    if (!session?.token || session.user?.role !== "admin") {
      redirectToAdminLogin();
      return;
    }

    if (selectedIds.length === 0) {
      setNotice("Select at least one issue for bulk update.");
      return;
    }

    try {
      await adminApi.bulkUpdate({
        token: session.token,
        payload: {
          issueIds: selectedIds,
          status: bulkStatus,
          assignedDepartment: bulkDepartment,
          statusNote: "Bulk update from admin control center",
        },
      });

      const [liveStats, liveIssues] = await Promise.all([
        adminApi.getStats(session.token),
        adminApi.filter({ token: session.token, filters }),
      ]);

      setStats(liveStats);
      setIssues(liveIssues);
      setSelectedIds([]);
      setNotice("Bulk update completed.");
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToAdminLogin();
        return;
      }
      setNotice(error.message);
    }
  };

  const handleSaveIssue = async (issue, payload) => {
    if (!session?.token || session.user?.role !== "admin") {
      redirectToAdminLogin();
      return;
    }

    setIsSavingIssue(true);

    try {
      const updatedIssue = await issueApi.update({
        token: session.token,
        issueId: issue._id,
        payload,
      });

      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) =>
          currentIssue._id === updatedIssue._id ? updatedIssue : currentIssue
        )
      );
      setActiveIssue(updatedIssue);
      setNotice("Issue updated successfully.");
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToAdminLogin();
        return;
      }
      setNotice(error.message);
    } finally {
      setIsSavingIssue(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!session?.token || session.user?.role !== "admin") {
      redirectToAdminLogin();
      return;
    }

    setIsDeletingIssue(true);

    try {
      await issueApi.delete({
        token: session.token,
        issueId: issue._id,
      });

      const [liveStats, liveIssues] = await Promise.all([
        adminApi.getStats(session.token),
        adminApi.filter({ token: session.token, filters }),
      ]);

      setStats(liveStats);
      setIssues(liveIssues);
      setActiveIssue(null);
      setSelectedIds((currentIds) => currentIds.filter((id) => id !== issue._id));
      setNotice("Issue deleted successfully.");
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToAdminLogin();
        return;
      }
      setNotice(error.message);
    } finally {
      setIsDeletingIssue(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-16 text-sm font-semibold text-slate-600">
        Verifying admin authentication...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardShell
      eyebrow="Admin Control"
      title="Triage queue, assign departments, and clear stale backlog."
      description="Municipal operators can filter the queue by date, category, and status, then apply bulk actions for aged issues. The interface is designed for daily oversight and fast operational handoffs."
      actions={
        <div className="rounded-full border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700">
          Admin: {session?.user?.name} ({scopedDepartment})
        </div>
      }
    >
      {notice ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/90 px-5 py-4 text-sm text-blue-900">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Total", value: stats.totalIssues, icon: Layers3 },
          { label: "Pending", value: stats.pendingIssues, icon: Clock3 },
          { label: "In Progress", value: stats.inProgressIssues, icon: ShieldCheck },
          { label: "Resolved", value: stats.resolvedIssues, icon: CheckCircle2 },
          { label: "Rejected", value: stats.rejectedIssues || 0, icon: ShieldCheck },
          { label: "15+ Day Pending", value: stats.stalePendingIssues, icon: Clock3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <SectionCard key={card.label} className="bg-white/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
                    {card.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lagoon text-white">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Filter queue
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Date, category, and status filters
            </h3>
          </div>
          <button
            type="button"
            onClick={runFilter}
            className="rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">From</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  from: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">To</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  to: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  status: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All statuses</option>
              {issueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All categories</option>
              {issueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Priority</span>
            <select
              value={filters.priorityLevel}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  priorityLevel: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All priorities</option>
              {priorityLevels.map((priorityLevel) => (
                <option key={priorityLevel} value={priorityLevel}>
                  {priorityLevel}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Department</span>
            <select
              value={filters.department}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  department: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              disabled
            >
              <option value={scopedDepartment}>{scopedDepartment}</option>
            </select>
          </label>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="bg-white/80">
          <p className="text-sm text-slate-500">Avg first response</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {stats.averageFirstResponseHours ?? 0}h
          </p>
        </SectionCard>
        <SectionCard className="bg-white/80">
          <p className="text-sm text-slate-500">Avg resolution</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {stats.averageResolutionHours ?? 0}h
          </p>
        </SectionCard>
        <SectionCard className="bg-white/80">
          <p className="text-sm text-slate-500">High priority</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {(stats.priorityCounts?.high || 0) + (stats.priorityCounts?.critical || 0)}
          </p>
        </SectionCard>
        <SectionCard className="bg-white/80">
          <p className="text-sm text-slate-500">Top category volume</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-ink">{topCategory}</p>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Bulk action center
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Resolve or reroute multiple issues at once
            </h3>
          </div>
          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
            Selected: {selectedIds.length}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Status</span>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              {issueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Department</span>
            <select
              value={bulkDepartment}
              onChange={(event) => setBulkDepartment(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              disabled
            >
              <option value={scopedDepartment}>{scopedDepartment}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleBulkUpdate}
            className="self-end rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-blue-700"
          >
            Apply Bulk Update
          </button>
        </div>
      </SectionCard>

      <IssueTable
        issues={issues}
        showSelection
        showReporterDetails
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAll}
        renderActions={(issue) => (
          <button
            type="button"
            onClick={() => setActiveIssue(issue)}
            className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-50"
          >
            Manage
          </button>
        )}
        emptyMessage="No issues match the current admin filters."
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <MapPanel issues={issues} />
        <AnalyticsPanel issues={issues} />
      </div>

      {activeIssue ? (
        <IssueEditorModal
          issue={activeIssue}
          isAdmin
          onClose={() => setActiveIssue(null)}
          onSave={handleSaveIssue}
          onDelete={handleDeleteIssue}
          isSaving={isSavingIssue}
          isDeleting={isDeletingIssue}
        />
      ) : null}
    </DashboardShell>
  );
}
