"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, User } from 'lucide-react'; // Importer les icônes

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/users/register/', {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName
            });

            router.push('/login?registered=true');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.username) {
                setError("Ce nom d'utilisateur est déjà pris.");
            } else if (err.response?.data?.email) {
                setError("Cette adresse email est déjà utilisée.");
            } else {
                setError("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Rejoignez notre communauté"
            subtitle="Créez votre compte pour accéder aux simulations médicales."
        >
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-slide-up">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" required />
                    <Input label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" required />
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean.dupont@med.univ"
                        required
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={16} /></span>
                    <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="jeandupont"
                        required
                        className="pl-10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Mot de passe"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <Input
                        label="Confirmation"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Créer mon compte
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-medium text-brand-primary hover:text-brand-primaryHover">
                        Se connecter
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}