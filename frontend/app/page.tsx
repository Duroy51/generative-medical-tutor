"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // --- MISE À JOUR DE L'AIGUILLAGE ICI AUSSI ---
                if (user.role === 'ADMIN') {
                    router.push('/sys-admin');
                } else if (user.role === 'EXPERT') {
                    router.push('/expert');
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-indigo-600 rounded-full mb-4"></div> {/* Changé en Indigo pour l'admin */}
            </div>
        </div>
    );
}