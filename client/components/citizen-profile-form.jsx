"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { SectionCard } from "@/components/section-card";

const REQUIRED_MARK = <span className="ml-1 text-red-600">*</span>;

export function CitizenProfileForm({
  profile,
  onSubmit,
  isSaving = false,
  email = "",
}) {
  const [formState, setFormState] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    setFormState({
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
      email: profile?.email || email || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      postalCode: profile?.postalCode || "",
    });
  }, [profile, email]);

  const updateField = (key, value) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit?.(formState);
  };

  return (
    <SectionCard className="bg-white/90">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Citizen Profile
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Complete your basic information
        </h3>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Full Name
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Enter full name"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Phone Number
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="10-15 digit mobile number"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Email Address
            {REQUIRED_MARK}
          </span>
          <input
            required
            type="email"
            value={formState.email}
            disabled
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Address
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="House no, area, landmark"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            City
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="City"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-600">
            State
            {REQUIRED_MARK}
          </span>
          <input
            required
            value={formState.state}
            onChange={(event) => updateField("state", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="State"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Postal Code
          </span>
          <input
            value={formState.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Postal / ZIP code"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Citizen Profile
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
