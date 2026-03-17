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
  origin: (origin, callback) => {
    if (
      !origin || // mobile/postman
      origin.startsWith("chrome-extension://") ||
      origin === "http://localhost:5173" ||
      origin === "https://mind-archive-gamma.vercel.app"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
