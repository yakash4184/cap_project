import { Issue } from "../models/Issue.js";
import { createNotification } from "./notificationService.js";
import { emitIssueUpdated } from "./socketService.js";

export const resolveStaleIssues = async () => {
  const thresholdDays = Number(process.env.AUTO_RESOLVE_DAYS || 15);
  const thresholdDate = new Date(
    Date.now() - thresholdDays * 24 * 60 * 60 * 1000
  );

  const staleIssues = await Issue.find({
    status: "pending",
    createdAt: { $lte: thresholdDate },
  }).populate("reportedBy", "name email");

  for (const issue of staleIssues) {
    issue.status = "resolved";
    issue.statusTimeline.push({
      status: "resolved",
      note: `Auto-resolved after ${thresholdDays} days pending`,
    });
    await issue.save();

    await createNotification({
      userId: issue.reportedBy._id,
      issueId: issue._id,
      message: `Issue "${issue.title}" was auto-resolved after ${thresholdDays} days.`,
    });

    emitIssueUpdated(issue);
  }

  return {
    resolvedCount: staleIssues.length,
    thresholdDays,
  };
};
