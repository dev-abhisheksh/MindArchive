import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateTagsWithAI = async (text) => {
    const res = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: `Generate 5 short tags for this text, return only comma-separated tags, no extra text:\n${text}`
            }
        ]
    });
    return res.choices[0].message.content.split(",").map(t => t.trim());
};