"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Composants UI
import { PatientMonitor, VitalsData } from '@/components/simulation/PatientMonitor';
import { ChatBubble } from '@/components/simulation/ChatBubble';
import { SimulationWorkspace } from '@/components/simulation/SimulationWorkspace';
import { MentorSidecar } from '@/components/simulation/MentorSidecar';
import { ClinicalDecision } from '@/components/simulation/ClinicalDecision';
import { Modal } from '@/components/ui/Modal';

// Hook Tutoriel
import { useSimulationTour } from '@/hooks/useSimulationTour';

// Icônes
import { Send, Loader2, User, Stethoscope, HelpCircle, Gavel } from 'lucide-react';

export default function SimulationPage() {
    const { id } = useParams();
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [messages, setMessages] = useState<any[]>([]);
    const [caseInfo, setCaseInfo] = useState<any>(null);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false); // Modale Diagnostic

    // --- ÉTATS WORKSPACE & MONITEUR ---
    const [notes, setNotes] = useState("");
    const [lastTutorMsgCount, setLastTutorMsgCount] = useState(0);
    const [vitals, setVitals] = useState<VitalsData>({});

    // --- ÉTAT DU TOUR ---
    const [runTour, setRunTour] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lancement du tour interactif
    useSimulationTour(runTour, setRunTour);

    // --- LOGIQUE D'EXTRACTION DES CONSTANTES (REGEX) ---
    const updateVitalsFromMessage = (content: string) => {
        const newVitals: VitalsData = {};

        const taMatch = content.match(/(?:TA|Tension|BP|Pression)\s*[:=]?\s*(\d{2,3}\/\d{2,3})/i);
        if (taMatch) newVitals.ta = taMatch[1];

        const fcMatch = content.match(/(?:FC|Fréquence Cardiaque|Pouls|Pulse|HR)\s*[:=]?\s*(\d{2,3})/i);
        if (fcMatch) newVitals.fc = fcMatch[1];

        const tempMatch = content.match(/(?:Température|Temp|T°)\s*[:=]?\s*(\d{2}(?:[\.,]\d)?)/i);
        if (tempMatch) newVitals.temp = tempMatch[1].replace(',', '.');

        const spo2Match = content.match(/(?:SpO2|Saturation|Sat)\s*[:=]?\s*(\d{2,3})/i);
        if (spo2Match) newVitals.spo2 = spo2Match[1];

        const frMatch = content.match(/(?:FR|Fréquence Respiratoire|Resp)\s*[:=]?\s*(\d{2})/i);
        if (frMatch) newVitals.fr = frMatch[1];

        const glycMatch = content.match(/(?:Glycémie|Dextro|Sucre)\s*[:=]?\s*([\d\.,]+)/i);
        if (glycMatch) newVitals.glyc = glycMatch[1].replace(',', '.');

        if (Object.keys(newVitals).length > 0) {
            setVitals(prev => ({ ...prev, ...newVitals }));
        }
    };

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/simulations/${id}/`);
                setMessages(res.data.messages);
                setCaseInfo(res.data.case);

                // Repeupler le moniteur si on revient sur la page
                res.data.messages.forEach((msg: any) => {
                    if (msg.sender === 'PATIENT_IA') updateVitalsFromMessage(msg.content);
                });

                setLoading(false);

                // Auto-start du tour
                const hasSeenTour = localStorage.getItem('hasSeenSimulationTour');
                if (!hasSeenTour) {
                    setTimeout(() => setRunTour(true), 1500);
                    localStorage.setItem('hasSeenSimulationTour', 'true');
                }

            } catch (error) {
                toast.error("Impossible de charger la simulation");
                router.push('/dashboard');
            }
        };
        fetchSession();
    }, [id, router]);

    // --- SCROLL AUTO ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- FILTRAGE MESSAGES ---
    const chatMessages = messages.filter((m: any) => m.sender !== 'TUTEUR');

    // Logique Mentor Sidecar
    const tutorMessages = messages.filter((m: any) => m.sender === 'TUTEUR');
    const lastTutorMessage = tutorMessages.length > 0 ? tutorMessages[tutorMessages.length - 1] : null;
    const tutorContent = lastTutorMessage ? lastTutorMessage.content.replace('🤔 Question du Mentor :', '').trim() : null;
    const tutorId = lastTutorMessage ? lastTutorMessage.id : null;

    const hasNewTutorMessage = tutorMessages.length > lastTutorMsgCount;
    useEffect(() => { setLastTutorMsgCount(tutorMessages.length); }, [tutorMessages.length]);

    // --- HANDLER MESSAGE TEXTE ---
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || sending) return;

        const userMsgContent = input;
        setInput("");
        setSending(true);

        const tempMsg = { id: Date.now(), sender: 'APPRENANT', content: userMsgContent };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await api.post(`/simulations/${id}/message/`, { content: userMsgContent });
            const aiMsg = res.data;
            setMessages(prev => [...prev, aiMsg]);

            if (aiMsg.sender === 'PATIENT_IA') updateVitalsFromMessage(aiMsg.content);

            // Refresh pour le tuteur
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            toast.error("Erreur d'envoi");
        } finally {
            setSending(false);
        }
    };

    // --- HANDLER ACTION CLINIQUE ---
    const handleClinicalAction = async (category: string, actionName: string) => {
        if (sending) return;
        setSending(true);

        const tempMsg = {
            id: Date.now(),
            sender: 'APPRENANT',
            content: `🩺 EXAMEN : ${actionName} (${category})`
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await api.post(`/simulations/${id}/message/`, { content: `[ACTION] ${category} > ${actionName}` });
            const aiMsg = res.data;

            setMessages(prev => [...prev, aiMsg]);
            updateVitalsFromMessage(aiMsg.content);

            // Refresh pour le tuteur
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

        } catch (error) {
            toast.error("Erreur action clinique");
        } finally {
            setSending(false);
        }
    };

    // --- FIN DE SESSION SIMPLE ---
    const handleExit = async () => {
        if(!confirm("Quitter sans valider le diagnostic ?")) return;
        router.push('/dashboard');
    };

    // --- FIN DE SESSION AVEC DIAGNOSTIC (MODALE) ---
    const handleFinalDiagnose = async (diagnosis: string, prescription: string) => {
        setIsDecisionModalOpen(false);
        const toastId = toast.loading("Analyse de votre diagnostic...");

        try {
            // 1. Envoi du diagnostic comme message système
            await api.post(`/simulations/${id}/message/`, {
                content: `[DIAGNOSTIC FINAL] : ${diagnosis}. [TRAITEMENT] : ${prescription}`
            });

            // 2. Clôture et génération rapport
            await api.post(`/simulations/${id}/finish/`);

            toast.dismiss(toastId);
            toast.success("Terminé !");
            router.push(`/simulation/${id}/report`);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur technique");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>;

    return (
        <div className="h-screen flex flex-col bg-brand-light overflow-hidden">

            {/* 1. HEADER MONITEUR (Tour: #tour-header-patient) */}
            <div id="tour-header-patient">
                <PatientMonitor
                    caseTitle={caseInfo?.case_title}
                    patientInfo={{ age: caseInfo?.age || 0, sexe: caseInfo?.sexe || 'Inconnu' }}
                    vitals={vitals}
                    onExit={handleExit}
                />
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* COLONNE GAUCHE : CHAT (Tour: #tour-chat-area) */}
                <div id="tour-chat-area" className="flex-1 flex flex-col relative bg-[#F8F9FC]">

                    {/* Bouton Aide */}
                    <button
                        onClick={() => setRunTour(true)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur text-brand-primary rounded-full shadow-sm hover:bg-white transition-all"
                        title="Relancer le tutoriel"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
                        <div className="max-w-3xl mx-auto pb-4">

                            {/* Sidecar Mentor (Tour: #tour-mentor-sidecar) */}
                            <div className="sticky top-0 z-10 pointer-events-none">
                                <div className="pointer-events-auto">
                                    <MentorSidecar adviceId={tutorId} adviceContent={tutorContent} />
                                </div>
                            </div>

                            <div className="flex justify-center my-8">
                        <span className="bg-white border border-gray-200 text-gray-400 text-xs px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <Stethoscope size={12} /> Début de la consultation
                        </span>
                            </div>

                            {chatMessages.map((msg: any) => (
                                <ChatBubble key={msg.id} sender={msg.sender} content={msg.content} />
                            ))}

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

                    {/* BOUTON FLOTTANT DIAGNOSTIC (Nouveau) */}
                    <div className="absolute bottom-24 right-6 z-30">
                        <button
                            onClick={() => setIsDecisionModalOpen(true)}
                            className="group flex items-center gap-3 pl-4 pr-5 py-3.5 bg-gradient-to-r from-brand-primary to-orange-600 text-white rounded-full shadow-2xl shadow-brand-primary/40 hover:scale-105 hover:shadow-brand-primary/60 transition-all duration-300"
                        >
                            <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                                <Gavel size={20} className="text-white" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">POSER LE DIAGNOSTIC</span>
                        </button>
                    </div>

                    {/* Input Zone */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question au patient..."
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none text-brand-dark"
                                    autoFocus
                                    disabled={sending}
                                />
                                <button type="submit" disabled={!input.trim() || sending} className="p-3.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : WORKSPACE (Tour: IDs inclus dans le composant) */}
                <SimulationWorkspace
                    onAction={handleClinicalAction}
                    disabled={sending}
                    messages={messages}
                    notes={notes}
                    setNotes={setNotes}
                    hasNewTutorMessage={hasNewTutorMessage}
                    onDiagnose={() => {}} // Non utilisé car déplacé dans la modale, mais gardé pour compatibilité prop
                />

            </div>

            {/* MODALE DE DÉCISION CLINIQUE */}
            <Modal
                isOpen={isDecisionModalOpen}
                onClose={() => setIsDecisionModalOpen(false)}
                title="Conclusion Clinique"
            >
                <ClinicalDecision
                    onDiagnose={handleFinalDiagnose}
                    onCancel={() => setIsDecisionModalOpen(false)}
                />
            </Modal>

        </div>
    );
}