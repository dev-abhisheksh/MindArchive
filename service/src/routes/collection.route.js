import express from "express"
import verifyToken from "../middlewares/auth.middleware.js";
import { addContentsToCollection, createCollection, getCollectionById, getMyCollections, updateCollection } from "../controllers/collection.controller.js";

const router = express.Router();

router.post("/", verifyToken, createCollection)
router.get("/", verifyToken, getMyCollections)
router.patch("/add/:collectionId", verifyToken, addContentsToCollection)
router.get("/:collectionId", verifyToken, getCollectionById)
router.patch("/:collectionId", verifyToken, updateCollection)

export default router;