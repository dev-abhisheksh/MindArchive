import mongoose from "mongoose";
import { Collection } from "../models/collection.model.js";
import { Content } from "../models/content.model.js";


const createCollection = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" })

        const collection = await Collection.create({
            name: name.trim(),
            description: description.trim() || "",
            userId: req.user._id,
            isDeleted: false
        })

        return res.status(201).json({
            message: `Collection: ${collection.name} is created successfully`
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to create a collection" })
    }
}

const getMyCollections = async (req, res) => {
    try {
        const collections = await Collection.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "contents",
                    localField: "_id",
                    foreignField: "collectionId",
                    as: "contents"
                }
            },
            {
                $addFields: {
                    previewContents: { $slice: ["$contents", 3] }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    previewContents: {
                        _id: 1,
                        title: 1,
                        type: 1
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.status(200).json({
            message: "Fetched your collections",
            count: collections.length,
            collections
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch collections" });
    }
};

const getCollectionById = async (req, res) => {
    try {
        const { collectionId } = req.params;

        if (!collectionId) {
            return res.status(400).json({ message: "CollectionID is required" });
        }

        const collection = await Collection.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(collectionId),
                    userId: new mongoose.Types.ObjectId(req.user._id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "contents",
                    localField: "_id",
                    foreignField: "collectionId",
                    as: "contents"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    contents: {
                        _id: 1,
                        title: 1,
                        type: 1,
                        url: 1,
                        tags: 1
                    }
                }
            }
        ]);

        if (!collection.length) {
            return res.status(404).json({ message: "Collection not found" });
        }

        return res.status(200).json({
            message: "Collection fetched successfully",
            collection: collection[0]
        });

    } catch (error) {
        console.error("Get collection error:", error);
        return res.status(500).json({ message: "Failed to fetch collection" });
    }
};

const updateCollection = async (req, res) => {
    try {
        const { collectionId } = req.params;
        const { name, description } = req.body;
        if (!collectionId) return res.status(400).json({ message: "CollectionID is required" })

        const data = {};
        if (name) data.name = name
        if (description) data.description = description

        const collection = await Collection.findByIdAndUpdate(
            collectionId,
            {
                $set: {
                    name: data.name,
                    description: data.description
                }
            },
            { new: true }
        )

        if (!collection) return res.status(404).json({ message: "Collection not found or does not exists" })

        return res.status(200).json({
            message: "Collection updated successfully",
            collection
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to update collection" })
    }
}

const addContentsToCollection = async (req, res) => {
    try {
        const { collectionId } = req.params;
        const { contentIds } = req.body;

        if (!Array.isArray(contentIds) || contentIds.length === 0) {
            return res.status(400).json({ message: "Atleast one contentId is required " })
        }

        await Promise.all(
            contentIds.map((contentId) =>
                Content.findByIdAndUpdate(
                    contentId,
                    { $set: { collectionId } },
                    { new: true }
                )
            )
        )

        return res.status(200).json({ message: "Contents added to collection successfully" });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to add contents" })
    }
}

export {
    createCollection,
    getMyCollections,
    updateCollection,
    addContentsToCollection,
    getCollectionById
}