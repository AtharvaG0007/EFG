export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("[EFG] GEMINI_API_KEY is not configured.");

        return res.status(500).json({
            error: "AI service is not configured."
        });
    }

    try {
        const body = req.body || {};
        const question =
            typeof body.question === "string"
                ? body.question.trim()
                : "";

        if (!question) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        if (question.length > 4000) {
            return res.status(400).json({
                error: "Question is too long."
            });
        }

        const model = "gemini-2.5-flash";

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: question
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "[EFG] Gemini API error:",
                response.status
            );

            return res.status(502).json({
                error: "The AI service could not process your request."
            });
        }

        const answer =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part?.text || "")
                .join("")
                .trim();

        if (!answer) {
            return res.status(502).json({
                error: "The AI returned an empty response."
            });
        }

        return res.status(200).json({
            answer
        });

    } catch (error) {
        console.error("[EFG] Server error:", error);

        return res.status(500).json({
            error: "Something went wrong while processing your question."
        });
    }
}
