import { Queue } from "bullmq";
import redisClient from "../config/redisClient.js";

export const contentQueue = new Queue("content-processing", {
    connection: redisClient
})