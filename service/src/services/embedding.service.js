import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateEmbedding = async (text) => {
    const res = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
    });
    return res.embeddings[0].values;
};