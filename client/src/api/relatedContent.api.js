import API from "./axiosInstance";


export const fetchRelatedContents = (contentId) => API.get(`/api/related-content/${contentId}`)