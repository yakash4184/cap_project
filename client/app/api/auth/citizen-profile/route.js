import { updateCitizenProfile } from "@/lib/backend/controllers/authController.js";
import { protect } from "@/lib/backend/middleware/auth.js";
import { runRouteHandler } from "@/lib/backend/routeHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, context) {
  return runRouteHandler({
    request,
    context,
    middlewares: [protect],
    controller: updateCitizenProfile,
    bodyType: "json",
  });
}

