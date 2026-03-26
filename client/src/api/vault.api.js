import API from "./axiosInstance";

export const verifyPin = (pin) => API.post(`/api/content/vault/verify-pin`, { pin });

export const fetchPrivateVaultContents = () => API.get(`/api/content/vault/private-contents`);
