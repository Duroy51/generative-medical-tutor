import React from 'react';
import { Stethoscope, User, Lock } from 'lucide-react'; // Importer des icônes utiles


interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex font-sans antialiased">

            {/* --- Colonne Gauche (Image + Brand) --- */}
            <div className="hidden lg:flex lg:w-5/12 bg-brand-dark relative overflow-hidden flex-col justify-between p-12 text-white">

                {/* Animation de fond (Blobs) */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

                {/* Logo + Marque */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                        <Stethoscope size={28} className="text-brand-primary" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">MedTutor<span className="text-brand-primary">.AI</span></span>
                </div>

                {/* Texte et Image */}
                <div className="relative z-10 mt-12">
                    <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
                        Devenez un expert <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand-primary">
              en toute confiance.
            </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-sm leading-relaxed">
                        Entraînez-vous avec des patients virtuels réalistes et perfectionnez votre diagnostic dans un environnement sûr et personnalisé.
                    </p>
                </div>

                {/* Image principale (Médecin stylisé) */}
                <div className="relative z-10 mt-auto pt-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 to-transparent z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                            alt="Medical Student"
                            className="w-full h-64 object-cover object-top transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 mt-6 text-xs text-gray-500 font-medium">
                    Projet STI 5GI © 2025
                </div>
            </div>

            {/* --- COLONNE DROITE (Formulaire) --- */}
            <div className="w-full lg:w-7/12 bg-brand-light flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Titre et Sous-titre */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
                            {title}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            {subtitle}
                        </p>
                    </div>

                    {/* Inserer les formulaires enfants ici (Login/Register) */}
                    {children}
                </div>
            </div>
        </div>
    );
}