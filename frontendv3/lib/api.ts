import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Si on reçoit une 401, on déconnecte l'utilisateur proprement
            // (Pour une V2, on implémentera le refresh token ici)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;