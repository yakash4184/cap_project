import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  registerAdmin,
  registerUser,
  requestCitizenOtp,
  updateCitizenProfile,
  verifyCitizenOtpLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);
router.post("/request-otp", requestCitizenOtp);
router.post("/verify-otp", verifyCitizenOtpLogin);
router.get("/me", protect, getCurrentUser);
router.put("/citizen-profile", protect, updateCitizenProfile);

export default router;
