import jwt from "jsonwebtoken";

import { connectDatabase } from "../config/db.js";
import { Issue } from "../models/Issue.js";
import { User } from "../models/User.js";

const DEFAULT_MODEL = process.env.OPENAI_ASSISTANT_MODEL || "gpt-4o-mini";

const STATUS_LABELS = {
  pending: "Pending",
  "in-progress": "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_FILTERS = [
  { key: "pending", keywords: ["pending", "लंबित"] },
  { key: "in-progress", keywords: ["in progress", "in-progress", "progress", "चल रही"] },
  { key: "resolved", keywords: ["resolved", "resolve", "सुलझ", "हल"] },
  { key: "rejected", keywords: ["rejected", "reject", "अस्वीकार", "रिजेक्ट"] },
];

const isStatusIntent = (message) =>
  [
    "status",
    "complaint status",
    "issue status",
    "ticket",
    "track",
    "mera complaint",
    "meri complaint",
    "meri shikayat",
    "शिकायत",
    "स्टेटस",
    "कम्प्लेन",
    "कंप्लेन",
  ].some((keyword) => message.includes(keyword));

const isPortalIntent = (message) =>
  [
    "portal",
    "about",
    "kaise",
    "कैसे",
    "what is",
    "kya hai",
    "guide",
    "help",
    "feature",
    "dashboard",
  ].some((keyword) => message.includes(keyword));

const isComplaintIntent = (message) =>
  [
    "report",
    "register complaint",
    "submit complaint",
    "new complaint",
    "issue raise",
    "complaint form",
    "form",
    "complaint kaise",
    "शिकायत कैसे",
    "कंप्लेन कैसे",
    "कम्प्लेन कैसे",
  ].some((keyword) => message.includes(keyword));

const isGreetingIntent = (message) =>
  ["hi", "hello", "hey", "namaste", "नमस्ते", "hii", "hlo"].some((keyword) =>
    message.includes(keyword)
  );

const normalizeText = (text = "") => String(text).trim().toLowerCase();

const formatDateTime = (dateValue) =>
  new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const extractComplaintId = (message) => {
  const match = message.match(/\b[a-f0-9]{24}\b/i);
  return match ? match[0] : "";
};

const detectStatusFilter = (message) => {
  for (const item of STATUS_FILTERS) {
    if (item.keywords.some((keyword) => message.includes(keyword))) {
      return item.key;
    }
  }
  return "";
};

const getTokenFromHeader = (authorization = "") =>
  authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

const resolveSessionUser = async (authorization = "") => {
  const token = getTokenFromHeader(authorization);

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDatabase();
    const user = await User.findById(decoded.userId).select("name email role department");
    return user || null;
  } catch {
    return null;
  }
};

const buildGuestStatusReply = () =>
  [
    "For privacy and security, I cannot show complaint details without login.",
    "Path: Login -> Citizen Desk -> My Complaints.",
    "After login, I can show complaint ID, current status, and last update.",
  ].join(" ");

const buildAdminStatusReply = (department = "Urban Services") =>
  [
    `You are logged in as admin. Your department: ${department}.`,
    "Status path: Admin Control -> filters (status/category/date) -> issue table.",
    "Citizen private data is shown only inside authorized dashboard views.",
  ].join(" ");

const buildCitizenStatusReply = async (userId, message = "") => {
  await connectDatabase();

  const complaintId = extractComplaintId(message);
  const statusFilter = detectStatusFilter(message);

  if (complaintId) {
    const specificIssue = await Issue.findOne({
      _id: complaintId,
      reportedBy: userId,
    }).select("title status createdAt updatedAt assignedDepartment");

    if (!specificIssue) {
      return `Complaint ID ${complaintId} was not found in your account. Please recheck the ID and try again.`;
    }

    return [
      `Complaint ID: ${specificIssue._id.toString()}.`,
      `Complaint: ${specificIssue.title}.`,
      `Status: ${STATUS_LABELS[specificIssue.status] || specificIssue.status}.`,
      `Department: ${specificIssue.assignedDepartment}.`,
      `Submitted: ${formatDateTime(specificIssue.createdAt)}.`,
      `Last Update: ${formatDateTime(specificIssue.updatedAt)}.`,
    ].join(" ");
  }

  const baseQuery = { reportedBy: userId };
  const filteredQuery = statusFilter ? { ...baseQuery, status: statusFilter } : baseQuery;

  const [latestIssues, grouped, totalCount] = await Promise.all([
    Issue.find(filteredQuery)
      .sort({ createdAt: -1 })
      .limit(8)
      .select("title status createdAt updatedAt assignedDepartment"),
    Issue.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Issue.countDocuments(baseQuery),
  ]);

  if (!latestIssues.length) {
    if (statusFilter) {
      return `You currently have no complaints in ${STATUS_LABELS[statusFilter]} status.`;
    }
    return "You do not have any complaints yet. Open Citizen Desk to submit a new complaint.";
  }

  const counts = grouped.reduce(
    (acc, item) => {
      acc[item._id] = item.count;
      return acc;
    },
    { pending: 0, "in-progress": 0, resolved: 0, rejected: 0 }
  );

  const summary = `Total: ${totalCount} | Pending: ${counts.pending} | In Progress: ${counts["in-progress"]} | Resolved: ${counts.resolved} | Rejected: ${counts.rejected}.`;

  const issueRows = latestIssues
    .map((issue, index) => {
      const statusLabel = STATUS_LABELS[issue.status] || issue.status;
      return `${index + 1}) ID: ${issue._id.toString()} | ${issue.title} | ${statusLabel} | ${issue.assignedDepartment} | ${formatDateTime(issue.updatedAt)}`;
    })
    .join("\n");

  if (statusFilter) {
    return `Here are your ${STATUS_LABELS[statusFilter]} complaints.\n${summary}\n${issueRows}`;
  }

  return `Here is your latest complaint status summary.\n${summary}\n${issueRows}`;
};

const basicPortalReply = () =>
  [
    "This portal is built for citizens to report civic issues, attach GPS location, and track live status.",
    "Citizen flow: OTP login -> complete profile -> submit complaint -> track status.",
    "Admin flow: secure admin login -> department-wise issue management -> status updates.",
  ].join(" ");

const complaintFlowReply = () =>
  [
    "Open Citizen Desk to register a complaint.",
    "Steps: Login with OTP -> complete profile -> enter title, description, category, and location -> add image/link -> Submit.",
    "After submit, the complaint is routed live to the relevant admin dashboard.",
  ].join(" ");

const greetingReply = () =>
  "Hello! I am your Civic Connect assistant. You can ask about portal usage, complaint process, or complaint status.";

const buildFallbackReply = () =>
  "I am your portal guide assistant. Ask me about complaint registration, login flow, admin flow, or status tracking.";

const extractOutputText = (payload = {}) => {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks = [];

  for (const item of payload.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join(" ").trim();
};

const askOpenAI = async ({ message, history = [], user }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const conversation = history
    .slice(-6)
    .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.text}`)
    .join("\n");

  const userRole = user?.role || "guest";
  const systemPrompt = [
    "You are an English-speaking Civic Connect Portal assistant.",
    "Use clear, simple, polished English with a helpful Indian support style.",
    "Keep answers concise, practical, and security-safe.",
    "Never reveal private complaint data unless the user is authenticated.",
    `Current user role: ${userRole}.`,
    "If role is guest and user asks complaint status, provide only login pathway.",
    "When authenticated user asks status, include structured details and clear next steps.",
  ].join(" ");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }],
          },
          ...(conversation
            ? [
                {
                  role: "user",
                  content: [{ type: "input_text", text: `Recent context:\n${conversation}` }],
                },
              ]
            : []),
          {
            role: "user",
            content: [{ type: "input_text", text: message }],
          },
        ],
        temperature: 0.2,
        max_output_tokens: 220,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return extractOutputText(payload) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const generateAssistantReply = async ({
  message,
  history = [],
  authorization = "",
}) => {
  const normalized = normalizeText(message);
  const user = await resolveSessionUser(authorization);

  if (isStatusIntent(normalized)) {
    if (!user) {
      return {
        text: buildGuestStatusReply(),
        requiresLogin: true,
      };
    }

    if (user.role === "admin") {
      return {
        text: buildAdminStatusReply(user.department),
        requiresLogin: false,
      };
    }

    return {
      text: await buildCitizenStatusReply(user._id, normalized),
      requiresLogin: false,
    };
  }

  if (isGreetingIntent(normalized)) {
    return {
      text: greetingReply(),
      requiresLogin: false,
    };
  }

  if (isComplaintIntent(normalized)) {
    return {
      text: complaintFlowReply(),
      requiresLogin: false,
    };
  }

  if (isPortalIntent(normalized)) {
    return {
      text: basicPortalReply(),
      requiresLogin: false,
    };
  }

  const aiReply = await askOpenAI({ message, history, user });

  if (aiReply) {
    return {
      text: aiReply,
      requiresLogin: false,
    };
  }

  return {
    text: buildFallbackReply(),
    requiresLogin: false,
  };
};
