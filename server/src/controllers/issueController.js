import mongoose from "mongoose";

import { Issue } from "../models/Issue.js";
import { createNotification } from "../services/notificationService.js";
import { emitIssueUpdated } from "../services/socketService.js";
import { uploadIssueImage } from "../services/uploadService.js";

const buildFilters = (query) => {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.from || query.to) {
    filters.createdAt = {};
    if (query.from) {
      filters.createdAt.$gte = new Date(query.from);
    }
    if (query.to) {
      filters.createdAt.$lte = new Date(query.to);
    }
  }

  return filters;
};

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, assignedDepartment, imageUrl, lat, lng, address } =
      req.body;

    if (
      !title ||
      !description ||
      !category ||
      lat === undefined ||
      lat === null ||
      lng === undefined ||
      lng === null
    ) {
      return res.status(400).json({
        message: "Title, description, category, latitude, and longitude are required",
      });
    }

    let uploadedImageUrl = imageUrl || "";

    if (req.file) {
      uploadedImageUrl = await uploadIssueImage(req.file);
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      assignedDepartment: assignedDepartment || "Unassigned",
      imageUrl: uploadedImageUrl,
      location: {
        lat: Number(lat),
        lng: Number(lng),
        address: address || "",
      },
      reportedBy: req.user._id,
      statusTimeline: [
        {
          status: "pending",
          note: "Issue reported by citizen",
        },
      ],
    });

    const populatedIssue = await Issue.findById(issue._id).populate(
      "reportedBy",
      "name email role"
    );

    emitIssueUpdated(populatedIssue);
    res.status(201).json(populatedIssue);
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);

    if (req.user.role === "user" && req.query.scope !== "all") {
      filters.reportedBy = req.user._id;
    }

    const issues = await Issue.find(filters)
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(id).populate("reportedBy", "name email role");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (
      req.user.role === "user" &&
      issue.reportedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const nextStatus = req.body.status || issue.status;
    const previousStatus = issue.status;

    if (req.body.title && (isAdmin || issue.status === "pending")) {
      issue.title = req.body.title;
    }

    if (req.body.description && (isAdmin || issue.status === "pending")) {
      issue.description = req.body.description;
    }

    if (req.body.category && (isAdmin || issue.status === "pending")) {
      issue.category = req.body.category;
    }

    if (req.body.assignedDepartment && isAdmin) {
      issue.assignedDepartment = req.body.assignedDepartment;
    }

    if (req.body.status && isAdmin) {
      issue.status = req.body.status;
    }

    if (
      req.body.lat !== undefined &&
      req.body.lat !== null &&
      req.body.lng !== undefined &&
      req.body.lng !== null &&
      (isAdmin || issue.status === "pending")
    ) {
      issue.location = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
        address: req.body.address || issue.location.address || "",
      };
    }

    if (req.body.imageUrl) {
      issue.imageUrl = req.body.imageUrl;
    }

    if (previousStatus !== nextStatus) {
      issue.statusTimeline.push({
        status: nextStatus,
        note: req.body.statusNote || `Status updated to ${nextStatus}`,
      });
    }

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id).populate(
      "reportedBy",
      "name email role"
    );

    if (previousStatus !== populatedIssue.status) {
      await createNotification({
        userId: populatedIssue.reportedBy._id,
        issueId: populatedIssue._id,
        message: `Your issue "${populatedIssue.title}" is now ${populatedIssue.status}.`,
      });
    }

    emitIssueUpdated(populatedIssue);
    res.json(populatedIssue);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    next(error);
  }
};
