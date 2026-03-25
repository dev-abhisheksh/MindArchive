import { Content } from "../models/content.model";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";

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

        const isMatch = await bcrypt.compare(pin, user.vaultPinHash)
        if (!isMatch) {
            throw new Error("Invalid vault pin")
        }

        res.status(200).json({ message: "Vault pin verified successfully" })
    } catch (error) {
        console.error("Error verifying vault pin:", error);
        throw new Error("Internal server error");
    }
}

export {
    setVaultPin,
    verifyVaultPin
}