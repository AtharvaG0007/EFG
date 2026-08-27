export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("[EFG] GEMINI_API_KEY is missing.");

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
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const response = await fetch(url, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },

            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
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
                response.status,
                JSON.stringify(data)
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
            console.error(
                "[EFG] Gemini returned no usable answer:",
                JSON.stringify(data)
            );

            return res.status(502).json({
                error: "The AI returned an empty response."
            });
        }

        return res.status(200).json({
            answer
        });

    } catch (error) {
        console.error(
            "[EFG] Server exception:",
            error?.message || error
        );

        return res.status(500).json({
            error: "Something went wrong while processing your question."
        });
    }
}
