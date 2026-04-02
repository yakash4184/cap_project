"use client";

import { useState } from "react";
import { Crosshair, ImagePlus, LoaderCircle } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { departments, issueCategories } from "@/lib/constants";

const initialFormState = {
  title: "",
  description: "",
  category: "garbage",
  assignedDepartment: "Sanitation",
  address: "",
  lat: "",
  lng: "",
  imageUrl: "",
};

export function IssueReportForm({ onSubmit, isSubmitting }) {
  const [formState, setFormState] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);

  const updateField = (key, value) => {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      updateField("lat", String(position.coords.latitude));
      updateField("lng", String(position.coords.longitude));
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();

    Object.entries(formState).forEach(([key, value]) => {
      payload.append(key, value);
    });

    if (imageFile) {
      payload.append("image", imageFile);
    }

    const created = await onSubmit(payload);
    if (created) {
      setFormState(initialFormState);
      setImageFile(null);
    }
  };

  return (
    <SectionCard>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Report Issue
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Capture a civic problem in under one minute
          </h3>
        </div>
        <button
          type="button"
          onClick={handleUseLocation}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-lagoon hover:text-lagoon"
        >
          <Crosshair className="h-4 w-4" />
          Use GPS
        </button>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">Title</span>
          <input
            required
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-lagoon"
            placeholder="Broken streetlight near community gate"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
          <textarea
            required
            rows={4}
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="Explain the issue, urgency, and impact on residents."
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
          <select
            value={formState.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
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
            onChange={(event) => updateField("assignedDepartment", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">Address</span>
          <input
            value={formState.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="Sector 12, near water tank"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">Latitude</span>
          <input
            required
            value={formState.lat}
            onChange={(event) => updateField("lat", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="28.6139"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">Longitude</span>
          <input
            required
            value={formState.lng}
            onChange={(event) => updateField("lng", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="77.2090"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Upload image or paste URL
          </span>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={formState.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              placeholder="https://..."
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-lagoon hover:text-lagoon">
              <ImagePlus className="h-4 w-4" />
              Select file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          {imageFile ? (
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              Selected: {imageFile.name}
            </p>
          ) : null}
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Submit Issue
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

