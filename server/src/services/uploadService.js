import streamifier from "streamifier";

import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

export const uploadIssueImage = async (file) => {
  if (!file) {
    return "";
  }

  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Provide imageUrl in development or configure Cloudinary."
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

