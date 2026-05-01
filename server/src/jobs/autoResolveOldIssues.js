import cron from "node-cron";

import { resolveStaleIssues } from "../services/autoResolveService.js";

export const startAutoResolveJob = () => {
  if (process.env.AUTO_RESOLVE_OLD_ISSUES !== "true") {
    return;
  }

  cron.schedule("0 2 * * *", async () => {
    await resolveStaleIssues();
  });
};
