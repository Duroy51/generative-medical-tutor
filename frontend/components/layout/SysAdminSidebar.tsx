"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Users, Activity, LogOut } from 'lucide-react';

export function SysAdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/sys-admin', label: 'Vue Globale', icon: Activity },
        { href: '/sys-admin/users', label: 'Utilisateurs', icon: Users },
    ];

    return (
        <div className="w-64 bg-[#1e1b4b] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-indigo-500/20 z-50">
            <div className="p-6 flex items-center gap-3 border-b border-indigo-500/20 h-16">
                <div className="bg-indigo-500 p-1.5 rounded-lg">
                    <ShieldCheck size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">SuperAdmin</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 mt-4">Système</p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}>
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-500/20">
                <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-300 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut size={18} /> Déconnexion
                </button>
            </div>
        </div>
    );
}