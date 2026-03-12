import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { addContent } from "../controllers/content.controller.js";

const router = express.Router();

router.post("/create", verifyToken, addContent)

export default router;