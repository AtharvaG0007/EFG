// script.js — Firebase-safe version (NO imports)

// 🔹 Load config from window
const { GEMINI_API_KEY, GEMINI_MODEL } = window.CONFIG;

// 🔹 DOM elements
const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("question");
const answerBox = document.getElementById("answer");

// 🔹 Gemini API call
async function askGemini(question) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return "No response from AI. Try again.";
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error(err);
    return "Error connecting to AI.";
  }
}

// 🔹 Button click
askBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.innerText = "Please enter a question.";
    return;
  }

  answerBox.innerText = "Thinking... 💭";
  const answer = await askGemini(question);
  answerBox.innerText = answer;
});