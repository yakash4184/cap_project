import { Activity, Clock3, MapPinned, ShieldAlert } from "lucide-react";

const cards = [
  {
    title: "24/7 Citizen Reporting",
    value: "Realtime intake",
    icon: MapPinned,
  },
  {
    title: "15-Day Escalation Logic",
    value: "Admin bulk actions",
    icon: Clock3,
  },
  {
    title: "Department Routing",
    value: "Faster resolution",
    icon: ShieldAlert,
  },
  {
    title: "Analytics Snapshot",
    value: "Live operational view",
    icon: Activity,
  },
];

export function HeroMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="glass-panel rounded-[24px] border border-white/60 p-5"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

