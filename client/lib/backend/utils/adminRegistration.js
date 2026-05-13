import { ApiError } from "./ApiError.js";

export const assertPublicRegistrationAllowed = (requestedRole) => {
  if (requestedRole === "admin") {
    throw new ApiError(
      403,
      "Public registration cannot create admin accounts. Use the secure admin registration flow."
    );
  }
};

export const assertAdminRegistrationAuthorized = ({
  configuredSecret,
  providedSecret,
}) => {
  if (!configuredSecret) {
    throw new ApiError(
      503,
      "Secure admin registration is not configured on this environment."
    );
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    throw new ApiError(403, "Invalid admin registration secret.");
  }
};
