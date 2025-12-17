"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

// Composants
import { Navbar } from '@/components/layout/Navbar';
import { ChatBubble } from '@/components/simulation/ChatBubble';
import { ClinicalToolbar } from '@/components/simulation/ClinicalToolbar';

// Icônes
import { Send, ArrowLeft, Loader2, User, Stethoscope } from 'lucide-react';
import toast from "react-hot-toast";

export default function SimulationPage() {
    const { id } = useParams(); // ID de la session
    const router = useRouter();

    // États
    const [messages, setMessages] = useState<any[]>([]);
    const [caseInfo, setCaseInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");

    const handleFinish = async () => {
        if(!confirm("Voulez-vous vraiment terminer la session et voir le rapport ?")) return;

        // On peut afficher un loader global ici
        const toastId = toast.loading("Génération du rapport d'analyse...");

        try {
            const res = await api.post(`/simulations/${id}/finish/`);
            toast.dismiss(toastId);
            toast.success("Rapport généré !");

            // Redirection vers la page de résultats
            // Note: L'endpoint renvoie { report_id: ... } mais on utilise l'id de la session dans l'URL pour plus de simplicité
            router.push(`/simulation/${id}/report`);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur lors de la génération du rapport.");
        }
    };

    // Référence pour le scroll automatique
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/simulations/${id}/`);
                setMessages(res.data.messages);
                setCaseInfo(res.data.case);
                setLoading(false);
            } catch (error) {
                console.error("Erreur chargement session", error);
                alert("Impossible de charger la simulation");
                router.push('/dashboard');
            }
        };
        fetchSession();
    }, [id, router]);

    // --- 2. SCROLL AUTOMATIQUE ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. ENVOI DE MESSAGE TEXTE (Dialogue) ---
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || sending) return;

        const userMsgContent = input;
        setInput("");
        setSending(true);

        // Optimistic Update : On affiche le message tout de suite
        const tempMsg = { id: Date.now(), sender: 'APPRENANT', content: userMsgContent };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await api.post(`/simulations/${id}/message/`, { content: userMsgContent });

            // On recharge tout pour avoir la réponse IA + éventuelle intervention Tuteur
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'envoi.");
        } finally {
            setSending(false);
        }
    };

    // --- 4. ACTION CLINIQUE (Barre d'outils) ---
    const handleClinicalAction = async (category: string, actionName: string) => {
        if (sending) return;
        setSending(true);

        // Message visuel spécial pour l'action
        const tempMsg = {
            id: Date.now(),
            sender: 'APPRENANT',
            content: `🩺 EXAMEN : ${actionName} (${category})`
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // On envoie le "Prompt caché" au backend : [ACTION] Categorie > Action
            // Le backend détectera ce préfixe et changera le comportement du LLM
            await api.post(`/simulations/${id}/message/`, {
                content: `[ACTION] ${category} > ${actionName}`
            });

            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'action clinique.");
        } finally {
            setSending(false);
        }
    };

    // --- RENDU : LOADING ---
    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-brand-light">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
                <p className="text-brand-muted font-medium">Préparation du patient...</p>
            </div>
        </div>
    );

    // --- RENDU : PAGE PRINCIPALE ---
    return (
        <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
            <Navbar />

            {/* HEADER DU CAS (Fixe en haut) */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-brand-dark leading-tight">{caseInfo?.case_title}</h1>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full tracking-wide">
                        En cours
                    </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">{caseInfo?.case_summary}</p>
                    </div>
                </div>

                <button
                    onClick={handleFinish}
                    className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                >
                    Terminer la session
                </button>
            </div>

            {/* ZONE PRINCIPALE (Flex Row) */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* COLONNE GAUCHE : CHAT (Prend toute la place disponible) */}
                <div className="flex-1 flex flex-col relative bg-[#F8F9FC]">

                    {/* Zone de messages (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 scroll-smooth">
                        <div className="max-w-3xl mx-auto pb-4">

                            {/* Badge de début */}
                            <div className="flex justify-center my-8">
                        <span className="bg-white border border-gray-200 text-gray-400 text-xs px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <Stethoscope size={12} /> Début de la consultation
                        </span>
                            </div>

                            {/* Liste des messages */}
                            {messages.map((msg: any) => (
                                <ChatBubble
                                    key={msg.id}
                                    sender={msg.sender}
                                    content={msg.content}
                                />
                            ))}

                            {/* Indicateur de frappe (Patient ou Système) */}
                            {sending && (
                                <div className="flex gap-3 justify-start mb-4 animate-fade-in">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                                        <User size={16} />
                                    </div>
                                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Zone de saisie (Fixe en bas) */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Posez une question au patient..."
                                        className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none text-brand-dark placeholder:text-gray-400"
                                        autoFocus
                                        disabled={sending}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || sending}
                                    className="p-3.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-gray-400 mt-2">
                                MedTutor AI - Simulation à but éducatif. Ne remplace pas un avis médical réel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : BARRE D'OUTILS (Largeur fixe) */}
                <ClinicalToolbar onAction={handleClinicalAction} disabled={sending} />

            </div>
        </div>
    );
}