"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import {
    Trophy, AlertTriangle, CheckCircle, XCircle,
    ArrowRight, Stethoscope, ChevronLeft, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/simulations/${id}/results/`);
                setReport(res.data);
            } catch (error) {
                console.error("Erreur chargement rapport", error);
                // Si pas de rapport, retour au dashboard
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, router]);

    if (loading) return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    // Calcul de la couleur du score
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 50) return "text-orange-500 bg-orange-50 border-orange-200";
        return "text-red-500 bg-red-50 border-red-200";
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* --- HEADER DE NAVIGATION --- */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-sm text-gray-500 hover:text-brand-dark mb-6 transition-colors group"
                >
                    <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform"/>
                    Retour au Dashboard
                </button>

                {/* --- 1. SECTION HERO (SCORE) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-wider">
                            Rapport de Session
                        </span>
                                <span className="text-gray-400 text-sm">
                            {new Date(report.created_at).toLocaleDateString()}
                        </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
                                Bilan de compétences
                            </h1>
                            <p className="text-gray-500 max-w-lg">
                                Voici l'analyse détaillée de votre performance par le système tuteur.
                            </p>
                        </div>

                        {/* Score Badge */}
                        <div className={`flex flex-col items-center justify-center h-32 w-32 rounded-full border-4 ${getScoreColor(report.score_global)}`}>
                            <span className="text-3xl font-black">{report.score_global}</span>
                            <span className="text-xs font-bold uppercase">Sur 100</span>
                        </div>
                    </div>
                </motion.div>

                {/* --- 2. DIAGNOSTIC & SYNTHÈSE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Colonne Gauche : Diagnostic */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className={`h-full rounded-2xl p-6 border ${report.diagnostic_found ? 'bg-green-600 text-white border-green-600' : 'bg-white border-red-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                {report.diagnostic_found ? <CheckCircle size={28} className="text-green-200"/> : <XCircle size={28} className="text-red-500"/>}
                                <h3 className={`text-lg font-bold ${report.diagnostic_found ? 'text-white' : 'text-gray-900'}`}>
                                    Diagnostic
                                </h3>
                            </div>

                            <p className={`text-sm mb-2 ${report.diagnostic_found ? 'text-green-100' : 'text-gray-500'}`}>
                                Résultat de votre démarche :
                            </p>
                            <p className={`text-2xl font-bold ${report.diagnostic_found ? 'text-white' : 'text-red-600'}`}>
                                {report.diagnostic_found ? "Trouvé" : "Manqué"}
                            </p>

                            {!report.diagnostic_found && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                                    Le diagnostic correct n'a pas été explicitement formulé ou validé à la fin de la session.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Colonne Droite : Analyse textuelle */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                    >
                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-dark mb-4">
                            <Stethoscope size={20} className="text-brand-primary"/>
                            Analyse du Professeur
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {report.detailed_analysis}
                        </p>
                    </motion.div>
                </div>

                {/* --- 3. POINTS FORTS & FAIBLES --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Points Forts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm"
                    >
                        <h3 className="flex items-center gap-2 font-bold text-green-700 mb-4">
                            <Trophy size={18} /> Points Forts
                        </h3>
                        <ul className="space-y-3">
                            {report.feedback_strengths.map((point: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Axes d'amélioration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm"
                    >
                        <h3 className="flex items-center gap-2 font-bold text-orange-700 mb-4">
                            <AlertTriangle size={18} /> Axes d'amélioration
                        </h3>
                        <ul className="space-y-3">
                            {report.feedback_improvements.map((point: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* --- 4. CHECKLIST DES QUESTIONS CLÉS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                >
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-brand-dark">Conformité des Questions Clés</h3>
                        <p className="text-xs text-gray-500">Comparaison avec le protocole attendu</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {Object.entries(report.key_questions_status || {}).map(([question, asked]: [string, any]) => (
                            <div key={question} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <span className="text-sm text-gray-700 font-medium">{question}</span>
                                {asked ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <CheckCircle size={14} /> Posée
                            </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                <XCircle size={14} /> Oubliée
                            </span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* --- ACTIONS --- */}
                <div className="mt-8 flex justify-end gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Download size={18} /> Exporter en PDF
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        Nouvelle Simulation <ArrowRight size={18} />
                    </button>
                </div>

            </main>
        </div>
    );
}