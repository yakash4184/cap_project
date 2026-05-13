import { SectionCard } from "@/components/section-card";

export function AnalyticsPanel({ issues }) {
  const categoryCounts = issues.reduce((accumulator, issue) => {
    accumulator[issue.category] = (accumulator[issue.category] || 0) + 1;
    return accumulator;
  }, {});
  const departmentCounts = issues.reduce((accumulator, issue) => {
    const department = issue.assignedDepartment || "Unassigned";
    accumulator[department] = (accumulator[department] || 0) + 1;
    return accumulator;
  }, {});
  const priorityCounts = issues.reduce((accumulator, issue) => {
    const priority = issue.priorityLevel || "medium";
    accumulator[priority] = (accumulator[priority] || 0) + 1;
    return accumulator;
  }, {});

  const maxCount = Math.max(...Object.values(categoryCounts), 1);
  const maxDepartmentCount = Math.max(...Object.values(departmentCounts), 1);

  return (
    <SectionCard>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
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
                className="h-full rounded-full bg-gradient-to-r from-accent to-lagoon"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Department workload
        </h4>
        <div className="mt-4 space-y-4">
          {Object.entries(departmentCounts).map(([department, count]) => (
            <div key={department}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{department}</span>
                <span className="text-slate-500">{count} issues</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lagoon to-ink"
                  style={{ width: `${(count / maxDepartmentCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Priority mix
        </h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(priorityCounts).map(([priority, count]) => (
            <div
              key={priority}
              className="rounded-xl border border-blue-100 bg-white/90 p-4 text-sm"
            >
              <p className="font-semibold capitalize text-ink">{priority}</p>
              <p className="mt-1 text-slate-500">{count} issues</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
