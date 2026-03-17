import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const summarizeText = async (text) => {
    try {
        const res = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: `Summarize this in 3-5 clear lines.
Return ONLY plain text.

Text:
${text.slice(0, 3000)}`
                }
            ]
        });

        return res.choices[0].message.content.trim();

    } catch (err) {
        console.error("Summary error", err);
        return text.slice(0, 300); 
    }
};