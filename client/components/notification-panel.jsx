"use client";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { timeAgo } from "@/lib/formatters";

export function NotificationPanel({ notifications, onMarkRead }) {
  return (
    <SectionCard>
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Notifications
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Recent citizen updates
        </h3>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            No notifications yet.
          </div>
        ) : null}
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="rounded-2xl border border-slate-200 bg-white/75 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-6 text-slate-700">
                {notification.message}
              </p>
              {notification.issue?.status ? (
                <StatusBadge status={notification.issue.status} />
              ) : null}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-400">
              {timeAgo(notification.createdAt)}
            </p>
            {!notification.read ? (
              <button
                type="button"
                onClick={() => onMarkRead?.(notification)}
                className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-lagoon"
              >
                Mark as read
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
