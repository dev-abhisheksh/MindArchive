import API from "./axiosInstance";

export const verifyPin = (pin) => API.post(`/api/content/vault/verify-pin`, { pin });

export const checkVaultPin = () => API.get(`/api/content/vault/check-pin`);

export const fetchPrivateVaultContents = () => API.get(`/api/content/vault/private-contents`);

export const toggleVault = (contentId) => API.post(`/api/content/vault/toggle/${contentId}`);

export const setVaultPin = (pin) => API.post(`/api/content/vault/set-pin`, { pin });
