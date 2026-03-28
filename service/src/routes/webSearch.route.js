import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { webSearchController } from "../controllers/webSearch.controller.js";

const router = express.Router();

router.get("/web-search", verifyToken, webSearchController)

export default router;