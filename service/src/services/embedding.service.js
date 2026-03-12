import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateEmbedding = async (text) => {
    const model = genAI.getGenerativeModel({ model: "embedding-001" })
    const res = await model.embedContent(text);
    return res.data[0].embedding
}