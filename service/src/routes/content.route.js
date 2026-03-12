import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { addContent, getMyContent } from "../controllers/content.controller.js";

const router = express.Router();

router.post("/create", verifyToken, addContent)
router.get("/my-content", verifyToken, getMyContent)

export default router;