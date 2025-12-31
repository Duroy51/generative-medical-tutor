"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Database, FileText, Settings, LogOut, Stethoscope
} from 'lucide-react';

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/expert', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        // On pourra ajouter d'autres pages plus tard si besoin
        // { href: '/expert/stats', label: 'Statistiques', icon: FileText },
    ];

    return (
        <div className="w-64 bg-brand-dark text-white flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-white/10 h-16">
                <div className="bg-brand-primary p-1.5 rounded-lg">
                    <Stethoscope size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">MedAdmin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                    Gestion
                </p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="mb-4 px-4">
                    <p className="text-xs text-gray-500 uppercase font-bold">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-white">Expert</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}