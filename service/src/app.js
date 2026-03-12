import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import contentRouter from "./routes/content.route.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);

export default app;
