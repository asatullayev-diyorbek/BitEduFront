import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user_info');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const res = await api.post('/auth/login/', credentials);
            const { access, refresh, user: userData } = res.data.data;

            // Ma'lumotlarni saqlash
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_info', JSON.stringify(userData));

            setUser(userData);
            return userData.role; // "STUDENT" yoki "ADMIN"
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            // Logout API ga refresh tokenni yuboramiz (backend talab qilsa)
            await api.post('/auth/logout/', { refresh });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.clear();
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};