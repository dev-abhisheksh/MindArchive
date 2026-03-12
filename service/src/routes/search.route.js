import express from "express";
import { semanticSearch } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/semantic-search", semanticSearch);

export default router;