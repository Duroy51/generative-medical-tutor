"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Stethoscope, User } from 'lucide-react';

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="bg-brand-primary/10 p-2 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                            <Stethoscope size={24} className="text-brand-primary" />
                        </div>
                        <span className="text-xl font-bold text-brand-dark tracking-tight">
              MedTutor<span className="text-brand-primary">.AI</span>
            </span>
                    </Link>

                    {/* User Profile & Actions */}

                    <div className="flex items-center gap-6">
                        {user && (
                            <Link href="/profile" className="...">
                            <div className="hidden md:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-brand-dark">{user.username}</p>
                                    <p className="text-xs text-brand-muted font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                        {user.role}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-brand-light rounded-full flex items-center justify-center border border-gray-200">
                                    <User size={20} className="text-brand-muted" />
                                </div>
                            </div>
                            </Link>
                        )}

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}