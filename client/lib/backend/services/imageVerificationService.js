const DEFAULT_IMAGE_VERIFIER_MODEL =
  process.env.OPENAI_IMAGE_VERIFY_MODEL ||
  process.env.OPENAI_ASSISTANT_MODEL ||
  "gpt-4o-mini";

const CATEGORY_HINTS = {
  garbage: "Garbage piles, waste overflow, dump points, dirty surroundings",
  road: "Road damage, potholes, cracked roads, broken pavement",
  electricity: "Electric poles, sparks, wire hazards, power infrastructure",
  water: "Water leakage, pipe burst, contaminated water, supply issue",
  drainage: "Drain blockage, sewage overflow, waterlogging drains",
  streetlight: "Street lights, dark roads, damaged light poles",
  sanitation: "Public cleanliness, garbage collection, sanitation concerns",
  other: "General civic issue",
};

const CATEGORY_KEYWORDS = {
  garbage: ["garbage", "waste", "trash", "dump", "bin", "litter"],
  road: ["road", "pothole", "asphalt", "street", "crack", "highway"],
  electricity: ["electric", "wire", "pole", "spark", "transformer", "power"],
  water: ["water", "pipe", "leak", "tap", "supply", "tank"],
  drainage: ["drain", "sewage", "gutter", "overflow", "waterlog"],
  streetlight: ["streetlight", "lamp", "light", "pole", "dark", "night"],
  sanitation: ["clean", "sanitation", "waste", "hygiene", "dirty"],
  other: ["issue", "problem", "damage", "civic"],
};

const SUSPICIOUS_CONTEXT_KEYWORDS = [
  "logo",
  "poster",
  "wallpaper",
  "selfie",
  "avatar",
  "cartoon",
  "meme",
];

const VALID_STATUSES = ["verified", "suspicious", "needs-review", "unavailable"];

const normalizeConfidence = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const toDataUrlFromFile = (file) => {
  if (!file?.buffer?.length) {
    return "";
  }

  const mimeType = file.mimetype || "image/jpeg";
  const encodedFile = file.buffer.toString("base64");
  return `data:${mimeType};base64,${encodedFile}`;
};

const extractOutputText = (payload = {}) => {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks = [];

  for (const item of payload.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join(" ").trim();
};

const parseJsonSafely = (text = "") => {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const jsonLikeMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonLikeMatch) {
      return null;
    }

    try {
      return JSON.parse(jsonLikeMatch[0]);
    } catch {
      return null;
    }
  }
};

const normalizeStatus = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  if (VALID_STATUSES.includes(normalized)) {
    return normalized;
  }

  if (["genuine", "real", "authentic", "detected"].includes(normalized)) {
    return "verified";
  }

  if (["fake", "mismatch", "not-match"].includes(normalized)) {
    return "suspicious";
  }

  return "needs-review";
};

const buildLiteHeuristicResult = ({
  category = "other",
  title = "",
  description = "",
  imageUrl = "",
  file = null,
}) => {
  const normalizedCategory = String(category || "other").trim().toLowerCase();
  const keywords = CATEGORY_KEYWORDS[normalizedCategory] || CATEGORY_KEYWORDS.other;
  const context = [
    String(title || ""),
    String(description || ""),
    String(imageUrl || ""),
    String(file?.originalname || ""),
  ]
    .join(" ")
    .toLowerCase();

  const matchCount = keywords.reduce(
    (total, keyword) => (context.includes(keyword) ? total + 1 : total),
    0
  );

  const suspiciousContext = SUSPICIOUS_CONTEXT_KEYWORDS.some((keyword) =>
    context.includes(keyword)
  );

  let status = "needs-review";
  let confidence = 48;
  let matchesCategory = null;
  const reasons = [
    "Lite AI mode used (no external model call).",
    "Result is based on complaint text + file metadata matching.",
  ];

  if (suspiciousContext && matchCount === 0) {
    status = "suspicious";
    confidence = 38;
    matchesCategory = false;
    reasons.push("Evidence context looks unrelated to civic field image.");
  } else if (matchCount >= 2) {
    status = "verified";
    confidence = 76;
    matchesCategory = true;
    reasons.push("Multiple category signals found in provided complaint context.");
  } else if (matchCount === 1) {
    status = "needs-review";
    confidence = 60;
    matchesCategory = true;
    reasons.push("Single category signal found; verification is partially confident.");
  } else {
    reasons.push("Not enough category signals found for confident classification.");
  }

  return {
    status,
    confidence,
    matchesCategory,
    detectedContext: `Category: ${normalizedCategory}. Hint: ${
      CATEGORY_HINTS[normalizedCategory] || CATEGORY_HINTS.other
    }`,
    summary:
      status === "verified"
        ? "Quick AI check indicates evidence likely matches this complaint category."
        : status === "suspicious"
          ? "Quick AI check indicates evidence may be mismatched for this category."
          : "Quick AI check could not confidently verify category match.",
    reasons,
    checkedAt: new Date(),
    model: "lite-heuristic-v1",
  };
};

const buildFallbackResult = ({
  reason,
  detectedContext = "Could not run AI image analysis.",
  imageProvided = false,
}) => ({
  status: imageProvided ? "needs-review" : "unavailable",
  confidence: imageProvided ? 35 : 0,
  matchesCategory: imageProvided ? null : false,
  detectedContext,
  summary: reason,
  reasons: imageProvided
    ? ["AI model unavailable; verification is marked for manual admin review."]
    : ["No image evidence found in complaint payload."],
  checkedAt: new Date(),
  model: imageProvided ? "manual-fallback" : "no-image",
});

export const verifyIssueEvidenceWithAI = async ({
  category = "other",
  title = "",
  description = "",
  imageUrl = "",
  file = null,
}) => {
  const normalizedCategory = String(category || "other").trim().toLowerCase();
  const evidenceImage =
    (typeof imageUrl === "string" ? imageUrl.trim() : "") || toDataUrlFromFile(file);

  if (!evidenceImage) {
    return buildFallbackResult({
      reason: "No image provided. Please upload image evidence for AI verification.",
      detectedContext: "No visual evidence attached.",
      imageProvided: false,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildLiteHeuristicResult({
      category: normalizedCategory,
      title,
      description,
      imageUrl: evidenceImage,
      file,
    });
  }

  const hint = CATEGORY_HINTS[normalizedCategory] || CATEGORY_HINTS.other;
  const prompt = [
    "You are a civic complaint image verifier.",
    "Analyze the provided image and decide if it appears relevant to the complaint category and description.",
    "Detect if image looks unrelated, manipulated, or suspicious.",
    "Return strict JSON only with keys:",
    'status ("verified" | "suspicious" | "needs-review"),',
    "confidence (0-100),",
    "matchesCategory (true/false),",
    "detectedContext (short),",
    "summary (short),",
    "reasons (array of short strings).",
  ].join(" ");

  const complaintContext = [
    `Category: ${normalizedCategory}`,
    `Title: ${String(title || "").trim()}`,
    `Description: ${String(description || "").trim()}`,
    `Expected visual hints: ${hint}`,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_IMAGE_VERIFIER_MODEL,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: prompt }],
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: complaintContext },
              { type: "input_image", image_url: evidenceImage },
            ],
          },
        ],
        temperature: 0.1,
        max_output_tokens: 160,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return buildLiteHeuristicResult({
        category: normalizedCategory,
        title,
        description,
        imageUrl: evidenceImage,
        file,
      });
    }

    const payload = await response.json();
    const rawText = extractOutputText(payload);
    const parsed = parseJsonSafely(rawText);

    if (!parsed) {
      return buildLiteHeuristicResult({
        category: normalizedCategory,
        title,
        description,
        imageUrl: evidenceImage,
        file,
      });
    }

    return {
      status: normalizeStatus(parsed.status),
      confidence: normalizeConfidence(parsed.confidence),
      matchesCategory:
        typeof parsed.matchesCategory === "boolean" ? parsed.matchesCategory : null,
      detectedContext: String(parsed.detectedContext || "").trim().slice(0, 220),
      summary:
        String(parsed.summary || "AI verified image evidence.")
          .trim()
          .slice(0, 260) || "AI verified image evidence.",
      reasons: Array.isArray(parsed.reasons)
        ? parsed.reasons
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],
      checkedAt: new Date(),
      model: DEFAULT_IMAGE_VERIFIER_MODEL,
    };
  } catch {
    return buildLiteHeuristicResult({
      category: normalizedCategory,
      title,
      description,
      imageUrl: evidenceImage,
      file,
    });
  } finally {
    clearTimeout(timeout);
  }
};
