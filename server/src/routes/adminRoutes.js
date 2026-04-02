import { Router } from "express";

import {
  bulkUpdateIssues,
  filterIssues,
  getAdminStats,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/filter", filterIssues);
router.get("/stats", getAdminStats);
router.put("/bulk-update", bulkUpdateIssues);

export default router;

