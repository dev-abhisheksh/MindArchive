import express from "express";
import { semanticSearch } from "../controllers/search.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/semantic-search",verifyToken, semanticSearch);

export default router;