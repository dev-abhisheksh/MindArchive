import API from "./axiosInstance";


export const fetchContent = () => API.get("/api/content/my-content")
export const fetchContentDetails = () => API.get("/")
export const contentById = (id) => API.get(`/api/content/${id}`)
export const deleteContent = (id) => API.delete(`/api/content/delete/${id}`)