let ioInstance = null;

export const attachSocket = (io) => {
  ioInstance = io;
};

export const getSocket = () => ioInstance;

const extractReporterId = (issue) => {
  if (!issue?.reportedBy) {
    return null;
  }

  if (typeof issue.reportedBy === "string") {
    return issue.reportedBy;
  }

  return issue.reportedBy._id?.toString() || issue.reportedBy.id?.toString() || null;
};

export const emitIssueUpdated = (issue) => {
  if (!ioInstance) {
    return;
  }

  const reporterId = extractReporterId(issue);
  if (reporterId) {
    ioInstance.to(`user:${reporterId}`).emit("issue:updated", issue);
  }

  if (issue?.assignedDepartment) {
    ioInstance
      .to(`admin-department:${issue.assignedDepartment}`)
      .emit("issue:updated", issue);
  }
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
