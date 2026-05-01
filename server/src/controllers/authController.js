import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import {
  assertAdminRegistrationAuthorized,
  assertPublicRegistrationAllowed,
} from "../utils/adminRegistration.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    assertPublicRegistrationAllowed(role);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminRegistrationSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    assertAdminRegistrationAuthorized({
      configuredSecret: process.env.ADMIN_REGISTRATION_SECRET,
      providedSecret:
        req.headers["x-admin-registration-secret"] || adminRegistrationSecret || "",
    });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
