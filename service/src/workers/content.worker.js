import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import { Content } from "../models/content.model.js";
import { generateEmbedding } from "../services/embedding.service.js";

const worker = new Worker("content-processing",
    async (job) => {
        console.log("Processing Content", job.data)

        const { contentId, text } = job.data;
        const embedding = await generateEmbedding(text);

        await Content.findByIdAndUpdate(contentId, { embedding })   
    }, { connection: redisClient }
)