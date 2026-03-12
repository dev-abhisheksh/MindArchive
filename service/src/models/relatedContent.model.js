// models/GraphEdge.js
import mongoose from "mongoose";

const relatedContentSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content"
    },

    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content"
    },

    relation: String
}, { timestamps: true });

export const RelatedContent = mongoose.model("RelatedContent", relatedContentSchema);