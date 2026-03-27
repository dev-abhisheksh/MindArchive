import API from "./axiosInstance";


export const fetchCollections = () => API.get("/api/collection/")
export const fetchCollectionById = (collectionId) => API.get(`/api/collection/${collectionId}`)
export const addContentsToCollection = (collectionId, contentIds) => API.patch(`/api/collection/add/${collectionId}`, { contentIds });
export const createCollection = (data) => API.post(`/api/collection`, data)

export const updateCollection = (collectionId, data) => API.patch(`/api/collection/${collectionId}`, data)

export const hardDeleteCollection = (collectionId) => API.delete(`/api/collection/delete/${collectionId}`)