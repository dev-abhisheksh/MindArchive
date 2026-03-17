import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateTagsWithAI = async (text) => {
    try {
        const res = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: `Generate EXACTLY 3 to 5 broad topic tags (1-2 words each).
Return only comma-separated tags.

Text:
${text.slice(0, 2000)}`
                }
            ]
        });
        return res.choices[0].message.content.split(",").map(t => t.trim());
    } catch (error) {
        console.error("Tag generation error", error);
        return []; // Return empty tags on failure
    }
};