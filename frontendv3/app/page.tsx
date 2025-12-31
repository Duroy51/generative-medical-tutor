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
                if (user.role === 'EXPERT') {
                    router.push('/expert');
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    // Affiche un écran de chargement minimaliste pendant la redirection
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-brand-primary rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
}