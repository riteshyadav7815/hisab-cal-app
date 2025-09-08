import axios from 'axios';

const api = axios.create({
    baseURL: 'https://hisab-cal-app.onrender.com/api',
});

api.interceptors.request.use((config) => {
    // Check if window is defined to ensure this runs only on the client-side
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('hisab_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
