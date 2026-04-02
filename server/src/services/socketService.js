let ioInstance = null;

export const attachSocket = (io) => {
  ioInstance = io;
};

export const getSocket = () => ioInstance;

export const emitIssueUpdated = (issue) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.emit("issue:updated", issue);
};

export const emitNotificationCreated = (notification) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.to(`user:${notification.user.toString()}`).emit(
    "notification:new",
    notification
  );
};

