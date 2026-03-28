import { Queue } from "bullmq"
import redisClient from "../config/redisClient.js"

export const emailQueue = new Queue("email-queue", {
    connection: redisClient
})