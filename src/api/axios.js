import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Agar 401 xatolik bo'lsa va bu qayta urinish bo'lmasa
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                // Backend strukturangizga mos: { refresh: "token" }
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh/`, { 
                    refresh: refreshToken 
                });
                
                const newAccessToken = res.data.data.access; // res.data.data chunki wrapper bor
                localStorage.setItem('access_token', newAccessToken);
                
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Agar refresh token ham eskigan bo'lsa, hammasini tozalab login'ga
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;