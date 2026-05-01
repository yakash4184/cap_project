import streamifier from "streamifier";

import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadIssueImage = async (file, { fallbackUrl = "" } = {}) => {
  if (!file) {
    return fallbackUrl || "";
  }

  if (!isCloudinaryConfigured) {
    if (fallbackUrl) {
      return fallbackUrl;
    }

    throw new ApiError(
      400,
      "Image file uploads are unavailable because Cloudinary is not configured. Please provide an image URL or configure Cloudinary."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "civic-issues",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
