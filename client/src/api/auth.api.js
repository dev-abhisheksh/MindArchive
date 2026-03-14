import API from "./axiosInstance";

export const login = (data) => API.post("/api/auth/login", data)