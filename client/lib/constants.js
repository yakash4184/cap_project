export const issueCategories = [
  "garbage",
  "road",
  "electricity",
  "water",
  "drainage",
  "streetlight",
  "sanitation",
  "other",
];

export const issueStatuses = ["pending", "in-progress", "resolved", "rejected"];
export const priorityLevels = ["low", "medium", "high", "critical"];

export const departments = [
  "Sanitation",
  "Road Works",
  "Electricity Board",
  "Water Department",
  "Urban Services",
  "Zonal Response Team",
];

export const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-indigo-100 text-indigo-800",
  critical: "bg-red-100 text-red-700",
};

export const statusColors = {
  pending: "bg-blue-100 text-blue-800",
  "in-progress": "bg-indigo-100 text-indigo-800",
  resolved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};
