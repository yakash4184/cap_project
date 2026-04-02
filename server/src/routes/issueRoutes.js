import { Router } from "express";

import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
} from "../controllers/issueController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.post("/create", upload.single("image"), createIssue);
router.get("/all", getAllIssues);
router.get("/:id", getIssueById);
router.put("/update/:id", updateIssue);
router.delete("/:id", deleteIssue);

export default router;

