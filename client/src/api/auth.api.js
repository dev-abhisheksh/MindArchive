import API from "./axiosInstance";

export const login = (data) => API.post("/api/auth/login", data)
export const register = (data) => API.post("/api/auth/register", data)
export const verifyOTP = (data) => API.post("/api/auth/verify-otp", data)