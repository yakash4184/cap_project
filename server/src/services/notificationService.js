import { Notification } from "../models/Notification.js";
import { emitNotificationCreated } from "./socketService.js";

export const createNotification = async ({ userId, issueId, message }) => {
  const notification = await Notification.create({
    user: userId,
    issue: issueId,
    message,
  });

  emitNotificationCreated(notification);
  return notification;
};

