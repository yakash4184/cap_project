"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, RefreshCcw, TriangleAlert } from "lucide-react";
import { io } from "socket.io-client";

import { DashboardShell } from "@/components/dashboard-shell";
import { IssueEditorModal } from "@/components/issue-editor-modal";
import { IssueReportForm } from "@/components/issue-report-form";
import { IssueTable } from "@/components/issue-table";
import { MapPanel } from "@/components/map-panel";
import { NotificationPanel } from "@/components/notification-panel";
import { SectionCard } from "@/components/section-card";
import { apiBaseUrl, issueApi, notificationApi } from "@/lib/api";
import { demoIssues, demoNotifications } from "@/lib/demo-data";
import { getStoredSession } from "@/lib/auth";

function buildStats(issues) {
  return {
    total: issues.length,
    pending: issues.filter((issue) => issue.status === "pending").length,
    inProgress: issues.filter((issue) => issue.status === "in-progress").length,
    resolved: issues.filter((issue) => issue.status === "resolved").length,
  };
}

const filterOptions = ["all", "pending", "in-progress", "resolved"];
const LIVE_SYNC_INTERVAL_MS = 15000;

function isLocalRealtimeTarget(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

export default function CitizenIssuesPage() {
  const [session, setSession] = useState(null);
  const [issues, setIssues] = useState(demoIssues);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState(
    "Demo data loaded. Log in with backend configured to use live API data."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);
  const [isSavingIssue, setIsSavingIssue] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();
    setSession(storedSession);

    if (!storedSession?.token) {
      return;
    }

    let pollTimer;

    const loadLiveData = async ({ silent = false } = {}) => {
      try {
        const [issueData, notificationData] = await Promise.all([
          issueApi.getAll({ token: storedSession.token }),
          notificationApi.getAll(storedSession.token),
        ]);

        setIssues(issueData);
        setNotifications(notificationData);
        setNotice("");
      } catch (error) {
        if (!silent) {
          setNotice(error.message || "Live API unavailable, showing demo data.");
        }
      }
    };

    loadLiveData();

    pollTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadLiveData({ silent: true });
      }
    }, LIVE_SYNC_INTERVAL_MS);

    const socketRoot = apiBaseUrl.replace(/\/api$/, "");
    let socket;

    if (isLocalRealtimeTarget(socketRoot)) {
      socket = io(socketRoot, {
        autoConnect: true,
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        socket.emit("join:user", storedSession.user?.id);
      });

      socket.on("issue:updated", (updatedIssue) => {
        setIssues((currentIssues) => {
          const existing = currentIssues.find((issue) => issue._id === updatedIssue._id);
          if (!existing) {
            return [updatedIssue, ...currentIssues];
          }
          return currentIssues.map((issue) =>
            issue._id === updatedIssue._id ? updatedIssue : issue
          );
        });
      });

      socket.on("notification:new", (notification) => {
        setNotifications((currentNotifications) => [notification, ...currentNotifications]);
      });
    }

    return () => {
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
      socket?.close();
    };
  }, []);

  const handleCreateIssue = async (formData) => {
    if (!session?.token) {
      setNotice("Login required for live issue submission. Configure backend or use demo view.");
      return false;
    }

    setIsSubmitting(true);

    try {
      const createdIssue = await issueApi.create({
        token: session.token,
        formData,
      });

      setIssues((currentIssues) => [createdIssue, ...currentIssues]);
      setNotice("Issue submitted successfully.");
      return true;
    } catch (error) {
      setNotice(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIssue = async (issue, payload) => {
    if (!session?.token) {
      setNotice("Login required for live update.");
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
    if (!session?.token) {
      setNotice("Login required for delete.");
      return;
    }

    setIsDeletingIssue(true);

    try {
      await issueApi.delete({
        token: session.token,
        issueId: issue._id,
      });

      setIssues((currentIssues) =>
        currentIssues.filter((currentIssue) => currentIssue._id !== issue._id)
      );
      setActiveIssue(null);
      setNotice("Issue deleted successfully.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsDeletingIssue(false);
    }
  };

  const handleMarkRead = async (notification) => {
    if (!session?.token) {
      return;
    }

    try {
      await notificationApi.markRead({
        token: session.token,
        notificationId: notification._id,
      });

      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification._id === notification._id
            ? { ...currentNotification, read: true }
            : currentNotification
        )
      );
    } catch (error) {
      setNotice(error.message);
    }
  };

  const visibleIssues =
    filter === "all" ? issues : issues.filter((issue) => issue.status === filter);
  const stats = buildStats(issues);

  return (
    <DashboardShell
      eyebrow="Citizen Desk"
      title="Submit, monitor, and follow every civic issue."
      description="Residents can report problems with live coordinates, supporting evidence, and clear status tracking. Notifications update the reporting citizen when municipal action changes."
      actions={
        session?.token ? (
          <div className="rounded-full border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700">
            Signed in as {session.user?.name}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white shadow-glow hover:bg-blue-700"
          >
            Login for live access
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total issues", value: stats.total, icon: RefreshCcw },
          { label: "Pending", value: stats.pending, icon: Clock3 },
          { label: "In progress", value: stats.inProgress, icon: TriangleAlert },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <SectionCard key={card.label} className="bg-white/80">
              <div className="flex items-center justify-between">
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <IssueReportForm onSubmit={handleCreateIssue} isSubmitting={isSubmitting} />
        <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} />
      </div>

      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tracking board
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              My reported issues
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === option
                    ? "bg-lagoon text-white"
                    : "border border-blue-200 bg-white text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <IssueTable
          issues={visibleIssues}
          emptyMessage="No matching citizen issues found."
          renderActions={(issue) => (
            <button
              type="button"
              onClick={() => setActiveIssue(issue)}
              className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-50"
            >
              View / Edit
            </button>
          )}
        />
      </SectionCard>

      <MapPanel issues={visibleIssues.length ? visibleIssues : issues} />

      {activeIssue ? (
        <IssueEditorModal
          issue={activeIssue}
          onClose={() => setActiveIssue(null)}
          onSave={(issue, payload) => handleUpdateIssue(issue, payload)}
          onDelete={handleDeleteIssue}
          isSaving={isSavingIssue}
          isDeleting={isDeletingIssue}
        />
      ) : null}
    </DashboardShell>
  );
}
