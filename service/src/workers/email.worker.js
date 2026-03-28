import redisClient from "../config/redisClient";
import { sendOtpEmail } from "../services/email.service";
import {Worker} from "bullmq"

new Worker(
    "email-queue",  
    async(job)=>{
        const {email, otp} = job.data;
        if(job.name === "send-otp"){
            await sendOtpEmail(email, otp)
        }
    }, {connection: redisClient}
)