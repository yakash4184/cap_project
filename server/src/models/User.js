import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { assignableDepartments } from "../utils/issueRules.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required() {
        return this.role === "admin" || this.authProvider === "password";
      },
      minlength: 6,
    },
    authProvider: {
      type: String,
      enum: ["password", "otp"],
      default: "otp",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    department: {
      type: String,
      enum: [...assignableDepartments, ""],
      default: "",
      required() {
        return this.role === "admin";
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password") || !this.password) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isCitizenProfileComplete = function isCitizenProfileComplete() {
  if (this.role !== "user") {
    return true;
  }

  return Boolean(
    this.name?.trim() &&
      this.phoneNumber?.trim() &&
      this.email?.trim() &&
      this.address?.trim() &&
      this.city?.trim() &&
      this.state?.trim()
  );
};

export const User = mongoose.model("User", userSchema);
