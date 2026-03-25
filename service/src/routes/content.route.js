import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { addContent, contentById, getContentsByTag, getMyContent } from "../controllers/content.controller.js";
import { addToPrivateVault, setVaultPin, verifyVaultPin } from "../controllers/privateVault.controller.js";

const router = express.Router();

router.post("/create", verifyToken, addContent)
router.get("/my-content", verifyToken, getMyContent)
router.get("/grouped-content", verifyToken, getContentsByTag)
router.get("/:contentId", verifyToken, contentById)

// PRIVATE VAULT ROUTES

router.post("/vault/set-pin", verifyToken, setVaultPin)
router.post("/vault/verify-pin", verifyToken, verifyVaultPin)
router.post("/vault/toggle/:contentId", verifyToken, addToPrivateVault)

export default router;