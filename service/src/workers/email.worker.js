import redisClient from "../config/redisClient.js";
import { sendOtpEmail } from "../services/email.service.js";
import { Worker } from "bullmq";

const emailWorker = new Worker(
    "email-queue",  
    async (job) => {
        const { email, otp } = job.data;
        if (job.name === "send-otp") {
            await sendOtpEmail(email, otp)
        }
    }, 
    { connection: redisClient }
);

export default emailWorker;