import API from "./axiosInstance";


export const semanticSearch = (data) => API.post(`/api/search/semantic-search`, data)