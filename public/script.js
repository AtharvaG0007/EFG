// script.js — EFG AI Finance Assistant

// ─────────────────────────────────────────────
// 🔹 Config (loaded from config.js → window.CONFIG)
// ─────────────────────────────────────────────
const { API_BASE_URL } = window.CONFIG || {};

// ─────────────────────────────────────────────
// 🔹 DOM Elements
// ─────────────────────────────────────────────
const askBtn       = document.getElementById("askBtn");
const questionInput = document.getElementById("question");
const answerBox    = document.getElementById("answer");

// ─────────────────────────────────────────────
// 🔹 Input length limits
// ─────────────────────────────────────────────
const MIN_LENGTH = 3;
const MAX_LENGTH = 500;
let isSubmitting = false;

// ─────────────────────────────────────────────
// 🔹 UI helpers
// ─────────────────────────────────────────────
function setLoading(isLoading) {
  askBtn.disabled = isLoading;
  askBtn.textContent = isLoading ? "Thinking…" : "Ask AI";
  questionInput.disabled = isLoading;
}

function showMessage(text, type = "info") {
  answerBox.className = "answer-box" + (type !== "info" ? " answer-" + type : "");
  answerBox.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(text) {
  const safeText = escapeHtml(text);
  answerBox.className = "answer-box";

  if (window.marked) {
    answerBox.innerHTML = window.marked.parse(safeText);
  } else {
    answerBox.innerHTML = safeText.replace(/\n/g, "<br>");
  }
}

// ─────────────────────────────────────────────
// 🔹 Gemini API call via Firebase Function
// ─────────────────────────────────────────────
async function askGemini(question) {
  if (!API_BASE_URL) {
    throw new Error("AI service is not configured.");
  }

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  let errorMessage = "The AI service is currently unavailable. Please try again.";
  let data = null;

  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    errorMessage = data && data.error ? data.error : `${errorMessage} (HTTP ${response.status})`;
    throw new Error(errorMessage);
  }

  if (!data || typeof data.answer !== "string" || !data.answer.trim()) {
    throw new Error("The AI response was empty. Please try again.");
  }

  return data.answer.trim();
}

// ─────────────────────────────────────────────
// 🔹 Submit handler
// ─────────────────────────────────────────────
async function handleSubmit() {
  if (isSubmitting) {
    return;
  }

  const question = questionInput.value.trim();

  if (!question) {
    showMessage("Please enter a finance question.", "error");
    questionInput.focus();
    return;
  }

  if (question.length < MIN_LENGTH) {
    showMessage("Question is too short. Please be more specific.", "error");
    questionInput.focus();
    return;
  }

  if (question.length > MAX_LENGTH) {
    showMessage(`Question is too long (${question.length}/${MAX_LENGTH} characters). Please shorten it.`, "error");
    questionInput.focus();
    return;
  }

  isSubmitting = true;
  setLoading(true);
  showMessage("Thinking… 💭");

  try {
    const answer = await askGemini(question);
    renderMarkdown(answer);
  } catch (err) {
    console.error("[EFG] Gemini error:", err);
    showMessage("⚠️ " + (err.message || "Error connecting to AI. Please try again."), "error");
  } finally {
    isSubmitting = false;
    setLoading(false);
  }
}

// ─────────────────────────────────────────────
// 🔹 Event listeners
// ─────────────────────────────────────────────
askBtn.addEventListener("click", handleSubmit);

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
});

document.querySelectorAll(".cat").forEach((card) => {
  card.addEventListener("click", () => {
    const topic = card.dataset.topic;
    if (topic) {
      questionInput.value = topic;
      questionInput.focus();
      questionInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});