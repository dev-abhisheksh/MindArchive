import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import contentRouter from "./routes/content.route.js";
import searchRouter from "./routes/search.route.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/search", searchRouter);

export default app;
