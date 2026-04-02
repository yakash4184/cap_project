import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Files,
  MapPinned,
  Workflow,
} from "lucide-react";

import { HeroMetrics } from "@/components/hero-metrics";
import { SectionCard } from "@/components/section-card";

const featureCards = [
  {
    title: "Citizen-first reporting",
    description:
      "Capture image, title, category, and live geolocation in a single reporting flow.",
    icon: MapPinned,
  },
  {
    title: "Operational admin control",
    description:
      "Filter by date, category, and status, then bulk-update issue resolution progress.",
    icon: Workflow,
  },
  {
    title: "Realtime visibility",
    description:
      "Socket.IO events and notification hooks keep stakeholders synced with status changes.",
    icon: BellRing,
  },
  {
    title: "Traceable workflows",
    description:
      "Status timeline, department assignment, and stale issue automation reduce backlog drift.",
    icon: Files,
  },
];

const workflowSteps = [
  "Citizen reports issue with image, GPS coordinates, and description.",
  "Municipal admin filters the queue and assigns the correct department.",
  "Status changes trigger notifications and optional realtime socket updates.",
  "Issues older than 15 days can be bulk-resolved or auto-resolved by cron.",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 grid-fade opacity-60" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <div className="relative">
            <div className="glass-panel relative rounded-[36px] p-8 sm:p-10 lg:p-12">
              <div className="mb-8 inline-flex rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold uppercase tracking-[0.26em] text-lagoon">
                Municipal operations, redesigned
              </div>
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Report civic issues, map them instantly, and move them to resolution.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Civic Lens is a full-stack issue reporting system built for modern urban
                operations. Citizens submit problems with evidence and location. Admin
                teams triage, assign, bulk-update, and track resolution in a live control
                center.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
                >
                  Launch Platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-lagoon hover:text-lagoon"
                >
                  View Admin UI
                </Link>
              </div>

              <div className="pointer-events-none absolute -right-14 -top-10 hidden h-44 w-44 rounded-full bg-accent/20 blur-3xl lg:block" />
              <div className="pointer-events-none absolute -bottom-14 left-10 hidden h-40 w-40 rounded-full bg-lagoon/20 blur-3xl lg:block" />
            </div>
          </div>

          <div className="grid gap-4">
            <HeroMetrics />
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard className="bg-white/82">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Why this system works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              Built for field reporting and municipal response at the same time
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-[24px] border border-slate-200 bg-white/80 p-5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-semibold tracking-tight text-ink">
                      {feature.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard className="bg-gradient-to-br from-ink to-slate-900 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Four-step civic resolution loop
            </h2>
            <div className="mt-8 space-y-4">
              {workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/80">{step}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-20">
        <SectionCard className="overflow-hidden bg-gradient-to-r from-sand/90 via-white/85 to-mist/90">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Deployment-ready stack
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                Next.js frontend, Express API, MongoDB persistence, Cloudinary uploads.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                The included structure is ready for Vercel, Render or Railway, and MongoDB
                Atlas. JWT auth, map integration, notification hooks, and cron-based stale
                resolution are already wired into the codebase.
              </p>
            </div>
            <div className="rounded-[28px] bg-white/90 p-6 shadow-glow">
              <div className="flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 text-lagoon" />
                Citizen + Admin roles
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 text-lagoon" />
                Bulk status updates
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 text-lagoon" />
                Geo-mapped issue tracking
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}

