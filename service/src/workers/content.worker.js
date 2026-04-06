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
    crypto.createHash("md5").update(text || "").digest("hex");

const setCache = async (key, value, ttl) => {
    try {
        if (!value) return;

        await redisClient.set(
            key,
            typeof value === "string" ? value : JSON.stringify(value),
            "EX",
            ttl
        );
    } catch (err) {
        console.error("Redis SET failed:", err.message);
    }
};

const worker = new Worker(
    "content-processing",
    async (job) => {
        console.log("Processing Content", job.data);

        const { contentId, text, userId, url } = job.data;

        const lockKey = `lock:${contentId}`;
        const isLocked = await redisClient.set(lockKey, "1", "NX", "EX", 60);

        if (!isLocked) {
            console.log("Already being processed, skipping...");
            return;
        }

        try {
            const existing = await Content.findById(contentId);
            if (existing?.embedding && existing?.summary) {
                console.log("Already processed, skipping...");
                return;
            }

            const isYoutube = /youtube\.com|youtu\.be/.test(url);
            const safeText = text?.slice(0, isYoutube ? 500 : 2000) || "";

            // ================= SUMMARY =================
            let summary;
            const summaryKey = `summary:${hash(safeText)}`;

            const cachedSummary = await redisClient.get(summaryKey);

            if (cachedSummary) {
                console.log("Summary cache hit");
                summary = cachedSummary.toString();
            } else {
                try {
                    summary = await summarizeText(safeText);
                } catch (err) {
                    console.log("Summary failed, using fallback");
                    summary = safeText
                        .split(".")
                        .slice(0, 2)
                        .join(".");
                }

                if (!summary || summary.trim().length === 0) {
                    summary = safeText.slice(0, 200);
                }

                await setCache(summaryKey, summary, 3600);
            }

            // ================= EMBEDDING =================
            const embedKey = `embed:${hash(summary)}`;
            let embedding;

            const cachedEmbedding = await redisClient.get(embedKey);

            if (cachedEmbedding) {
                console.log("Embedding cache hit");
                embedding = JSON.parse(cachedEmbedding);
            } else {
                embedding = await generateEmbedding(summary);
                await setCache(embedKey, embedding, 86400);
            }

            // ================= TAGS =================
            const tagsKey = `tags:${hash(summary)}`;
            let tags;

            const cachedTags = await redisClient.get(tagsKey);

            if (cachedTags) {
                console.log("Tags cache hit");
                tags = JSON.parse(cachedTags);
            } else {
                tags = (await generateTagsWithAI(summary))
                    ?.map(t => t.toLowerCase().trim()) || [];

                await setCache(tagsKey, tags, 86400);
            }

            // ================= SAVE =================
            await Content.findByIdAndUpdate(contentId, {
                embedding,
                tags,
                summary
            });

            // ================= RELATED =================
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

            console.log("Processing completed:", contentId);
        } catch (err) {
            console.error("Worker error:", err);
            throw err; 
        } finally {
            await redisClient.del(lockKey);
        }
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
    console.error("Job failed:", job?.id, err);
});