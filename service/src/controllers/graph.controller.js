import { Content } from "../models/content.model.js"
import { RelatedContent } from "../models/relatedContent.model.js";


const getKnowledegeGraph = async (req, res) => {
    try {
        const userId = req.user._id;
        const nodes = await Content.find({ userId })
            .select("title _id tags type")

        const edges = await RelatedContent.find({ userId })
            .select("from to relation")

        // Build a tag lookup map for Jaccard similarity
        const tagMap = {};
        nodes.forEach(node => {
            tagMap[node._id.toString()] = new Set(node.tags || []);
        });

        // Compute Jaccard similarity score for each edge
        const enrichedEdges = edges.map(edge => {
            const fromTags = tagMap[edge.from?.toString()] || new Set();
            const toTags = tagMap[edge.to?.toString()] || new Set();

            let score = 0;
            if (fromTags.size > 0 && toTags.size > 0) {
                const intersection = [...fromTags].filter(t => toTags.has(t)).length;
                const union = new Set([...fromTags, ...toTags]).size;
                score = union > 0 ? intersection / union : 0;
            }

            return {
                from: edge.from,
                to: edge.to,
                relation: edge.relation,
                score: Math.round(score * 100) / 100
            };
        });

        res.json({ nodes, edges: enrichedEdges });
    } catch (error) {
        console.error("Knowledge graph error", error);
        res.status(500).json({ message: "Failed to generate knowledge graph", error });
    }
}

export {
    getKnowledegeGraph
}