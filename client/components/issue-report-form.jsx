"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  ImagePlus,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { departments, issueCategories } from "@/lib/constants";

const REQUIRED_MARK = <span className="ml-1 text-red-600">*</span>;

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

const MAX_UPLOAD_DIMENSION = 1280;
const MAX_UPLOAD_BYTES = 850 * 1024;

const optimizeImageFile = async (file) => {
  if (!file || !file.type?.startsWith("image/") || file.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to read selected image"));
      element.src = objectUrl;
    });

    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const optimizedBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    if (!optimizedBlob) {
      return file;
    }

    const normalizedName = file.name.replace(/\.[^.]+$/, "") || "complaint-image";

    return new File([optimizedBlob], `${normalizedName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const AI_STATUS_META = {
  verified: {
    label: "Genuine evidence detected",
    tone: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    badge: "bg-emerald-600 text-white",
    icon: CheckCircle2,
  },
  suspicious: {
    label: "Suspicious / mismatched evidence",
    tone: "border-rose-200 bg-rose-50/75 text-rose-900",
    badge: "bg-rose-600 text-white",
    icon: AlertTriangle,
  },
  "needs-review": {
    label: "Needs review",
    tone: "border-amber-200 bg-amber-50/75 text-amber-900",
    badge: "bg-amber-600 text-white",
    icon: AlertTriangle,
  },
  unavailable: {
    label: "Quick AI unavailable",
    tone: "border-slate-200 bg-slate-50/80 text-slate-800",
    badge: "bg-slate-700 text-white",
    icon: AlertTriangle,
  },
};

export function IssueReportForm({ onSubmit, onVerifyImage, isSubmitting }) {
  const [formState, setFormState] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiVerification, setAiVerification] = useState(null);
  const [aiNotice, setAiNotice] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

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
      const optimizedFile = await optimizeImageFile(imageFile);
      payload.append("image", optimizedFile);
    }

    const created = await onSubmit(payload);
    if (created) {
      setFormState(initialFormState);
      setImageFile(null);
      setAiVerification(null);
      setAiNotice("");
    }
  };

  const handleVerifyImage = async () => {
    if (!onVerifyImage) {
      return;
    }

    if (!imageFile && !formState.imageUrl.trim()) {
      setAiVerification(null);
      setAiNotice("Upload image evidence or paste image URL before AI check.");
      return;
    }

    const payload = new FormData();
    payload.append("title", formState.title);
    payload.append("description", formState.description);
    payload.append("category", formState.category);
    payload.append("imageUrl", formState.imageUrl);

    if (imageFile) {
      const optimizedFile = await optimizeImageFile(imageFile);
      payload.append("image", optimizedFile);
    }

    setIsAnalyzing(true);
    setAiNotice("");

    try {
      const verification = await onVerifyImage(payload);
      setAiVerification(verification);
    } catch (error) {
      setAiVerification(null);
      setAiNotice(error.message || "AI verification failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAiMeta = AI_STATUS_META[aiVerification?.status] || AI_STATUS_META["needs-review"];
  const AiStatusIcon = currentAiMeta.icon;

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
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-lagoon hover:text-lagoon"
        >
          <Crosshair className="h-4 w-4" />
          Use GPS
        </button>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Complaint Title
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-lagoon"
            placeholder="Broken streetlight near community gate"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Complaint Description
            {REQUIRED_MARK}
          </span>
          <textarea
            required
            rows={4}
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="Explain the issue, urgency, and impact on residents."
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Complaint Category
            {REQUIRED_MARK}
          </span>
          <select
            required
            value={formState.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
          >
            {issueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Department
            {REQUIRED_MARK}
          </span>
          <select
            required
            value={formState.assignedDepartment}
            onChange={(event) => updateField("assignedDepartment", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
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
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="Sector 12, near water tank"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Latitude
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.lat}
            onChange={(event) => updateField("lat", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="28.6139"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Longitude
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.lng}
            onChange={(event) => updateField("lng", event.target.value)}
            className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
            placeholder="77.2090"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Upload image or paste URL
          </span>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={formState.imageUrl}
              onChange={(event) => {
                updateField("imageUrl", event.target.value);
                setAiVerification(null);
                setAiNotice("");
              }}
              className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-lagoon"
              placeholder="https://..."
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/55 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-lagoon hover:text-lagoon">
              <ImagePlus className="h-4 w-4" />
              Select file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] || null;
                  setImageFile(selectedFile);
                  setAiVerification(null);
                  setAiNotice("");
                }}
              />
            </label>
            <button
              type="button"
              disabled={isAnalyzing || (!imageFile && !formState.imageUrl.trim())}
              onClick={handleVerifyImage}
              className="ai-glow-border inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-lagoon hover:text-lagoon disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isAnalyzing ? "AI scanning..." : "AI check"}
            </button>
          </div>
          {imageFile ? (
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              Selected: {imageFile.name} ({Math.max(1, Math.round(imageFile.size / 1024))} KB)
            </p>
          ) : null}

          {previewUrl ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-blue-100 bg-slate-50 p-2">
              <img
                src={previewUrl}
                alt="Selected complaint preview"
                className="h-44 w-full rounded-xl object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}

          {aiNotice ? <p className="mt-2 text-xs font-semibold text-rose-600">{aiNotice}</p> : null}

          {aiVerification ? (
            <div
              className={`ai-glow-border mt-3 rounded-2xl border px-4 py-3 ${currentAiMeta.tone}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AiStatusIcon className="h-4 w-4" />
                  <p className="text-sm font-semibold">AI Evidence Validation</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${currentAiMeta.badge}`}
                >
                  {currentAiMeta.label}
                </span>
              </div>

              <p className="mt-2 text-sm">{aiVerification.summary || "AI analysis completed."}</p>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/75 px-2.5 py-1">
                  Confidence: {Math.max(0, Number(aiVerification.confidence || 0))}%
                </span>
                <span className="rounded-full bg-white/75 px-2.5 py-1">
                  Category match:{" "}
                  {typeof aiVerification.matchesCategory === "boolean"
                    ? aiVerification.matchesCategory
                      ? "Yes"
                      : "No"
                    : "Manual review"}
                </span>
              </div>

              {aiVerification.detectedContext ? (
                <p className="mt-2 text-xs text-slate-700">{aiVerification.detectedContext}</p>
              ) : null}

              {Array.isArray(aiVerification.reasons) && aiVerification.reasons.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
                  {aiVerification.reasons.slice(0, 3).map((reason, index) => (
                    <li key={`${reason}-${index}`}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Submit Issue
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
