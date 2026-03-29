import redisClient from "../config/redisClient";

export const verifyVaultPin = async (req, res, next) => {
    try {
        console.log("Verifying vault pin for user:", req.user._id);
        const userId = req.user._id;

        const verified = await redisClient.get(`vault:${userId}`);

        if (!verified) return res.status(403).json({
            message: "Vault Locked. Please enter pin"
        })

        next()
    } catch (error) {
        console.error("Error verifying vault pin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}