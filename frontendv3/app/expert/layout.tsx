"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Sécurité : On vérifie que c'est bien un expert
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'EXPERT') {
                router.push('/dashboard'); // Si un étudiant essaie d'entrer, on le renvoie chez lui
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'EXPERT') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-brand-primary" size={32}/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Menu fixe à gauche */}
            <AdminSidebar />

            {/* Contenu principal décalé vers la droite */}
            <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}