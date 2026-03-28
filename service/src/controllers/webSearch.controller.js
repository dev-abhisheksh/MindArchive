import { webSearch } from "../services/serper.service.js";


export const webSearchController = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Query is required" })
        }

        const data = await webSearch(query)

        const results = data.organic
            // ?.filter(item => !item.link.includes("youtube.com"))
            .slice(0, 6)
            .map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
            }));

        return res.status(200).json({ message: "Search results fetched successfully", results })
    } catch (error) {
        console.error("Web Search Controller Error:", error.message);
        return res.status(500).json({ message: "Failed to fetch search results" })
    }
}