import mongoose from "mongoose";
import { Content } from "../models/content.model.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

const setVaultPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const userId = req.user._id;
        if (!pin || pin.length < 4) return res.status(400).json({ message: "Pin must be at least 4 digist" })

        const hashedPin = await bcrypt.hash(pin, 10);

        await User.findByIdAndUpdate(
            userId,
            {
                vaultPinHash: hashedPin
            }
        )

        return res.status(200).json({ message: "Vault pin set successfully" })

    } catch (error) {
        console.error("Error setting vault pin:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

const verifyVaultPin = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ message: "Pin is required" });
        }

        if (!user || !user.vaultPinHash) {
            return res.status(400).json({ message: "Vault pin not set" });
        }

        const isMatch = await bcrypt.compare(pin, user.vaultPinHash)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid vault pin" });
        }

        res.status(200).json({ message: "Vault pin verified successfully" })
    } catch (error) {
        console.error("Error verifying vault pin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const addToPrivateVault = async (req, res) => {
    try {
        const userId = req.user._id;
        const { contentId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({ message: "Invalid contentId" })
        }

        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({ message: "Content not found" })
        }

        if (content.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You don't have permission to add this content to private vault" })
        }

        content.isPrivate = !content.isPrivate;
        await content.save();

        return res.status(200).json({
            message: content.isPrivate ? "Content added to private vault" : "Content removed from private vault"
        })
    } catch (error) {
        console.error("Error adding/removing content from private vault:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export {
    setVaultPin,
    verifyVaultPin,
    addToPrivateVault
}