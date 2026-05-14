import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  FileText,
  Files,
  LogIn,
  MapPinned,
  UserPlus,
  Workflow,
} from "lucide-react";

import { HeroImageSlider } from "@/components/hero-image-slider";
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

const heroSlides = [
  {
    src: "/hero-slides/slide-01.png",
    alt: "Civic Connect Portal parliament view slide",
    priority: true,
  },
  {
    src: "/hero-slides/slide-02.png",
    alt: "Civic Connect Portal city highway slide",
    priority: false,
  },
  {
    src: "/hero-slides/slide-03.png",
    alt: "Civic Connect Portal village development slide",
    priority: false,
  },
];

const heroRibbonCards = [
  {
    title: "Report Civic Issues",
    subtitle: "Fast complaint intake",
    icon: FileText,
  },
  {
    title: "Track and Follow",
    subtitle: "Live status visibility",
    icon: BellRing,
  },
  {
    title: "Get It Resolved",
    subtitle: "Department action flow",
    icon: CheckCircle2,
  },
  {
    title: "Better Communities",
    subtitle: "City and village coverage",
    icon: Workflow,
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-blue-100/80 bg-white/40">
        <div className="absolute inset-0 grid-fade opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-14">
          <div className="surface-panel flex items-center gap-3 rounded-2xl px-4 py-3 sm:gap-4 sm:px-5">
            <div className="flex h-14 w-12 items-center justify-center sm:h-16 sm:w-14">
              <Image
                src="/ashok-stambh.svg"
                alt="Ashok Stambh"
                width={56}
                height={88}
                className="h-full w-auto object-contain grayscale contrast-200"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
                Government Interface
              </p>
              <p className="truncate text-sm font-bold tracking-tight text-ink sm:text-base">
                Civic Connect Portal - Public Service Dashboard
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-glow">
            <div className="relative aspect-[1774/887] min-h-[340px] sm:min-h-[420px] lg:min-h-[560px]">
              <HeroImageSlider slides={heroSlides} intervalMs={2000} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />

              <div className="relative z-10 flex h-full items-end p-4 sm:p-6 lg:items-center lg:p-10">
                <div className="max-w-2xl rounded-2xl border border-white/25 bg-white/18 p-4 text-white backdrop-blur-md sm:p-6 lg:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100 sm:text-xs">
                    Citizen Governance Platform
                  </p>
                  <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    Smart civic issue reporting for citizens and municipal teams.
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-blue-50 sm:text-base sm:leading-7">
                    Raise complaints with exact location and evidence, then track every
                    update till resolution with secure citizen and admin workflows.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/login?next=/issues"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-blue-100"
                    >
                      Launch Portal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login?next=/admin&role=admin"
                      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      View Admin UI
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-blue-900/35 sm:grid-cols-2 lg:grid-cols-4">
              {heroRibbonCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="flex items-center gap-3 bg-blue-900 px-4 py-4 text-white sm:px-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight">{card.title}</p>
                      <p className="text-xs text-blue-100">{card.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
