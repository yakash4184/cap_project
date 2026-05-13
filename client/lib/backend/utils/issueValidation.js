import { ApiError } from "./ApiError.js";
import {
  validateDepartment,
  validateIssueCategory,
  validateIssueStatus,
} from "./issueRules.js";

export const parseIssueCoordinates = (lat, lng) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    throw new ApiError(400, "Latitude and longitude must be valid numbers.");
  }

  return {
    lat: parsedLat,
    lng: parsedLng,
  };
};

export const validateCreateIssuePayload = ({
  title,
  description,
  category,
  assignedDepartment,
}) => {
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required.");
  }

  validateIssueCategory(category);

  if (assignedDepartment) {
    validateDepartment(assignedDepartment);
  }
};

export const validateUpdateIssuePayload = ({ category, status, assignedDepartment }) => {
  if (category !== undefined) {
    validateIssueCategory(category);
  }

  if (status !== undefined) {
    validateIssueStatus(status);
  }

  if (assignedDepartment !== undefined) {
    validateDepartment(assignedDepartment);
  }
};
