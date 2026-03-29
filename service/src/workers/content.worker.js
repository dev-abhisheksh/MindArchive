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
import crypto from "crypto";

const app = express();
app.get("/", (req, res) => res.send("Worker running"));

const PORT2 = process.env.PORT2;

app.listen(PORT2, () => {
    console.log("Dummy server running on", PORT2);
});

await connectDB();

const hash = (text) =>
    crypto.createHash("md5").update(text).digest("hex");

const worker = new Worker(
    "content-processing",
    async (job) => {
        console.log("Processing Content", job.data);

        const { contentId, text, userId, url } = job.data;

        const existing = await Content.findById(contentId);
        if (existing?.embedding && existing?.summary) {
            console.log("Already processed, skipping...");
            return;
        }

        let summary;

        const isYoutube = /youtube\.com|youtu\.be/.test(url);

        const safeText = text?.slice(0, isYoutube ? 500 : 2000) || "";

        const summaryKey = `summary:${hash(safeText)}`;
        const cachedSummary = await redisClient.get(summaryKey);

        if (cachedSummary) {
            console.log("Summary cache hit");
            summary = cachedSummary;
        } else {
            try {
                summary = await summarizeText(safeText);

                await redisClient.set(summaryKey, summary, {
                    "EX": 3600 // 1 hour
                });
            } catch (err) {
                console.log("Summary failed, using fallback");
                summary = safeText
                    .split(".")
                    .slice(0, 2)
                    .join(".");
            }
        }

        const embedKey = `embed:${hash(summary)}`;
        let embedding;

        const cachedEmbedding = await redisClient.get(embedKey);

        if (cachedEmbedding) {
            console.log("Embedding cache hit");
            embedding = JSON.parse(cachedEmbedding);
        } else {
            embedding = await generateEmbedding(summary);

            await redisClient.set(embedKey, JSON.stringify(embedding), {
                EX: 86400 // 1 day
            });
        }

        const tagsKey = `tags:${hash(summary)}`;
        let tags;

        const cachedTags = await redisClient.get(tagsKey);

        if (cachedTags) {
            console.log("tags cache hit");
            tags = JSON.parse(cachedTags);
        } else {
            tags = (await generateTagsWithAI(summary))
                .map(t => t.toLowerCase().trim());

            await redisClient.set(tagsKey, JSON.stringify(tags), {
                EX: 86400 // 1 day
            });
        }

        await Content.findByIdAndUpdate(contentId, {
            embedding,
            tags,
            summary
        });

        const relatedContent = await findRelatedContent(
            contentId,
            embedding,
            userId
        );

        await Promise.all(
            relatedContent.map(related =>
                RelatedContent.updateOne(
                    { from: contentId, to: related._id },
                    {
                        $setOnInsert: {
                            relation: "semantic_similarity",
                            score: related.score || 0
                        }
                    },
                    { upsert: true }
                )
            )
        );

        await Promise.all(
            relatedContent.map(related =>
                RelatedContent.updateOne(
                    { from: related._id, to: contentId },
                    {
                        $setOnInsert: {
                            relation: "semantic_similarity",
                            score: related.score || 0
                        }
                    },
                    { upsert: true }
                )
            )
        );

        console.log("Processign completed:", contentId);
    },
    {
        connection: redisClient,
        settings: {
            retries: 3
        }
    }
);


worker.on("completed", job => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Job failed:", job.id, err);
});