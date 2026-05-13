import { runAutoResolveCron } from "@/lib/backend/controllers/cronController.js";
import { runRouteHandler } from "@/lib/backend/routeHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  return runRouteHandler({
    request,
    context,
    middlewares: [],
    controller: runAutoResolveCron,
    bodyType: "none",
  });
}

