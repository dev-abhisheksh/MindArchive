import dotenv from "dotenv";
dotenv.config();
console.log("REDIS_URL:", process.env.REDIS_URL);
import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import connectDB from "../config/db.js";
import { Content } from "../models/content.model.js";
import { generateEmbedding } from "../services/embedding.service.js";

await connectDB();

const worker = new Worker("content-processing",
    async (job) => {
        console.log("Processing Content", job.data)
        const { contentId, text } = job.data;
        const embedding = await generateEmbedding(text);
        await Content.findByIdAndUpdate(contentId, { embedding })
    }, { connection: redisClient }
)

worker.on("completed", job => {
    console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Job failed:", job.id, err);
});