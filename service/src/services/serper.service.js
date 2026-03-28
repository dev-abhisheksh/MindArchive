import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const webSearch = async (query) => {
    try {
        const res = await axios.post(
            "https://google.serper.dev/search",
            { q: query },
            {
                headers: {
                    "X-API-KEY": process.env.SERPER_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data;
    } catch (error) {
        console.error("Serper Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch search results");
    }
};