import { Content } from "../models/content.model.js";
import { generateEmbedding } from "../services/embedding.service.js";


export const semanticSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const queryEmbedding = await generateEmbedding(query);

        const results = await Content.aggregate([
            {
                $vectorSearch: {
                    index: "content_vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 10,
                    filter: { userId: req.user._id }
                }
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    text: 1,
                    tags: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            },
            {
                $match: { score: { $gte: 0.78 } }
            }
        ]);

        res.json(results);
    } catch (error) {
        console.error("Search error", error);
        res.status(500).json({ message: "Search failed", error });
    }
};