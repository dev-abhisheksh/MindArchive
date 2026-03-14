import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { getKnowledegeGraph } from "../controllers/graph.controller.js";

const router = express.Router();

router.get("/graph", verifyToken, getKnowledegeGraph)

export default router;