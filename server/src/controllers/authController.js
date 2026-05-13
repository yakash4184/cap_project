import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import {
  assertAdminRegistrationAuthorized,
  assertPublicRegistrationAllowed,
} from "../utils/adminRegistration.js";
import { ApiError } from "../utils/ApiError.js";
import { validateAssignableDepartment } from "../utils/issueRules.js";
import { requestEmailOtp, verifyEmailOtp } from "../services/otpService.js";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const buildCitizenPlaceholderName = (email = "") => {
  const localPart = normalizeEmail(email).split("@")[0] || "citizen";
  const safe = localPart.replace(/[^a-z0-9]/gi, " ").trim();
  if (!safe) {
    return "Citizen";
  }
  return safe
    .split(/\s+/)
    .slice(0, 3)
    .map((chunk) => `${chunk[0].toUpperCase()}${chunk.slice(1).toLowerCase()}`)
    .join(" ");
};

const getAdminDepartment = (user) =>
  user?.role === "admin" ? user.department?.trim() || "Urban Services" : "";

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: getAdminDepartment(user),
  phoneNumber: user.phoneNumber || "",
  address: user.address || "",
  city: user.city || "",
  state: user.state || "",
  postalCode: user.postalCode || "",
  profileCompleted: user.isCitizenProfileComplete?.() || false,
});

export const registerUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    assertPublicRegistrationAllowed(role);

    return res.status(410).json({
      message:
        "Citizen password signup is disabled. Please use Email OTP login to continue.",
    });
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, department, adminRegistrationSecret } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        message: "Name, email, password, and department are required",
      });
    }

    const normalizedDepartment = String(department).trim();
    validateAssignableDepartment(normalizedDepartment);

    assertAdminRegistrationAuthorized({
      configuredSecret: process.env.ADMIN_REGISTRATION_SECRET,
      providedSecret:
        req.headers["x-admin-registration-secret"] || adminRegistrationSecret || "",
    });

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "admin",
      department: normalizedDepartment,
      authProvider: "password",
      emailVerifiedAt: new Date(),
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Citizen login uses Email OTP only.",
      });
    }

    if (!user.department) {
      user.department = "Urban Services";
      await user.save();
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const requestCitizenOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser?.role === "admin") {
      return res.status(403).json({
        message: "This email belongs to an admin account. Use admin login.",
      });
    }

    const result = await requestEmailOtp({
      email: normalizedEmail,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyCitizenOtpLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    await verifyEmailOtp({ email: normalizedEmail, otp });

    let user = await User.findOne({ email: normalizedEmail });

    if (user?.role === "admin") {
      throw new ApiError(403, "Admin account cannot use citizen OTP login.");
    }

    if (!user) {
      user = await User.create({
        name: buildCitizenPlaceholderName(normalizedEmail),
        email: normalizedEmail,
        role: "user",
        authProvider: "otp",
        emailVerifiedAt: new Date(),
      });
    } else {
      user.emailVerifiedAt = new Date();
      if (!user.authProvider) {
        user.authProvider = "otp";
      }
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    user: serializeUser(req.user),
  });
};

export const updateCitizenProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only citizen profiles can be updated." });
    }

    const { name, phoneNumber, address, city, state, postalCode } = req.body;

    if (!name || !phoneNumber || !address || !city || !state) {
      return res.status(400).json({
        message: "Name, phone number, address, city, and state are required.",
      });
    }

    if (!/^[0-9]{10,15}$/.test(String(phoneNumber).replace(/\s+/g, ""))) {
      return res.status(400).json({
        message: "Phone number must be 10 to 15 digits.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = String(name).trim();
    user.phoneNumber = String(phoneNumber).trim();
    user.address = String(address).trim();
    user.city = String(city).trim();
    user.state = String(state).trim();
    user.postalCode = String(postalCode || "").trim();
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    user.authProvider = "otp";
    await user.save();

    res.status(200).json({
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};
