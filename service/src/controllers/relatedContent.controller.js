import { RelatedContent } from "../models/relatedContent.model.js";


const getRelatedContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        if (!contentId) return res.status(400).json({ message: "Content ID is required" });

        const content = await RelatedContent.find({ from: contentId })
            .populate({ path: "to", select: "-embedding -updatedAt -__v" });
        return res.json(content);
    } catch (error) {
        console.error("Error fetching related content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export {
    getRelatedContent
}