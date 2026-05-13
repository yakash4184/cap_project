import crypto from "node:crypto";

import { OtpChallenge } from "../models/OtpChallenge.js";
import { ApiError } from "../utils/ApiError.js";
import { sendOtpEmail } from "./emailService.js";

const OTP_LENGTH = 6;

const getOtpConfig = () => ({
  expiresInMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60),
  maxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5),
});

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const createOtpHash = ({ email, otp }) => {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
};

const generateOtpCode = () =>
  String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");

export const requestEmailOtp = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new ApiError(400, "Email is required.");
  }

  const config = getOtpConfig();
  const now = Date.now();
  const existingChallenge = await OtpChallenge.findOne({ email: normalizedEmail });

  if (existingChallenge?.lastSentAt) {
    const elapsedSeconds = Math.floor((now - existingChallenge.lastSentAt.getTime()) / 1000);
    if (elapsedSeconds < config.resendCooldownSeconds) {
      const retryAfter = config.resendCooldownSeconds - elapsedSeconds;
      throw new ApiError(
        429,
        `Please wait ${retryAfter} seconds before requesting another OTP.`
      );
    }
  }

  const otp = generateOtpCode();
  const expiresAt = new Date(now + config.expiresInMinutes * 60 * 1000);
  const otpHash = createOtpHash({ email: normalizedEmail, otp });

  await OtpChallenge.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      otpHash,
      expiresAt,
      lastSentAt: new Date(now),
      attemptCount: 0,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const delivery = await sendOtpEmail({
    to: normalizedEmail,
    otp,
    expiresInMinutes: config.expiresInMinutes,
  });

  const response = {
    message:
      delivery.mode === "smtp"
        ? "OTP sent successfully."
        : "SMTP is not configured. OTP generated in local development mode.",
    expiresInMinutes: config.expiresInMinutes,
    resendCooldownSeconds: config.resendCooldownSeconds,
    deliveryMode: delivery.mode,
    emailDeliveryConfigured: delivery.mode === "smtp",
  };

  const canExposeOtpInResponse =
    process.env.NODE_ENV !== "production" &&
    (process.env.OTP_DEBUG_EXPOSE === "true" || delivery.mode === "console");

  if (canExposeOtpInResponse) {
    response.debugOtp = otp;
  }

  return response;
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();

  if (!normalizedEmail || !normalizedOtp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const config = getOtpConfig();
  const challenge = await OtpChallenge.findOne({ email: normalizedEmail });

  if (!challenge) {
    throw new ApiError(400, "No active OTP found. Please request a new OTP.");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await challenge.deleteOne();
    throw new ApiError(400, "OTP expired. Please request a new OTP.");
  }

  if (challenge.attemptCount >= config.maxVerifyAttempts) {
    await challenge.deleteOne();
    throw new ApiError(429, "Too many invalid OTP attempts. Request a new OTP.");
  }

  const hash = createOtpHash({
    email: normalizedEmail,
    otp: normalizedOtp,
  });

  if (hash !== challenge.otpHash) {
    challenge.attemptCount += 1;
    await challenge.save();

    const remainingAttempts = Math.max(
      config.maxVerifyAttempts - challenge.attemptCount,
      0
    );

    throw new ApiError(
      401,
      remainingAttempts > 0
        ? `Invalid OTP. ${remainingAttempts} attempt(s) left.`
        : "Too many invalid OTP attempts. Request a new OTP."
    );
  }

  await challenge.deleteOne();
  return true;
};
