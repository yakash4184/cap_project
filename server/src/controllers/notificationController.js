import mongoose from "mongoose";

import { Notification } from "../models/Notification.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("issue", "title status category")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

