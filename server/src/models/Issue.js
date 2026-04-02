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
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    assignedDepartment: {
      type: String,
      default: "Unassigned",
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
          enum: ["pending", "in-progress", "resolved"],
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

export const Issue = mongoose.model("Issue", issueSchema);

