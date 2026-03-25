import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        required: true
    },

    title: String,

    url: String,

    text: String,

    tags: [String],

    embedding: [Number],

    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        default: null
    },

    summary: {
        type: String,
        maxlength: 1000
    },

    status: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending"
    },

    isPrivate: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

contentSchema.index({ userId: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({isPrivate: 1 });

export const Content = mongoose.model("Content", contentSchema)