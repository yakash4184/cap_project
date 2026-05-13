import { bulkUpdateIssues } from "@/lib/backend/controllers/adminController.js";
import { authorize, protect } from "@/lib/backend/middleware/auth.js";
import { runRouteHandler } from "@/lib/backend/routeHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, context) {
  return runRouteHandler({
    request,
    context,
    middlewares: [protect, authorize("admin")],
    controller: bulkUpdateIssues,
    bodyType: "json",
  });
}

