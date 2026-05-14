import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: "",
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "garbage",
        "road",
        "electricity",
        "water",
        "drainage",
        "streetlight",
        "sanitation",
        "other",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    assignedDepartment: {
      type: String,
      default: "Unassigned",
    },
    routingSource: {
      type: String,
      enum: ["manual", "auto"],
      default: "auto",
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    priorityLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    aiVerification: {
      status: {
        type: String,
        enum: ["verified", "suspicious", "needs-review", "unavailable"],
        default: "needs-review",
      },
      confidence: {
        type: Number,
        default: 0,
      },
      matchesCategory: {
        type: Boolean,
        default: null,
      },
      detectedContext: {
        type: String,
        default: "",
      },
      summary: {
        type: String,
        default: "",
      },
      reasons: {
        type: [String],
        default: [],
      },
      checkedAt: {
        type: Date,
        default: null,
      },
      model: {
        type: String,
        default: "",
      },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statusTimeline: [
      {
        status: {
          type: String,
          enum: ["pending", "in-progress", "resolved", "rejected"],
        },
        note: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ createdAt: -1, status: 1, category: 1 });
issueSchema.index({ priorityLevel: 1, assignedDepartment: 1, createdAt: -1 });

export const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);
