import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import contentRouter from "./routes/content.route.js";
import searchRouter from "./routes/search.route.js";
import relatedContentRouter from "./routes/relatedContent.route.js";
import graphRouter from "./routes/graph.route.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(
    cors({
        origin: ["https://movie-hub-beta-ruddy.vercel.app", "http://localhost:5173"],
        credentials: true,
    })
);

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/search", searchRouter);
app.use("/api/related-content", relatedContentRouter);
app.use("/api/graphs", graphRouter)

export default app;
