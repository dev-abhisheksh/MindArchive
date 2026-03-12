import mongoose from "mongoose";
import { Content } from "../models/content.model.js"

export const findRelatedContent = async (contentId, embedding) => {
    try {
        const results = await Content.aggregate([
            {
                $vectorSearch: {
                    index: "content_vector_index",
                    path: "embedding",
                    queryVector: embedding,
                    numCandidates: 30,
                    limit: 5
                }
            },
            {
                $match: { _id: { $ne: new mongoose.Types.ObjectId(contentId) } }
            }
        ])

        return results;
    } catch (error) {
        console.error("Error finding related content:", error);
        throw error;
    }
}