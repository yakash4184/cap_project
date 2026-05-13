"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCcw, TriangleAlert, XCircle } from "lucide-react";
import { io } from "socket.io-client";

import { CitizenProfileForm } from "@/components/citizen-profile-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { IssueEditorModal } from "@/components/issue-editor-modal";
import { IssueReportForm } from "@/components/issue-report-form";
import { IssueTable } from "@/components/issue-table";
import { MapPanel } from "@/components/map-panel";
import { NotificationPanel } from "@/components/notification-panel";
import { SectionCard } from "@/components/section-card";
import { apiBaseUrl, authApi, issueApi, notificationApi } from "@/lib/api";
import { clearSession, getStoredSession, storeSession } from "@/lib/auth";

const LIVE_SYNC_INTERVAL_MS = 15000;
const filterOptions = ["all", "pending", "in-progress", "resolved", "rejected"];
const AUTH_ERROR_PATTERNS = [
  "Unauthorized",
  "Forbidden",
  "Invalid or expired token",
  "User not found",
];

function buildStats(issues) {
  return {
    total: issues.length,
    pending: issues.filter((issue) => issue.status === "pending").length,
    inProgress: issues.filter((issue) => issue.status === "in-progress").length,
    resolved: issues.filter((issue) => issue.status === "resolved").length,
    rejected: issues.filter((issue) => issue.status === "rejected").length,
  };
}

export default function CitizenIssuesPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);
  const [isSavingIssue, setIsSavingIssue] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isAuthError = (message = "") =>
    AUTH_ERROR_PATTERNS.some((pattern) => message.includes(pattern));

  const redirectToCitizenLogin = useCallback(() => {
    clearSession();
    setSession(null);
    setIsAuthorized(false);
    setAuthChecked(true);
    router.replace("/login?next=/issues");
  }, [router]);

  const persistSessionUser = (updatedUser) => {
    setSession((currentSession) => {
      if (!currentSession?.token) {
        return currentSession;
      }

      const currentUser = currentSession.user || {};
      const isUnchanged =
        currentUser.id === updatedUser?.id &&
        currentUser.name === updatedUser?.name &&
        currentUser.email === updatedUser?.email &&
        currentUser.role === updatedUser?.role &&
        currentUser.phoneNumber === updatedUser?.phoneNumber &&
        currentUser.address === updatedUser?.address &&
        currentUser.city === updatedUser?.city &&
        currentUser.state === updatedUser?.state &&
        currentUser.postalCode === updatedUser?.postalCode &&
        currentUser.profileCompleted === updatedUser?.profileCompleted;

      if (isUnchanged) {
        return currentSession;
      }

      return {
        ...currentSession,
        user: updatedUser,
      };
    });
  };

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    storeSession(session);
  }, [session]);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession?.token || storedSession?.user?.role !== "user") {
      redirectToCitizenLogin();
      return;
    }

    setSession(storedSession);
    setIsAuthorized(true);
    setAuthChecked(true);
  }, [redirectToCitizenLogin]);

  useEffect(() => {
    if (!isAuthorized || !session?.token) {
      return;
    }

    let pollTimer;
    const socketRoot = apiBaseUrl.replace(/\/api$/, "");
    const socket = io(socketRoot, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    const loadLiveData = async ({ silent = false } = {}) => {
      try {
        const [meData, issueData, notificationData] = await Promise.all([
          authApi.getMe(session.token),
          issueApi.getAll({ token: session.token }),
          notificationApi.getAll(session.token),
        ]);

        persistSessionUser(meData.user);
        setIssues(issueData);
        setNotifications(notificationData);

        if (!silent) {
          setNotice(
            meData.user.profileCompleted
              ? ""
              : "Complete your citizen profile before complaint submission."
          );
        }
      } catch (error) {
        if (isAuthError(error.message || "")) {
          redirectToCitizenLogin();
          return;
        }

        if (!silent) {
          setNotice(error.message || "Unable to load citizen dashboard data.");
        }
      }
    };

    loadLiveData();

    socket.on("connect", () => {
      socket.emit("join:user", session.user?.id);
    });

    socket.on("issue:updated", (updatedIssue) => {
      const reporterId =
        updatedIssue?.reportedBy?._id ||
        updatedIssue?.reportedBy?.id ||
        updatedIssue?.reportedBy;

      if (reporterId && reporterId !== session.user?.id) {
        return;
      }

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

    pollTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadLiveData({ silent: true });
      }
    }, LIVE_SYNC_INTERVAL_MS);

    return () => {
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
      socket.close();
    };
  }, [isAuthorized, session?.token]);

  const handleSaveProfile = async (profilePayload) => {
    if (!session?.token) {
      redirectToCitizenLogin();
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await authApi.updateCitizenProfile({
        token: session.token,
        payload: profilePayload,
      });

      persistSessionUser(response.user);
      setNotice("Citizen profile saved successfully.");
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToCitizenLogin();
        return;
      }
      setNotice(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateIssue = async (formData) => {
    if (!session?.token) {
      redirectToCitizenLogin();
      return false;
    }

    if (!session.user?.profileCompleted) {
      setNotice("Complete citizen profile before submitting complaint.");
      return false;
    }

    setIsSubmitting(true);

    try {
      const createdIssue = await issueApi.create({
        token: session.token,
        formData,
      });

      setIssues((currentIssues) => [createdIssue, ...currentIssues]);
      setNotice("Complaint submitted successfully.");
      return true;
    } catch (error) {
      if (isAuthError(error.message || "")) {
        redirectToCitizenLogin();
        return false;
      }
      setNotice(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIssue = async (issue, payload) => {
    if (!session?.token) {
      redirectToCitizenLogin();
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
        redirectToCitizenLogin();
        return;
      }
      setNotice(error.message);
    } finally {
      setIsSavingIssue(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!session?.token) {
      redirectToCitizenLogin();
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
      if (isAuthError(error.message || "")) {
        redirectToCitizenLogin();
        return;
      }
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
      if (isAuthError(error.message || "")) {
        redirectToCitizenLogin();
        return;
      }
      setNotice(error.message);
    }
  };

  if (!authChecked) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-16 text-sm font-semibold text-slate-600">
        Verifying citizen authentication...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const visibleIssues =
    filter === "all" ? issues : issues.filter((issue) => issue.status === filter);
  const stats = buildStats(issues);

  return (
    <DashboardShell
      eyebrow="Citizen Desk"
      title="Submit, monitor, and follow every civic complaint."
      description="Secure OTP login keeps complaint reporting private. Every update appears live on the citizen and admin dashboards."
      actions={
        <div className="rounded-full border border-white/70 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700">
          Citizen: {session?.user?.name}
        </div>
      }
    >
      {notice ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/90 px-5 py-4 text-sm text-blue-900">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total issues", value: stats.total, icon: RefreshCcw },
          { label: "Pending", value: stats.pending, icon: Clock3 },
          { label: "In progress", value: stats.inProgress, icon: TriangleAlert },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2 },
          { label: "Rejected", value: stats.rejected, icon: XCircle },
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

      <CitizenProfileForm
        profile={session?.user}
        email={session?.user?.email}
        onSubmit={handleSaveProfile}
        isSaving={isSavingProfile}
      />

      {session?.user?.profileCompleted ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <IssueReportForm onSubmit={handleCreateIssue} isSubmitting={isSubmitting} />
          <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} />
        </div>
      ) : (
        <SectionCard>
          <p className="text-sm font-medium text-slate-700">
            Complaint form is locked until required profile details are completed.
          </p>
        </SectionCard>
      )}

      <SectionCard>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tracking board
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              My reported complaints
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
          emptyMessage="No matching citizen complaints found."
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
