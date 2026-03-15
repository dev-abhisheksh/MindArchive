import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { getRelatedContent } from "../controllers/relatedContent.controller.js";

const router = express.Router();

router.get("/:contentId", verifyToken, getRelatedContent)

export default router;