import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateEmbedding = async (text) => {
    try {
        const res = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });
        return res.embeddings[0].values;
    } catch (error) {
        console.error("Embedding generation error", error);
        return null; 
    }
};