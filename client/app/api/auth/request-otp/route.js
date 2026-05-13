import { requestCitizenOtp } from "@/lib/backend/controllers/authController.js";
import { runRouteHandler } from "@/lib/backend/routeHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, context) {
  return runRouteHandler({
    request,
    context,
    controller: requestCitizenOtp,
    bodyType: "json",
  });
}

