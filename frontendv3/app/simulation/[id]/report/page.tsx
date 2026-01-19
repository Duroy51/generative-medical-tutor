"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { ReasoningGraph } from '@/components/expert/ReasoningGraph';
import { motion } from 'framer-motion';

// Icônes
import {
    Trophy, AlertTriangle, CheckCircle, XCircle,
    ArrowRight, Stethoscope, ChevronLeft, Download,
    Brain, Activity, ListChecks, RotateCcw, Target, Microscope
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();

    const [report, setReport] = useState<any>(null);
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- CHARGEMENT ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resReport = await api.get(`/simulations/${id}/results/`);
                setReport(resReport.data);

                // Récupérer le cas pour la "Vérité Terrain"
                const caseId = resReport.data.session_case_id || resReport.data.case_id;
                if (caseId) {
                    const resCase = await api.get(`/cases/${caseId}/`);
                    setCaseData(resCase.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Rapport indisponible");
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Génération de votre bilan...</p>
        </div>
    );

    if (!report) return null;

    // --- LOGIQUE D'AFFICHAGE ---
    const isSuccess = report.score_global >= 60;

    // Couleurs dynamiques selon le score
    const themeColor = isSuccess ? 'green' : 'orange';
    const scoreColor = isSuccess ? 'text-green-600' : 'text-orange-600';
    const borderColor = isSuccess ? 'border-green-500' : 'border-orange-500';

    // Calcul pourcentage questions posées
    const questionsTotal = Object.keys(report.key_questions_status || {}).length;
    const questionsAsked = Object.values(report.key_questions_status || {}).filter(Boolean).length;
    const questionsPercent = questionsTotal > 0 ? Math.round((questionsAsked / questionsTotal) * 100) : 0;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-sm text-gray-500 hover:text-brand-dark mb-8 transition-colors group"
                >
                    <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform"/>
                    Retour au Tableau de bord
                </button>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >

                    {/* --- 1. HERO CARD (SCORE & VERDICT) --- */}
                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-white p-0 shadow-xl shadow-brand-dark/5 border border-gray-100">
                        <div className={`absolute top-0 left-0 w-2 h-full ${isSuccess ? 'bg-green-500' : 'bg-orange-500'}`}></div>

                        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">

                            {/* Jauge Circulaire */}
                            <div className="relative flex-shrink-0">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * report.score_global) / 100}
                                            className={`${isSuccess ? 'text-green-500' : 'text-orange-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className={`text-4xl font-black ${scoreColor}`}>{report.score_global}</span>
                                    <span className="block text-xs font-bold text-gray-400 uppercase">/ 100</span>
                                </div>
                            </div>

                            {/* Texte Verdict */}
                            <div className="flex-1 text-center md:text-left">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                    {isSuccess ? <Trophy size={14}/> : <Activity size={14}/>}
                                    {isSuccess ? "Session Validée" : "À Consolider"}
                                </div>
                                <h1 className="text-3xl font-extrabold text-brand-dark mb-3">
                                    {report.diagnostic_found ? "Diagnostic Correct." : "Diagnostic Manqué."}
                                </h1>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {report.diagnostic_found
                                        ? "Félicitations, vous avez identifié la pathologie principale. Votre raisonnement était cohérent."
                                        : "Vous n'avez pas abouti à la conclusion attendue. Prenez le temps d'analyser la correction ci-dessous."}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-bold transition-colors border border-gray-200 min-w-[160px]">
                                    <Download size={18}/> Télécharger PDF
                                </button>
                                <button onClick={() => router.push(`/simulation/${id}`)} className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-brand-primary/20 min-w-[160px]">
                                    <RotateCcw size={18}/> Réessayer
                                </button>
                            </div>
                        </div>
                    </motion.div>


                    {/* --- 2. LA VÉRITÉ TERRAIN (Ce qu'il fallait trouver) --- */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Carte Diagnostic Final */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase mb-4">
                                    <Target size={16} /> Le Diagnostic Attendu
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {caseData?.diagnoses?.find((d:any) => d.is_final)?.description || "Non défini"}
                                </h3>
                                <p className="text-sm text-gray-500">C'était la conclusion prioritaire à atteindre.</p>
                            </div>
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${report.diagnostic_found ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {report.diagnostic_found ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                {report.diagnostic_found ? "Vous l'avez trouvé" : "Vous l'avez manqué"}
                            </div>
                        </div>

                        {/* Carte Efficacité Anamnèse */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-4">
                                    <ListChecks size={16} /> Efficacité de l'enquête
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-black text-brand-dark">{questionsAsked}</span>
                                    <span className="text-lg text-gray-400 font-medium mb-1">/ {questionsTotal}</span>
                                </div>
                                <p className="text-sm text-gray-500">Questions clés posées.</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${questionsPercent}%` }}></div>
                            </div>
                        </div>

                        {/* Carte Soft Skills */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase mb-4">
                                    <Brain size={16} /> Raisonnement & Empathie
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    "{report.feedback_strengths?.[0] || "Bonne attitude globale."}"
                                </p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                {report.feedback_strengths?.slice(0,2).map((s:string, i:number) => (
                                    <span key={i} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold">{s.substring(0, 15)}...</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>


                    {/* --- 3. ANALYSE PROFONDE & DÉTAILS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* GAUCHE : L'AVIS DU MENTOR (2/3) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Le texte du mentor */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                                    <Stethoscope className="text-brand-primary" size={20}/>
                                    Debriefing du Mentor
                                </h3>
                                <div className="prose prose-blue prose-sm max-w-none text-gray-600 leading-loose">
                                    {/* Affichage propre avec paragraphes */}
                                    {report.detailed_analysis.split('\n').map((paragraph: string, idx: number) => (
                                        <p key={idx} className="mb-4">{paragraph}</p>
                                    ))}
                                </div>
                            </motion.div>

                            {/* La Boîte de Verre (Graphe) */}
                            {caseData && caseData.reasoning_graph && (
                                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                                                <Activity className="text-blue-500" size={20}/> Carte Mentale du Cas
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Voici les liens logiques que vous auriez dû établir.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                                        <ReasoningGraph data={caseData.reasoning_graph} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* DROITE : CHECKLIST DÉTAILLÉE (1/3) */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Liste des Questions Clés */}
                            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
                                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <ListChecks size={18} className="text-gray-400"/> Protocole d'enquête
                                </h4>

                                <div className="space-y-3">
                                    {Object.entries(report.key_questions_status || {}).map(([question, asked]: [string, any], idx) => (
                                        <div key={idx} className="group flex items-start gap-3">
                                            <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 transition-colors ${asked ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400 group-hover:bg-red-100'}`}>
                                                {asked ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium leading-snug ${asked ? 'text-gray-700' : 'text-gray-400 line-through decoration-red-300'}`}>
                                                    {question}
                                                </p>
                                                {!asked && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Oubliée</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Axes d'amélioration rapides */}
                                {report.feedback_improvements?.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">À travailler</h5>
                                        <ul className="space-y-2">
                                            {report.feedback_improvements.map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 p-2 rounded">
                                                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>

                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}