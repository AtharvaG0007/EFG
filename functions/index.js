const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.askGemini = functions.https.onRequest(async (req, res) => {
  // Allow browser requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const question = req.body.question;

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const GEMINI_API_KEY = "AIzaSyA3Wf9fWew3CHuuRIgU3HEgnnDAmK9fMvQ";
    const GEMINI_MODEL = "models/gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});