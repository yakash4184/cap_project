import { Router } from "express";

import { loginUser, registerAdmin, registerUser } from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);

export default router;
