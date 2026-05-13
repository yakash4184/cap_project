import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

