import { webSearch } from "../services/serper.service.js";


export const webSearchController = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Query is required" })
        }

        const data = await webSearch(query)

        const maxPerDomain = 2;
        const domainCount = {};

        const results = data.organic
            ?.filter(item => {
                try {
                    const domain = new URL(item.link).hostname;

                    domainCount[domain] = (domainCount[domain] || 0) + 1;

                    return domainCount[domain] <= maxPerDomain;
                } catch {
                    return false;
                }
            })
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