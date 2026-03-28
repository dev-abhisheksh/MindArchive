import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";
import { sendOtpEmail } from "../services/email.service.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const hashedPassword = await bcrypt.hash(password, 10);

        await redisClient.set(
            `otp:${email}`,
            JSON.stringify({
                otp,
                name: name.trim(),
                password: hashedPassword,
            }),
            "EX", 300
        )

        await sendOtpEmail(email, otp)

        return res.status(201).json({ message: "OTP sent to your email", })
    } catch (error) {
        console.error("Failed to send OTP", error)
        return res.status(500).json({ message: "Failed to send OTP" })
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const data = await redisClient.get(`otp:${email}`)
        if (!data) return res.status(400).json({ message: "OTP Expired or not found" })

        const parsed = JSON.parse(data)
        if (parsed.otp !== otp) return res.status(400).json({ message: "Invalid otp" })

        const user = await User.create({
            name: parsed.name,
            email,
            password: parsed.password
        })

        await redisClient.del(`otp:${email}`)

        const token = generateAccessToken(user)

        return res.status(200).json({
            message: "User verified and registered successfully",
            token
        });
    } catch (error) {
        console.error("Failed verifying otp", error)
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = generateAccessToken(user)

        return res.status(200).json({ message: "Login successful", token })

    } catch (error) {
        console.error("Login error", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export {
    register,
    login,
    verifyOTP
}