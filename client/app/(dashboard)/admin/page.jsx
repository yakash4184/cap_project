"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Layers3, ShieldCheck } from "lucide-react";

import { AnalyticsPanel } from "@/components/analytics-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { IssueEditorModal } from "@/components/issue-editor-modal";
import { IssueTable } from "@/components/issue-table";
import { MapPanel } from "@/components/map-panel";
import { SectionCard } from "@/components/section-card";
import { adminApi, issueApi } from "@/lib/api";
import { getStoredSession } from "@/lib/auth";
import { demoIssues, demoStats } from "@/lib/demo-data";
import {
  departments,
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
const LIVE_SYNC_INTERVAL_MS = 20000;

export default function AdminDashboardPage() {
  const [session, setSession] = useState(null);
  const [issues, setIssues] = useState(demoIssues);
  const [stats, setStats] = useState(demoStats);
  const [filters, setFilters] = useState(initialFilters);
  const [bulkStatus, setBulkStatus] = useState("resolved");
  const [bulkDepartment, setBulkDepartment] = useState("Urban Services");
  const [selectedIds, setSelectedIds] = useState([]);
  const [notice, setNotice] = useState(
    "Demo mode active. Admin JWT and backend are required for live queue management."
  );
  const [activeIssue, setActiveIssue] = useState(null);
  const [isSavingIssue, setIsSavingIssue] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();
    setSession(storedSession);

    if (!storedSession?.token || storedSession.user?.role !== "admin") {
      return;
    }

    let pollTimer;

    const loadAdminData = async ({ silent = false } = {}) => {
      try {
        const [liveStats, liveIssues] = await Promise.all([
          adminApi.getStats(storedSession.token),
          adminApi.filter({ token: storedSession.token, filters: initialFilters }),
        ]);

        setStats(liveStats);
        setIssues(liveIssues);
        setNotice("");
      } catch (error) {
        if (!silent) {
          setNotice(error.message || "Live admin data unavailable, showing demo queue.");
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
  }, []);

  const runFilter = async () => {
    if (!session?.token || session.user?.role !== "admin") {
      setNotice("Admin login required for server-side filtering. Demo queue remains visible.");
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
    if (selectedIds.length === 0) {
      setNotice("Select at least one issue for bulk update.");
      return;
    }

    if (!session?.token || session.user?.role !== "admin") {
      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          selectedIds.includes(issue._id)
            ? {
                ...issue,
                status: bulkStatus,
                assignedDepartment: bulkDepartment,
              }
            : issue
        )
      );
      setSelectedIds([]);
      setNotice("Demo queue updated locally.");
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
      setNotice(error.message);
    }
  };

  const handleSaveIssue = async (issue, payload) => {
    if (!session?.token || session.user?.role !== "admin") {
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) =>
          currentIssue._id === issue._id
            ? {
                ...currentIssue,
                ...payload,
                location: {
                  ...currentIssue.location,
                  lat: Number(payload.lat),
                  lng: Number(payload.lng),
                  address: payload.address,
                },
              }
            : currentIssue
        )
      );
      setActiveIssue(null);
      setNotice("Demo issue updated locally.");
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
      setNotice(error.message);
    } finally {
      setIsSavingIssue(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!session?.token || session.user?.role !== "admin") {
      setIssues((currentIssues) =>
        currentIssues.filter((currentIssue) => currentIssue._id !== issue._id)
      );
      setActiveIssue(null);
      setNotice("Demo issue deleted locally.");
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
      setNotice(error.message);
    } finally {
      setIsDeletingIssue(false);
    }
  };

  return (
    <DashboardShell
      eyebrow="Admin Control"
      title="Triage queue, assign departments, and clear stale backlog."
      description="Municipal operators can filter the queue by date, category, and status, then apply bulk actions for aged issues. The interface is designed for daily oversight and fast operational handoffs."
      actions={
        session?.user?.role === "admin" ? (
          <div className="rounded-full border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700">
            Admin: {session.user?.name}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-blue-700"
          >
            Login as admin
            <ArrowRight className="h-4 w-4" />
          </Link>
        )
      }
    >
      {notice ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/90 px-5 py-4 text-sm text-blue-900">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total", value: stats.totalIssues, icon: Layers3 },
          { label: "Pending", value: stats.pendingIssues, icon: Clock3 },
          { label: "In Progress", value: stats.inProgressIssues, icon: ShieldCheck },
          { label: "Resolved", value: stats.resolvedIssues, icon: CheckCircle2 },
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
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
          <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
            {Object.entries(stats.trendByCategory || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ||
              "N/A"}
          </p>
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
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
