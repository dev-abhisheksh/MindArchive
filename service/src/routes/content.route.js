import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { addContent, contentById, getContentsByTag, getMyContent } from "../controllers/content.controller.js";

const router = express.Router();

router.post("/create", verifyToken, addContent)
router.get("/my-content", verifyToken, getMyContent)
router.get("/grouped-content", verifyToken, getContentsByTag)
router.get("/:contentId", verifyToken, contentById)

export default router;