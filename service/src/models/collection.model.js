import mongoose from "mongoose"

const collectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },

    description: String,

    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

collectionSchema.index({ userId: 1 });

export const Collection = mongoose.model("Collection", collectionSchema)