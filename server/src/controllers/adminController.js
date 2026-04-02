import { Issue } from "../models/Issue.js";
import { createNotification } from "../services/notificationService.js";
import { emitIssueUpdated } from "../services/socketService.js";

const buildAdminQuery = ({ date, from, to, status, category }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (date || from || to) {
    query.createdAt = {};
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$gte = start;
      query.createdAt.$lte = end;
    }
    if (from) {
      query.createdAt.$gte = new Date(from);
    }
    if (to) {
      query.createdAt.$lte = new Date(to);
    }
  }

  return query;
};

export const filterIssues = async (req, res, next) => {
  try {
    const query = buildAdminQuery(req.query);
    const issues = await Issue.find(query)
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const staleThresholdDays = Number(process.env.AUTO_RESOLVE_DAYS || 15);
    const [totalIssues, pendingIssues, inProgressIssues, resolvedIssues, stalePendingIssues] =
      await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: "pending" }),
        Issue.countDocuments({ status: "in-progress" }),
        Issue.countDocuments({ status: "resolved" }),
        Issue.countDocuments({
          status: "pending",
          createdAt: {
            $lte: new Date(Date.now() - staleThresholdDays * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    res.json({
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      stalePendingIssues,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateIssues = async (req, res, next) => {
  try {
    const { issueIds, status, assignedDepartment, statusNote } = req.body;

    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ message: "issueIds array is required" });
    }

    const issues = await Issue.find({ _id: { $in: issueIds } }).populate(
      "reportedBy",
      "name email role"
    );

    for (const issue of issues) {
      const previousStatus = issue.status;

      if (status) {
        issue.status = status;
      }

      if (assignedDepartment) {
        issue.assignedDepartment = assignedDepartment;
      }

      if (status && previousStatus !== status) {
        issue.statusTimeline.push({
          status,
          note: statusNote || `Bulk update to ${status}`,
        });
      }

      await issue.save();

      if (status && previousStatus !== status) {
        await createNotification({
          userId: issue.reportedBy._id,
          issueId: issue._id,
          message: `Issue "${issue.title}" updated to ${status} by admin.`,
        });
      }

      emitIssueUpdated(issue);
    }

    res.json({
      message: "Issues updated successfully",
      updatedCount: issues.length,
    });
  } catch (error) {
    next(error);
  }
};
