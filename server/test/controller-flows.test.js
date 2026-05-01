import test from "node:test";
import assert from "node:assert/strict";

import { registerAdmin, registerUser } from "../src/controllers/authController.js";
import { bulkUpdateIssues, getAdminStats } from "../src/controllers/adminController.js";
import { createIssue, updateIssue } from "../src/controllers/issueController.js";
import {
  getNotifications,
  markNotificationRead,
} from "../src/controllers/notificationController.js";
import { User } from "../src/models/User.js";
import { Issue } from "../src/models/Issue.js";
import { Notification } from "../src/models/Notification.js";
function createMockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function withPatchedMethods(patches, run) {
  const restorers = patches.map(({ target, key, value }) => {
    const original = target[key];
    target[key] = value;
    return () => {
      target[key] = original;
    };
  });

  return Promise.resolve()
    .then(run)
    .finally(() => restorers.reverse().forEach((restore) => restore()));
}

test("registerUser always creates citizen accounts", async () => {
  process.env.JWT_SECRET = "test-secret";

  const createdUsers = [];
  const req = {
    body: {
      name: "Citizen One",
      email: "citizen@example.com",
      password: "secret123",
      role: "user",
    },
  };
  const res = createMockRes();

  await withPatchedMethods(
    [
      {
        target: User,
        key: "findOne",
        value: async () => null,
      },
      {
        target: User,
        key: "create",
        value: async (payload) => {
          createdUsers.push(payload);
          return {
            _id: "user-1",
            ...payload,
          };
        },
      },
    ],
    () => registerUser(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdUsers[0].role, "user");
  assert.equal(res.body.user.role, "user");
});

test("registerAdmin requires secure secret and creates admin", async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.ADMIN_REGISTRATION_SECRET = "admin-secret";

  const req = {
    body: {
      name: "Admin One",
      email: "admin@example.com",
      password: "secret123",
      adminRegistrationSecret: "admin-secret",
    },
    headers: {},
  };
  const res = createMockRes();

  await withPatchedMethods(
    [
      {
        target: User,
        key: "findOne",
        value: async () => null,
      },
      {
        target: User,
        key: "create",
        value: async (payload) => ({
          _id: "admin-1",
          ...payload,
        }),
      },
    ],
    () => registerAdmin(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.user.role, "admin");
});

test("createIssue auto-routes department and assigns priority", async () => {
  const req = {
    body: {
      title: "Broken streetlight near school gate",
      description: "Urgent and unsafe dark road for students at night.",
      category: "streetlight",
      lat: "28.61",
      lng: "77.20",
      address: "School Gate Market Road",
      imageUrl: "https://example.com/light.jpg",
    },
    file: null,
    user: {
      _id: "user-1",
    },
  };
  const res = createMockRes();

  const createdPayloads = [];

  await withPatchedMethods(
    [
      {
        target: Issue,
        key: "create",
        value: async (payload) => {
          createdPayloads.push(payload);
          return { _id: "issue-1" };
        },
      },
      {
        target: Issue,
        key: "findById",
        value: () => ({
          populate: async () => ({
            _id: "issue-1",
            title: req.body.title,
            assignedDepartment: createdPayloads[0].assignedDepartment,
            priorityLevel: createdPayloads[0].priorityLevel,
          }),
        }),
      },
    ],
    () => createIssue(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayloads[0].assignedDepartment, "Electricity Board");
  assert.equal(createdPayloads[0].routingSource, "auto");
  assert.ok(["high", "critical"].includes(createdPayloads[0].priorityLevel));
});

test("updateIssue rejects invalid status values", async () => {
  const req = {
    params: { id: "507f1f77bcf86cd799439011" },
    body: { status: "done" },
    user: { _id: "user-1", role: "admin" },
  };
  const res = createMockRes();
  let nextError = null;

  await withPatchedMethods(
    [
      {
        target: Issue,
        key: "findById",
        value: async () => ({
          reportedBy: "user-1",
          status: "pending",
        }),
      },
    ],
    () =>
      updateIssue(req, res, (error) => {
        nextError = error;
      })
  );

  assert.ok(nextError);
  assert.match(nextError.message, /Invalid issue status/);
});

test("bulkUpdateIssues validates department and status", async () => {
  const req = {
    body: {
      issueIds: ["issue-1"],
      status: "closed",
      assignedDepartment: "Unknown Team",
    },
  };
  const res = createMockRes();
  let nextError = null;

  await bulkUpdateIssues(req, res, (error) => {
    nextError = error;
  });

  assert.ok(nextError);
  assert.match(nextError.message, /Invalid issue status/);
});

test("getAdminStats returns advanced analytics fields", async () => {
  const req = {};
  const res = createMockRes();

  await withPatchedMethods(
    [
      {
        target: Issue,
        key: "countDocuments",
        value: async (query = {}) => {
          if (!query.status) return 4;
          if (query.status === "pending" && query.createdAt) return 1;
          if (query.status === "pending") return 2;
          if (query.status === "in-progress") return 1;
          if (query.status === "resolved") return 1;
          return 0;
        },
      },
      {
        target: Issue,
        key: "find",
        value: () => ({
          select: async () => [
            {
              category: "road",
              status: "pending",
              assignedDepartment: "Road Works",
              priorityLevel: "high",
              createdAt: "2026-04-01T00:00:00.000Z",
              updatedAt: "2026-04-02T00:00:00.000Z",
              statusTimeline: [],
            },
            {
              category: "streetlight",
              status: "resolved",
              assignedDepartment: "Electricity Board",
              priorityLevel: "critical",
              createdAt: "2026-04-01T00:00:00.000Z",
              updatedAt: "2026-04-03T00:00:00.000Z",
              statusTimeline: [
                {
                  status: "in-progress",
                  changedAt: "2026-04-01T12:00:00.000Z",
                },
              ],
            },
          ],
        }),
      },
    ],
    () => getAdminStats(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(Object.keys(res.body.priorityCounts), [
    "low",
    "medium",
    "high",
    "critical",
  ]);
  assert.ok("averageFirstResponseHours" in res.body);
  assert.ok("averageResolutionHours" in res.body);
  assert.ok("departmentPerformance" in res.body);
});

test("getNotifications returns latest notifications for current user", async () => {
  const req = {
    user: { _id: "user-1" },
  };
  const res = createMockRes();

  await withPatchedMethods(
    [
      {
        target: Notification,
        key: "find",
        value: () => ({
          populate() {
            return this;
          },
          sort() {
            return this;
          },
          limit: async () => [{ _id: "note-1" }],
        }),
      },
    ],
    () => getNotifications(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.length, 1);
});

test("markNotificationRead updates notification ownership safely", async () => {
  const req = {
    params: { id: "507f1f77bcf86cd799439011" },
    user: { _id: "user-1" },
  };
  const res = createMockRes();

  await withPatchedMethods(
    [
      {
        target: Notification,
        key: "findOne",
        value: async () => ({
          _id: "note-1",
          read: false,
          async save() {
            this.read = true;
          },
        }),
      },
    ],
    () => markNotificationRead(req, res, (error) => {
      throw error;
    })
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.read, true);
});
