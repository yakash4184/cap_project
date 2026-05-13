import { getAllIssues } from "@/lib/backend/controllers/issueController.js";
import { protect } from "@/lib/backend/middleware/auth.js";
import { runRouteHandler } from "@/lib/backend/routeHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  return runRouteHandler({
    request,
    context,
    middlewares: [protect],
    controller: getAllIssues,
    bodyType: "none",
  });
}

