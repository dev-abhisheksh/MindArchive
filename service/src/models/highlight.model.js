import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
    contentId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
        required: true
    },

    text: String,

    note: String
}, { timestamps: true });

export const Highlight = mongoose.model("Highlight", highlightSchema);