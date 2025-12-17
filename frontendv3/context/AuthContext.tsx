"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

interface User {
    user_id: number;
    username: string;
    role: 'APPRENANT' | 'EXPERT';
}

interface AuthContextType {
    user: User | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Vérification au chargement de la page
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Vérifier si le token est expiré
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({
                        user_id: decoded.user_id,
                        username: decoded.username,
                        role: decoded.role
                    });
                }
            } catch (e) {
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (access: string, refresh: string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        const decoded: any = jwtDecode(access);
        setUser({
            user_id: decoded.user_id,
            username: decoded.username,
            role: decoded.role
        });
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}