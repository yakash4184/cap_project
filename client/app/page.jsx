import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  Files,
  Handshake,
  Landmark,
  MapPinned,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { HeroMetrics } from "@/components/hero-metrics";
import { SectionCard } from "@/components/section-card";

const featureCards = [
  {
    title: "Citizen-first reporting",
    description:
      "Capture image evidence, issue details, and geolocation in one guided submission.",
    icon: MapPinned,
  },
  {
    title: "Administrative command center",
    description:
      "Filter by date, category, and status, then apply bulk resolution and routing actions.",
    icon: Workflow,
  },
  {
    title: "Realtime visibility",
    description:
      "Live notifications and updates keep citizens and operations teams in sync.",
    icon: BellRing,
  },
  {
    title: "Audit-ready workflows",
    description:
      "Status trails, department assignments, and stale-issue automation reduce backlog drift.",
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
        <div className="absolute inset-0 grid-fade opacity-55" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:px-8 lg:py-16">
          <div className="relative">
            <div className="glass-panel relative rounded-3xl p-6 sm:p-8 lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-lagoon sm:text-sm">
                <Landmark className="h-4 w-4" />
                Public Service Dashboard
              </div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                Smart civic issue reporting for citizens and municipal teams.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Raise complaints with location and evidence, route cases to the right
                departments, and monitor every stage from intake to resolution in one
                secure platform.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700"
                >
                  Launch Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-lagoon hover:text-lagoon"
                >
                  View Admin UI
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-100 bg-white/85 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-lagoon" />
                    Verified action trail
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Track who updated what, and when, across every reported issue.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white/85 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Handshake className="h-4 w-4 text-lagoon" />
                    Citizen transparency
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Keep residents informed with status notifications and clear timelines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start">
            <HeroMetrics />
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard className="bg-white/82">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Capabilities
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Built for city operations, field teams, and resident access
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-base font-semibold tracking-tight text-ink">
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

          <SectionCard className="bg-gradient-to-br from-[#123668] via-[#11488b] to-[#0f5fc6] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Four-step civic resolution cycle
            </h2>
            <div className="mt-6 space-y-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-xl border border-white/15 bg-white/10 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-sm font-semibold">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/90">{step}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-20">
        <SectionCard className="overflow-hidden bg-gradient-to-r from-blue-50 via-white to-mist/90">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Deployment Ready
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Built to run as a modern public service platform.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Next.js frontend, Express API, MongoDB persistence, JWT authentication,
                and map-enabled reporting workflows are already integrated for deployment.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-glow">
              <div className="flex items-center gap-3 text-sm font-semibold text-ink">
                <Building2 className="h-5 w-5 text-lagoon" />
                Government-style service dashboard
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 text-lagoon" />
                Citizen and admin role access
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 text-lagoon" />
                Geo-mapped complaint tracking
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
