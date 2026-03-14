import { Content } from "../models/content.model.js"
import { RelatedContent } from "../models/relatedContent.model.js";


const getKnowledegeGraph = async (req, res) => {
    try {
        const userId = req.user._id;
        const nodes = await Content.find({ userId })
            .select("title _id tags")

        const edges = await RelatedContent.find({})
            .select("from to")

        res.json({ nodes, edges });
    } catch (error) {
        console.error("Knowledge graph error", error);
        res.status(500).json({ message: "Failed to generate knowledge graph", error });
    }
}

export {
    getKnowledegeGraph
}