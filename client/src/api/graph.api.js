import API from "./axiosInstance";

export const fetchGraph = () => API.get("/api/graphs")