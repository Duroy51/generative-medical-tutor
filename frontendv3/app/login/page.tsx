"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/users/token/', { username, password });
            login(response.data.access, response.data.refresh);
        } catch (err: any) {
            setError('Identifiants incorrects ou erreur serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Bon retour parmi nous"
            subtitle="Connectez-vous pour accéder à vos simulations médicales."
        >
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                {/* Affichage des erreurs */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-slide-up">
                        {error}
                    </div>
                )}

                {/* Formulaire + Icônes */}
                <div className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={16} /></span>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nom d'utilisateur"
                            required
                            className="pl-10"
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            className="pl-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Link href="#" className="text-xs font-medium text-brand-primary hover:text-brand-primaryHover">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bouton d'action */}
                <div className="pt-2">
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Se connecter
                    </Button>
                </div>

                {/* Lien vers l'inscription */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="font-medium text-brand-primary hover:text-brand-primaryHover">
                        Créer un compte étudiant
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}