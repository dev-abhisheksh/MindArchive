// models/GraphEdge.js
import mongoose from "mongoose";

const edgeSchema = new mongoose.Schema({
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

export const GraphEdge = mongoose.model("GraphEdge", edgeSchema);