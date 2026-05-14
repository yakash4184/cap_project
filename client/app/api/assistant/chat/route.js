import { NextResponse } from "next/server";

import { generateAssistantReply } from "@/lib/backend/services/assistantService.js";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ message: "Message is required." }, { status: 400 });
    }

    const result = await generateAssistantReply({
      message,
      history,
      authorization: request.headers.get("authorization") || "",
    });

    return NextResponse.json(
      {
        reply: result.text,
        requiresLogin: result.requiresLogin,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Assistant unavailable right now. Please try again.",
        ...(process.env.NODE_ENV !== "production" && error?.message
          ? { debug: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
}
