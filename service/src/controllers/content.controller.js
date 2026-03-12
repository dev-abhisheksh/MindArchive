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
            title: normalized.title
        });

        if (existing) {
            return res.status(409).json({ message: "Content already saved" });
        }

        const content = await Content.create({
            userId,
            ...normalized
        })

        await contentQueue.add("process-content", {
            contentId: content._id,
            text: normalized.text
        })

        return res.status(201).json({ message: "Content added successfully", content })

    } catch (error) {
        console.error("Error adding content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export {
    addContent
}