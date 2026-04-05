import axios from 'axios';
import { toast } from 'react-hot-toast';

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
        
        // ── 1. REFRESH TOKEN LOGIKASI ──
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh/`, { 
                    refresh: refreshToken 
                });
                
                const newAccessToken = res.data.data.access;
                localStorage.setItem('access_token', newAccessToken);
                
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        // ── 2. GLOBAL AQLLI XATOLIK USHLAGICH (TOAST) ──
        if (error.response && error.response.status !== 401) {
            const responseData = error.response.data;
            let finalMessage = "Kutilmagan xatolik yuz berdi";

            // Sening backend wrapperingga qaraymiz: { "data": { ... } } yoki to'g'ridan-to'g'ri { ... }
            const errorBody = responseData?.data || responseData;

            if (errorBody && typeof errorBody === 'object') {
                // A) Agar tayyor "message" yoki "detail" bo'lsa
                if (errorBody.message || errorBody.detail) {
                    finalMessage = errorBody.message || errorBody.detail;
                } 
                // B) Agar validation xatosi bo'lsa (Masalan: email: ["already exists"])
                else {
                    const errorFields = Object.keys(errorBody);
                    if (errorFields.length > 0) {
                        const firstField = errorFields[0];
                        const firstError = errorBody[firstField];
                        
                        // Massiv bo'lsa birinchisini olamiz, string bo'lsa o'zini
                        const cleanError = Array.isArray(firstError) ? firstError[0] : firstError;
                        finalMessage = `${firstField}: ${cleanError}`;
                    }
                }
            }

            // Toast chiqarish (Vazmin va professional dizayn)
            toast.error(finalMessage.toString().toUpperCase(), {
                style: {
                    borderRadius: '15px',
                    background: '#1e293b',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '900',
                    letterSpacing: '0.5px',
                    padding: '16px 24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    maxWidth: '400px'
                },
                duration: 4000
            });
        } else if (!error.response) {
            toast.error("TARMOQ BILAN ALOQA YO'Q!");
        }

        return Promise.reject(error);
    }
);

export default api;