'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    
    useEffect(() => {
        const token = Cookies.get('token');
        const savedUser = Cookies.get('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const register = async (email: string, password: string) => {
        try {
            console.log('Registering user with email:', email);
            await api.post('/auth/register', { email, password });
            alert('Registration successful! Please login.');
            router.push('/login');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            // Save token and user info
            Cookies.set('token', access_token, { expires: 1 }); // 1 day
            Cookies.set('user', JSON.stringify(user), { expires: 1 });
            setUser(user);

            router.push('/dashboard');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}