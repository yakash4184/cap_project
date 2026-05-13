import { Activity, Clock3, MapPinned, ShieldAlert } from "lucide-react";

const cards = [
  {
    title: "24/7 Citizen Reporting",
    value: "Realtime intake flow",
    icon: MapPinned,
  },
  {
    title: "15-Day Escalation Logic",
    value: "Priority escalation controls",
    icon: Clock3,
  },
  {
    title: "Department Routing",
    value: "Faster departmental response",
    icon: ShieldAlert,
  },
  {
    title: "Analytics Snapshot",
    value: "Live operational dashboard",
    icon: Activity,
  },
];

export function HeroMetrics() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="surface-panel rounded-2xl border border-blue-100/90 p-4"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lagoon">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-600">{card.title}</p>
            <p className="mt-2 text-base font-semibold leading-6 tracking-tight text-ink">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
