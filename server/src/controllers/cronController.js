import { isAuthorizedCronRequest } from "../utils/cronAuth.js";
import { resolveStaleIssues } from "../services/autoResolveService.js";

export const runAutoResolveCron = async (req, res, next) => {
  try {
    if (!isAuthorizedCronRequest(req.headers.authorization || "")) {
      return res.status(401).json({ message: "Unauthorized cron invocation" });
    }

    if (process.env.AUTO_RESOLVE_OLD_ISSUES !== "true") {
      return res.json({
        success: true,
        skipped: true,
        reason: "AUTO_RESOLVE_OLD_ISSUES is disabled",
      });
    }

    const result = await resolveStaleIssues();

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
