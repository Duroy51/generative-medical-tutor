"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useStudentTour } from '@/hooks/useStudentTour'; // <--- 1. IMPORT DU HOOK

import {
    User, Mail, Calendar, Award, TrendingUp, AlertTriangle,
    CheckCircle, ListTodo, Shield, Star, Activity, ChevronLeft
} from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- 2. ACTIVATION DE L'ONBOARDING ---
    // Se lance une fois que les données sont chargées (!loading)
    useStudentTour({
        startCondition: !loading,
        page: 'profile'
    });

    useEffect(() => {
        api.get('/users/me/').then(res => {
            setUserData(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Chargement du profil...</div>;
    if (!userData) return <div className="h-screen flex items-center justify-center text-red-500">Erreur de chargement.</div>;

    const analysis = userData?.detailed_analysis || {};
    const hasAnalysis = Object.keys(analysis).length > 0;

    // Calcul niveau global
    const skills = userData?.skill_matrix || {};
    const skillValues: number[] = Object.values(skills).map((s:any) => s.level);
    const avgLevel = skillValues.length ? (skillValues.reduce((a, b) => a + b, 0) / skillValues.length).toFixed(1) : "0.0";

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-20">

            {/* Container principal */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* BOUTON RETOUR */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors group mb-2"
                >
                    <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform"/>
                    Retour au Dashboard
                </button>

                {/* 1. CARTE D'IDENTITÉ (Cible du Tour : #profile-header) */}
                <div
                    id="profile-header"
                    className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-brand-primary/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-purple-600"></div>

                    <div className="h-24 w-24 rounded-full bg-gray-50 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
                        <User size={48} />
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-extrabold text-brand-dark">{userData.first_name} {userData.last_name}</h1>
                        <p className="text-gray-500 font-medium">@{userData.username}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <Badge icon={Shield} label={userData.role} color="bg-indigo-50 text-indigo-700 border-indigo-100" />
                            <Badge icon={Mail} label={userData.email} color="bg-gray-50 text-gray-600 border-gray-100" />
                            <Badge icon={Calendar} label={`Inscrit le ${new Date(userData.date_joined).toLocaleDateString()}`} color="bg-gray-50 text-gray-600 border-gray-100" />
                        </div>
                    </div>

                    <div className="text-center bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[150px]">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Niveau Global</div>
                        <div className="text-5xl font-black text-brand-primary">{avgLevel}</div>
                        <div className="text-xs font-bold text-gray-500 mt-1">{analysis.estimated_level || "Novice"}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. DÉTAIL DES COMPÉTENCES (Cible du Tour : #profile-stats) */}
                    <div id="profile-stats" className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500"/> Compétences
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(skills).map(([name, data]: [string, any]) => (
                                    <div key={name}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-bold text-gray-700">{name}</span>
                                            <span className="font-mono text-gray-500 font-bold">{data.level}<span className="text-xs text-gray-300">/100</span></span>
                                        </div>
                                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.level}%` }}></div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1 text-right font-medium">{data.sessions} simulations</div>
                                    </div>
                                ))}
                                {Object.keys(skills).length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Aucune donnée de simulation.</p>}
                            </div>
                        </div>
                    </div>

                    {/* 3. RAPPORT DU COACH (Cible du Tour : #profile-ai-coach) */}
                    <div id="profile-ai-coach" className="lg:col-span-2 space-y-6">
                        {!hasAnalysis ? (
                            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 flex flex-col items-center gap-4">
                                <BrainIconPlaceholder />
                                <p className="max-w-md">Continuez à pratiquer pour débloquer l'analyse détaillée du Coach IA. Il a besoin de plus de données pour vous évaluer.</p>
                            </div>
                        ) : (
                            <>
                                {/* Conseils Stratégiques */}
                                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                        <Star className="text-yellow-400 fill-yellow-400" /> Plan d'action personnalisé
                                    </h3>
                                    <ul className="space-y-4 relative z-10">
                                        {analysis.strategic_advice?.map((advice: string, i: number) => (
                                            <li key={i} className="flex gap-4 items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                                <ListTodo className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                                                <span className="font-medium text-indigo-50 leading-relaxed text-sm">{advice}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Forces */}
                                    <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm h-full">
                                        <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                            <Award size={20} className="text-green-600"/> Vos Atouts
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.strengths_detailed?.map((s: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-600 bg-green-50/50 p-2 rounded-lg">
                                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5"/>
                                                    <span className="leading-snug">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Faiblesses */}
                                    <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm h-full">
                                        <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-orange-600"/> Points de Vigilance
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.weaknesses_detailed?.map((w: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-600 bg-orange-50/50 p-2 rounded-lg">
                                                    <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5"/>
                                                    <span className="leading-snug">{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

function Badge({ icon: Icon, label, color }: any) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold border ${color}`}>
            <Icon size={14} /> {label}
        </span>
    );
}

function BrainIconPlaceholder() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
    )
}