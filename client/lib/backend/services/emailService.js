import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured.");
    }

    console.info(`[email:console] to=${to} subject="${subject}"`);
    console.info(text);
    return {
      delivered: false,
      mode: "console",
    };
  }

  await activeTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return {
    delivered: true,
    mode: "smtp",
  };
};

export const sendOtpEmail = async ({ to, otp, expiresInMinutes }) => {
  const subject = "Your Civic Desk OTP";
  const text = [
    "Your one-time login code is:",
    otp,
    "",
    `This OTP expires in ${expiresInMinutes} minutes.`,
    "If you did not request this, please ignore this email.",
  ].join("\n");

  const html = `
    <p>Your one-time login code is:</p>
    <p style="font-size:24px;font-weight:700;letter-spacing:3px;">${otp}</p>
    <p>This OTP expires in <strong>${expiresInMinutes} minutes</strong>.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return sendEmail({ to, subject, text, html });
};

export const sendComplaintRegisteredEmail = async ({
  to,
  citizenName,
  complaintId,
  complaintTitle,
  submittedAt,
}) => {
  const submittedAtText = new Date(submittedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = "Complaint Registered Successfully";
  const text = [
    `Hello ${citizenName || "Citizen"},`,
    "",
    "Complaint Registered Successfully.",
    `Complaint ID: ${complaintId}`,
    `Complaint Title: ${complaintTitle}`,
    `Submission Date & Time: ${submittedAtText}`,
    "Current Status: Pending",
  ].join("\n");

  const html = `
    <p>Hello ${citizenName || "Citizen"},</p>
    <p><strong>Complaint Registered Successfully.</strong></p>
    <p><strong>Complaint ID:</strong> ${complaintId}</p>
    <p><strong>Complaint Title:</strong> ${complaintTitle}</p>
    <p><strong>Submission Date & Time:</strong> ${submittedAtText}</p>
    <p><strong>Current Status:</strong> Pending</p>
  `;

  return sendEmail({ to, subject, text, html });
};

export const sendComplaintResolvedEmail = async ({
  to,
  citizenName,
  complaintId,
  complaintTitle,
  resolvedAt,
}) => {
  const resolvedAtText = new Date(resolvedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = "Your complaint has been resolved";
  const text = [
    `Hello ${citizenName || "Citizen"},`,
    "",
    "Your complaint has been resolved.",
    `Complaint ID: ${complaintId}`,
    `Complaint Title: ${complaintTitle}`,
    "Updated Status: Resolved",
    `Resolution Date & Time: ${resolvedAtText}`,
  ].join("\n");

  const html = `
    <p>Hello ${citizenName || "Citizen"},</p>
    <p><strong>Your complaint has been resolved.</strong></p>
    <p><strong>Complaint ID:</strong> ${complaintId}</p>
    <p><strong>Complaint Title:</strong> ${complaintTitle}</p>
    <p><strong>Updated Status:</strong> Resolved</p>
    <p><strong>Resolution Date & Time:</strong> ${resolvedAtText}</p>
  `;

  return sendEmail({ to, subject, text, html });
};
