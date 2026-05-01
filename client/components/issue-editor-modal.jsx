"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";

import { departments, issueCategories, issueStatuses } from "@/lib/constants";

export function IssueEditorModal({
  issue,
  isAdmin = false,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}) {
  const [formState, setFormState] = useState(null);

  useEffect(() => {
    if (!issue) {
      return;
    }

    setFormState({
      title: issue.title || "",
      description: issue.description || "",
      category: issue.category || "other",
      status: issue.status || "pending",
      assignedDepartment: issue.assignedDepartment || "Unassigned",
      address: issue.location?.address || "",
      lat: String(issue.location?.lat ?? ""),
      lng: String(issue.location?.lng ?? ""),
      imageUrl: issue.imageUrl || "",
    });
  }, [issue]);

  if (!issue || !formState) {
    return null;
  }

  const citizenCanEdit = issue.status === "pending";
  const canEditCoreFields = isAdmin || citizenCanEdit;
  const canEditStatus = isAdmin;
  const canDelete = true;

  const updateField = (key, value) => {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="surface-panel relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] p-7 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-slate-200 bg-white p-2 text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          {isAdmin ? "Issue Control" : "Issue Detail"}
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {isAdmin ? "Update or resolve issue" : "Track or edit your issue"}
        </h3>
        {!isAdmin && !citizenCanEdit ? (
          <p className="mt-3 text-sm text-slate-500">
            Citizens can edit issue details only while the status is pending.
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">Title</span>
            <input
              value={formState.title}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
            <textarea
              rows={4}
              value={formState.description}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("description", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
            <select
              value={formState.category}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("category", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            >
              {issueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Department</span>
            <select
              value={formState.assignedDepartment}
              disabled={!isAdmin}
              onChange={(event) => updateField("assignedDepartment", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
              <option value="Unassigned">Unassigned</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Priority</span>
            <input
              value={issue.priorityLevel || "medium"}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 capitalize text-slate-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Latitude</span>
            <input
              value={formState.lat}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("lat", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-600">Longitude</span>
            <input
              value={formState.lng}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("lng", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">Address</span>
            <input
              value={formState.address}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("address", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">Image URL</span>
            <input
              value={formState.imageUrl}
              disabled={!canEditCoreFields}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-600">Status</span>
            <select
              value={formState.status}
              disabled={!canEditStatus}
              onChange={(event) => updateField("status", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:bg-slate-50"
            >
              {issueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete?.(issue)}
            disabled={!canDelete || isDeleting}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
          >
            {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Issue
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onSave?.(issue, formState)}
              disabled={isSaving || (!isAdmin && !citizenCanEdit)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
