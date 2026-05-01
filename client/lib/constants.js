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

export const issueStatuses = ["pending", "in-progress", "resolved"];
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
  medium: "bg-sky-100 text-sky-800",
  high: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-700",
};

export const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  "in-progress": "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
};
