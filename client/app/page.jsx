import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  FileText,
  Files,
  Handshake,
  Landmark,
  LogIn,
  MapPinned,
  ShieldCheck,
  UserPlus,
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

const citizenGuideSteps = [
  {
    title: "Create account",
    description: "Citizen Login पर जाएं, email OTP verify करें, और profile details भरें.",
    icon: UserPlus,
  },
  {
    title: "Login securely",
    description: "OTP verify होने के बाद ही Citizen Desk और complaint form open होगा.",
    icon: LogIn,
  },
  {
    title: "Fill complaint form",
    description:
      "Title, description, category, department, address और GPS location भरें.",
    icon: FileText,
  },
  {
    title: "Submit and track",
    description:
      "Submit के बाद issue admin dashboard पर live दिखेगा और status updates मिलेंगे.",
    icon: MapPinned,
  },
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
                  href="/login?next=/issues"
                  className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700"
                >
                  Launch Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login?next=/admin&role=admin"
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

          <SectionCard className="bg-white/92">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon">
              Quick Guide
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              New user के लिए simple complaint flow
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              नीचे दिए गए steps follow करके कोई भी citizen आसानी से complaint register
              कर सकता है.
            </p>

            <div className="mt-6">
              {citizenGuideSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === citizenGuideSteps.length - 1;
                return (
                  <div key={step.title}>
                    <div className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/45 p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                      <div className="flex items-center gap-2 sm:block">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-lagoon sm:mt-2">
                          0{index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                      </div>
                    </div>
                    {!isLast ? (
                      <div className="flex justify-center py-2 text-lagoon">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-600">
              Tip: "Use GPS" button से actual location auto-fill होगी, जिससे admin को
              exact complaint spot तुरंत समझ आता है.
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
                Next.js frontend and Route Handler backend, MongoDB persistence, JWT
                authentication, and map-enabled reporting workflows are already integrated
                for deployment.
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
