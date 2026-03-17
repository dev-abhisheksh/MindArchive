import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import contentRouter from "./routes/content.route.js";
import searchRouter from "./routes/search.route.js";
import relatedContentRouter from "./routes/relatedContent.route.js";
import graphRouter from "./routes/graph.route.js";
import collectionRouter from "./routes/collection.route.js";

dotenv.config();
const app = express();

app.use(express.json());


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mind-archive-gamma.vercel.app",
    "chrome-extension://fincleegmippdgfbpojemenpjliammeg"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/search", searchRouter);
app.use("/api/related-content", relatedContentRouter);
app.use("/api/graphs", graphRouter)
app.use("/api/collection", collectionRouter)

export default app;
