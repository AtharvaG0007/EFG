// functions/index.js — Firebase Cloud Function: Gemini AI proxy
// ──────────────────────────────────────────────────────────────
// This function acts as a secure server-side proxy for Gemini API calls.
// The API key is stored as a Firebase environment variable (never in source):
//
//   firebase functions:secrets:set GEMINI_API_KEY
//
// Then reference it via process.env.GEMINI_API_KEY at runtime.
//
// Deploy: firebase deploy --only functions
// ──────────────────────────────────────────────────────────────

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// Declare the secret — set via: firebase functions:secrets:set GEMINI_API_KEY
const geminiApiKey = defineSecret("GEMINI_API_KEY");

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ALLOWED_ORIGINS = [
  "https://efg-mvp-3e91a.web.app",
  "https://efg-mvp-3e91a.firebaseapp.com",
  "http://localhost:5000",
  "http://localhost:8080",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:8080"
];

function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(origin)
    || /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin);
}

const FINANCIAL_SYSTEM_INSTRUCTION =
  "You are EFG — an AI-powered financial education assistant for students. " +
  "Provide clear, educational explanations about finance, investing, and money management. " +
  "Always clarify that your answers are for educational purposes only and do not constitute " +
  "personalised financial, legal, or investment advice. " +
  "Encourage users to consult a qualified financial advisor for decisions.";

function applyCors(req, res) {
  const origin = req.headers && req.headers.origin;

  if (!origin) {
    return;
  }

  if (!isAllowedOrigin(origin)) {
    throw new Error("Origin not allowed");
  }

  res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function extractGeminiAnswer(data) {
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || !candidates.length) {
    return "";
  }

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts) || !parts.length) {
    return "";
  }

  return parts
    .map((part) => typeof part?.text === "string" ? part.text : "")
    .join("")
    .trim();
}

exports.askGemini = onRequest(
  { secrets: [geminiApiKey] },
  async (req, res) => {
    try {
      applyCors(req, res);
    } catch (error) {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const questionValue = req.body && typeof req.body === "object" ? req.body.question : undefined;
    if (typeof questionValue !== "string") {
      return res.status(400).json({ error: "No question provided" });
    }

    const trimmed = questionValue.trim();
    if (trimmed.length < 3) {
      return res.status(400).json({ error: "Question too short" });
    }
    if (trimmed.length > 500) {
      return res.status(400).json({ error: "Question too long (max 500 characters)" });
    }

    try {
      const apiKey = geminiApiKey.value();
      if (!apiKey) {
        throw new Error("Gemini API secret is not configured");
      }

      const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: FINANCIAL_SYSTEM_INSTRUCTION }]
          },
          contents: [
            { role: "user", parts: [{ text: trimmed }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });

      const payload = await geminiResponse.json().catch(() => null);

      if (!geminiResponse.ok) {
        const message = payload?.error?.message || "Gemini API request failed.";
        console.error("[EFG Function] Gemini API error:", geminiResponse.status, message);
        return res.status(502).json({ error: message });
      }

      const answer = extractGeminiAnswer(payload);
      if (!answer) {
        console.error("[EFG Function] Empty Gemini response", payload);
        return res.status(502).json({ error: "Gemini returned an empty response. Please try again." });
      }

      return res.status(200).json({ answer });
    } catch (err) {
      const message = err && err.message ? err.message : "Internal server error";
      console.error("[EFG Function] Unexpected error:", err);
      return res.status(500).json({ error: message });
    }
  }
);