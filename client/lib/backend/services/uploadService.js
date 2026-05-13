import streamifier from "streamifier";

import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

export const uploadIssueImage = async (file, { fallbackUrl = "" } = {}) => {
  if (!file) {
    return fallbackUrl || "";
  }

  if (!isCloudinaryConfigured) {
    if (file.buffer?.length) {
      const mimeType = file.mimetype || "image/jpeg";
      const encodedFile = file.buffer.toString("base64");
      return `data:${mimeType};base64,${encodedFile}`;
    }

    return fallbackUrl;
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
