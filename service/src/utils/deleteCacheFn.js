import redisClient from "../config/redisClient.js";

export const delRedisCache = async (patterns) => {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];

    try {
        let totalDeleted = 0;

        for (const pattern of patternArray) {
            let cursor = "0";

            do {
                const [nextCursor, keys] = await redisClient.scan(
                    cursor,
                    "MATCH",
                    pattern,
                    "COUNT",
                    100
                );

                cursor = nextCursor;

                if (keys.length) {
                    const deleted = await redisClient.del(...keys);
                    totalDeleted += deleted;
                }

            } while (cursor !== "0");
        }

        console.log(`✅ Deleted ${totalDeleted} keys`);
        return totalDeleted;

    } catch (error) {
        console.error("❌ Cache delete error:", error);
        return 0;
    }
};