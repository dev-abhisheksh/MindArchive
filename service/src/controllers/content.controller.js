import { Content } from "../models/content.model.js";
import { contentQueue } from "../queues/content.queue.js";
import { generateTagsWithAI } from "../services/tagGeneration.service.js";


const addContent = async (req, res) => {
    try {
        const userId = req.user._id;
        let { type, title, url, text } = req.body;

        if (!type || !title || !url || !text) {
            return res.status(400).json({ message: "Title, Type, Url and text are required" })
        }


        const normalized = {}
        normalized.type = type?.toLowerCase().trim();
        normalized.title = title?.trim();
        normalized.url = url?.trim();
        normalized.text = text?.trim();

        const existing = await Content.findOne({
            userId,
            url: normalized.url
        });

        const content = await Content.create({
            userId,
            ...normalized
        })

        await contentQueue.add("process-content", {
            contentId: content._id,
            text: normalized.text,
            userId
        })

        return res.status(201).json({ message: "Content added successfully", content })

    } catch (error) {
        console.error("Error adding content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getMyContent = async (req, res) => {
    try {
        const myContent = await Content.find({ userId: req.user._id })
            .select("-__v -embedding")
            .sort({ createdAt: -1 });

        return res.status(200).json({ content: myContent })
    } catch (error) {
        console.error("Error fetching my content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getContentsByTag = async (req, res) => {
    try {
        const userId = req.user._id;
        const groupedByTags = await Content.aggregate([
            { $match: { userId } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", contents: { $push: "$$ROOT" } } },
            {
                $project: {
                    tag: "$_id",
                    contents: {
                        $map: {
                            input: "$contents",
                            as: "c",
                            in: {
                                _id: "$$c._id",
                                title: "$$c.title",
                                url: "$$c.url",
                                text: "$$c.text",
                                tags: "$$c.tags",
                                createdAt: "$$c.createdAt"
                            }
                        }
                    },
                    _id: 0
                }
            }
        ])

        res.json(groupedByTags)
    } catch (error) {
        console.error("Failed to group by tags", error)
        return res.status(500).json({ message: "Failed to group by tags" })
    }
}

const contentById = async (req, res) => {
    try {
        const { contentId } = req.params;

        if (!contentId) {
            return res.status(400).json({ message: "ContentId is required" });
        }

        const content = await Content.findById(contentId)
            .select("-__v -embedding");

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        return res.status(200).json({
            success: true,
            content
        });

    } catch (error) {
        console.error("Content fetch error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
export {
    addContent,
    getMyContent,
    getContentsByTag,
    contentById
}