"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SysAdminSidebar } from '@/components/layout/SysAdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (user.role !== 'ADMIN') router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'ADMIN') {
        return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;
    }

    return (
        <div className="min-h-screen bg-indigo-50/30 flex">
            <SysAdminSidebar />
            <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">{children}</main>
        </div>
    );
}