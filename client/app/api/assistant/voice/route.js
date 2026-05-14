import { NextResponse } from "next/server";

const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "shimmer";

const requestSpeech = async ({ apiKey, text, voice }) =>
  fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_TTS_MODEL,
      voice,
      input: text,
      format: "wav",
      instructions:
        "Speak in clear English with natural Indian accent, friendly support tone, and crisp pronunciation.",
    }),
  });

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "OPENAI_API_KEY missing for voice output." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json({ message: "Text is required." }, { status: 400 });
    }

    const primary = await requestSpeech({
      apiKey,
      text,
      voice: DEFAULT_TTS_VOICE,
    });

    const response = primary.ok
      ? primary
      : await requestSpeech({
          apiKey,
          text,
          voice: "shimmer",
        });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: "Voice generation failed.",
          ...(process.env.NODE_ENV !== "production"
            ? { debug: errorPayload?.error?.message || "Unknown TTS error" }
            : {}),
        },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Voice service unavailable.",
        ...(process.env.NODE_ENV !== "production" && error?.message
          ? { debug: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
}
