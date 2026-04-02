import { SectionCard } from "@/components/section-card";

export function AnalyticsPanel({ issues }) {
  const categoryCounts = issues.reduce((accumulator, issue) => {
    accumulator[issue.category] = (accumulator[issue.category] || 0) + 1;
    return accumulator;
  }, {});

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <SectionCard>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Analytics
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Category load overview
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(categoryCounts).map(([category, count]) => (
          <div key={category}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-slate-700">{category}</span>
              <span className="text-slate-500">{count} issues</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lagoon to-accent"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

