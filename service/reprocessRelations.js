// scripts/reprocessRelations.js
import dotenv from "dotenv";
import { RelatedContent } from "./src/models/relatedContent.model.js";
import { Content } from "./src/models/content.model.js";
import { findRelatedContent } from "./src/services/related.service.js";
import connectDB from "./src/config/db.js";
dotenv.config();


await connectDB();

const reprocessAll = async () => {
    // Step 1: Delete all existing relations
    await RelatedContent.deleteMany({});
    console.log("Deleted all existing relations");

    // Step 2: Fetch all content that has embeddings
    const allContent = await Content.find({
        embedding: { $exists: true, $ne: [] }
    });
    console.log(`Found ${allContent.length} contents to reprocess`);

    // Step 3: For each content, find related and save
    for (const content of allContent) {
        const related = await findRelatedContent(
            content._id.toString(),
            content.embedding,
            content.userId.toString()
        );

        if (related.length > 0) {
            await Promise.all(
                related.map(r =>
                    RelatedContent.create({
                        from: content._id,
                        to: r._id,
                        relation: "semantic_similarity"
                    })
                )
            );
            console.log(`✅ ${content.title} → ${related.length} relations saved`);
        } else {
            console.log(`❌ ${content.title} → no relations found`);
        }
    }

    console.log("Done reprocessing all relations");
    process.exit(0);
}

reprocessAll();