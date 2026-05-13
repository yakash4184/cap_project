const categoryDepartmentMap = {
  garbage: "Sanitation",
  sanitation: "Sanitation",
  road: "Road Works",
  electricity: "Electricity Board",
  streetlight: "Electricity Board",
  water: "Water Department",
  drainage: "Urban Services",
  other: "Urban Services",
};

const criticalKeywords = ["fire", "accident", "collapsed", "electrocution", "injury"];
const highKeywords = ["urgent", "danger", "unsafe", "flood", "dark", "blocked"];
const mediumKeywords = ["leak", "overflow", "broken", "damaged", "missed", "risk"];

const categoryWeights = {
  road: 30,
  streetlight: 28,
  electricity: 30,
  drainage: 26,
  water: 24,
  garbage: 20,
  sanitation: 18,
  other: 12,
};

export const resolveDepartment = ({ category, address = "", assignedDepartment = "" }) => {
  if (assignedDepartment && assignedDepartment !== "Unassigned") {
    return {
      department: assignedDepartment,
      routingSource: "manual",
    };
  }

  const categoryDepartment = categoryDepartmentMap[category];

  if (categoryDepartment) {
    return {
      department: categoryDepartment,
      routingSource: "auto",
    };
  }

  const normalizedAddress = address.toLowerCase();

  if (normalizedAddress.includes("park") || normalizedAddress.includes("market")) {
    return {
      department: "Urban Services",
      routingSource: "auto",
    };
  }

  return {
    department: "Urban Services",
    routingSource: "auto",
  };
};

function countKeywordHits(text, keywords) {
  const normalized = text.toLowerCase();
  return keywords.reduce(
    (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
    0
  );
}

export const calculatePriority = ({ title = "", description = "", category = "other" }) => {
  const summary = `${title} ${description}`.trim();
  let score = categoryWeights[category] || 10;

  score += countKeywordHits(summary, mediumKeywords) * 8;
  score += countKeywordHits(summary, highKeywords) * 14;
  score += countKeywordHits(summary, criticalKeywords) * 22;

  const priorityLevel =
    score >= 70 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  return {
    priorityScore: score,
    priorityLevel,
  };
};
