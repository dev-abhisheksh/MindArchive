import axios from 'axios';

const getToken = () => localStorage.getItem('token');

const API = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://mindarchive.onrender.com',
})

API.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default API;