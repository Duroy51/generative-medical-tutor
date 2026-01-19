"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

interface User {
    user_id: number;
    username: string;
    // AJOUT DE 'ADMIN' ICI
    role: 'APPRENANT' | 'EXPERT' | 'ADMIN';
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
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
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

        // --- MISE À JOUR DE L'AIGUILLAGE ICI ---
        if (decoded.role === 'ADMIN') {
            router.push('/sys-admin'); // Vers le Dashboard Admin
        } else if (decoded.role === 'EXPERT') {
            router.push('/expert');    // Vers le Dashboard Expert
        } else {
            router.push('/dashboard'); // Vers le Dashboard Apprenant
        }
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