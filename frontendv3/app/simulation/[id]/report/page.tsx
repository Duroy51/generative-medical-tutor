"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { ReasoningGraph } from '@/components/expert/ReasoningGraph';
import {
    Trophy, XCircle, CheckCircle, ArrowRight,
    Activity, Brain, ListChecks, RotateCcw
} from 'lucide-react';

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();

    const [report, setReport] = useState<any>(null);
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // On récupère le rapport ET les données du cas (pour le graphe)
                const resReport = await api.get(`/simulations/${id}/results/`);
                setReport(resReport.data);

                // On a besoin du cas pour afficher le graphe de correction
                const resCase = await api.get(`/cases/${resReport.data.session_case_id || resReport.data.case_id}/`); // Adapter selon votre serializer
                setCaseData(resCase.data);

            } catch (error) {
                console.error("Erreur chargement", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-brand-light">Analyse des performances...</div>;
    if (!report) return <div className="h-screen flex items-center justify-center">Rapport introuvable.</div>;

    const isSuccess = report.score_global >= 50;

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* --- HEADER : SCORE & VERDICT --- */}
                <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 mb-8 text-center md:text-left">
                    {/* Arrière-plan décoratif */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/4 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
                                <Activity size={14} /> Rapport de fin de session
                            </div>
                            <h1 className="text-4xl font-extrabold text-brand-dark mb-2">
                                {isSuccess ? "Bien joué !" : "Diagnostic manqué."}
                            </h1>
                            <p className="text-lg text-gray-500 max-w-lg">
                                {report.diagnostic_found
                                    ? "Vous avez correctement identifié la pathologie principale."
                                    : "Vous n'avez pas formulé le bon diagnostic final."}
                            </p>
                        </div>

                        {/* Cercle de Score */}
                        <div className="flex flex-col items-center">
                            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${isSuccess ? 'border-green-100 text-green-600' : 'border-red-100 text-red-600'}`}>
                                <span className="text-4xl font-black">{report.score_global}</span>
                                <div className="absolute -bottom-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                                    SUR 100
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ANALYSE DÉTAILLÉE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Colonne Gauche : Synthèse */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. L'Analyse Textuelle du Tuteur */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                                <Brain className="text-brand-primary" size={20}/> Analyse du Mentor
                            </h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {report.detailed_analysis}
                            </p>
                        </div>

                        {/* 2. La "Boîte de Verre" (Graphe) pour l'étudiant */}
                        {caseData && caseData.reasoning_graph && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <h3 className="text-lg font-bold text-brand-dark mb-2 flex items-center gap-2">
                                    <Activity className="text-blue-500" size={20}/> La logique du cas
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">Voici le cheminement clinique idéal pour ce patient.</p>

                                {/* On réutilise le composant graphique en lecture seule */}
                                <ReasoningGraph data={caseData.reasoning_graph} />
                            </div>
                        )}
                    </div>

                    {/* Colonne Droite : Checklists */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Points Forts / Faibles */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Points clés</h4>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Points Forts</span>
                                    <ul className="mt-2 space-y-2">
                                        {report.feedback_strengths.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                <div>
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">À Améliorer</span>
                                    <ul className="mt-2 space-y-2">
                                        {report.feedback_improvements.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Checklist des questions obligatoires */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ListChecks size={18}/> Questions Clés
                            </h4>
                            <div className="space-y-3">
                                {Object.entries(report.key_questions_status || {}).map(([question, asked]: [string, any]) => (
                                    <div key={question} className={`p-3 rounded-lg border flex items-start gap-3 ${asked ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        {asked ? <CheckCircle size={16} className="text-green-600 mt-0.5" /> : <XCircle size={16} className="text-red-500 mt-0.5" />}
                                        <span className={`text-sm ${asked ? 'text-green-800' : 'text-red-800'}`}>{question}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER ACTIONS --- */}
                <div className="flex justify-center gap-4 mt-12">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-white border border-gray-300 text-brand-dark font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Retour au Dashboard
                    </button>
                    <button
                        onClick={() => router.push(`/simulation/${id}`)} // Attention: il faudrait une logique pour "Recommencer" proprement
                        className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        <RotateCcw size={18} /> Réessayer ce cas
                    </button>
                </div>

            </main>
        </div>
    );
}