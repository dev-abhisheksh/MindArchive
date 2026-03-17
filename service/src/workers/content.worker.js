import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import connectDB from "../config/db.js";
import { Content } from "../models/content.model.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { generateTagsWithAI } from "../services/tagGeneration.service.js";
import { findRelatedContent } from "../services/related.service.js";
import { RelatedContent } from "../models/relatedContent.model.js";
import { summarizeText } from "../services/textSummary.service.js";


const app = express();
app.get("/", (req, res) => res.send("Worker running"));

app.listen(process.env.PORT2, () => {
    console.log("Dummy server running on", process.env.PORT2);
});

await connectDB();

const worker = new Worker("content-processing",
    async (job) => {
        console.log("Processing Content", job.data);

        const { contentId, text, userId, url } = job.data;

        let summary;
        const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

        if (isYoutube) {
            summary = text.slice(0, 150);
        } else {
            summary = await summarizeText(text);
        }

        const embedding = await generateEmbedding(summary);

        const tags = (await generateTagsWithAI(summary))
            .map(t => t.toLowerCase().trim());

        await Content.findByIdAndUpdate(contentId, {
            embedding,
            tags,
            summary
        });

        const relatedContent = await findRelatedContent(contentId, embedding, userId);

        await Promise.all(
            relatedContent.map(related =>
                RelatedContent.create({
                    from: contentId,
                    to: related._id,
                    relation: "semantic_similarity"
                })
            )
        );

        await Promise.all(
            relatedContent.map(related =>
                RelatedContent.create({
                    from: related._id,
                    to: contentId,
                    relation: "semantic_similarity"
                })
            )
        );
    },
    { connection: redisClient }
);

worker.on("completed", job => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Job failed:", job.id, err);
});