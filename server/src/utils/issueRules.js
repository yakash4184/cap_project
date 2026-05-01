import { ApiError } from "./ApiError.js";

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

export const departments = [
  "Sanitation",
  "Road Works",
  "Electricity Board",
  "Water Department",
  "Urban Services",
  "Zonal Response Team",
  "Unassigned",
];

export const validateIssueCategory = (category) => {
  if (!issueCategories.includes(category)) {
    throw new ApiError(400, `Invalid issue category: ${category}`);
  }
};

export const validateIssueStatus = (status) => {
  if (!issueStatuses.includes(status)) {
    throw new ApiError(400, `Invalid issue status: ${status}`);
  }
};

export const validateDepartment = (department) => {
  if (!departments.includes(department)) {
    throw new ApiError(400, `Invalid department: ${department}`);
  }
};
