import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import connectDB from "../config/db.js";
import { Content } from "../models/content.model.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { generateTagsWithAI } from "../services/tagGeneration.service.js";
import { findRelatedContent } from "../services/related.service.js";
import { RelatedContent } from "../models/relatedContent.model.js";

await connectDB();

const worker = new Worker("content-processing",
    async (job) => {
        console.log("Processing Content", job.data)
        const { contentId, text } = job.data;
        const embedding = await generateEmbedding(text);
        const tags = await generateTagsWithAI(text);
        await Content.findByIdAndUpdate(contentId, { embedding, tags })

        const relatedContent = await findRelatedContent(contentId, embedding);

        await Promise.all(
            relatedContent.map(related =>
                RelatedContent.create({
                    from: contentId,
                    to: related._id,
                    relation: "semantic_similarity"
                })
            )
        )

    }, { connection: redisClient }
)

worker.on("completed", job => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Job failed:", job.id, err);
});


