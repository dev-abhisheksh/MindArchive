import API from "./axiosInstance";


export const webSearch = (query) => API.post(`/api/web/web-search`, { query });