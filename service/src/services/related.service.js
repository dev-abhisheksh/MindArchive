import mongoose from "mongoose";
import { Content } from "../models/content.model.js"

export const findRelatedContent = async (contentId, embedding, userId) => {
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
                $addFields: {
                    score: { $meta: "vectorSearchScore" }
                }
            },
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(contentId) },
                    userId: new mongoose.Types.ObjectId(userId),
                    score: { $gte: 0.78 }
                }
            },
            { $limit: 10 }
        ])

        return results;
    } catch (error) {
        console.error("Error finding related content:", error);
        throw error;
    }
}