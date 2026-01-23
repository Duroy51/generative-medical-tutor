"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Composants UI
import { PatientMonitor, VitalsData } from '@/components/simulation/PatientMonitor';
import { ChatBubble } from '@/components/simulation/ChatBubble';
import { SimulationWorkspace } from '@/components/simulation/SimulationWorkspace';
import { ClinicalDecision } from '@/components/simulation/ClinicalDecision';
import { Modal } from '@/components/ui/Modal';

// Hook Tutoriel Global
import { useStudentTour } from '@/hooks/useStudentTour';

import { Send, Loader2, HelpCircle, Gavel } from 'lucide-react';

export default function SimulationPage() {
    const { id } = useParams();
    const router = useRouter();

    const [messages, setMessages] = useState<any[]>([]);
    const [caseInfo, setCaseInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [vitals, setVitals] = useState<VitalsData>({});

    // Pour le tour
    const [tourReady, setTourReady] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lancement du tour
    useStudentTour({
        startCondition: tourReady,
        page: 'simulation'
    });

    // Extraction des constantes
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

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/simulations/${id}/`);
                setMessages(res.data.messages);
                setCaseInfo(res.data.case);
                setNotes(localStorage.getItem(`notes_${id}`) || ""); // Récupération notes locales (optionnel)

                res.data.messages.forEach((msg: any) => {
                    if (msg.sender === 'PATIENT_IA') updateVitalsFromMessage(msg.content);
                });

                setLoading(false);
                setTourReady(true); // Déclenche le tour
            } catch (error) {
                toast.error("Impossible de charger la simulation");
                router.push('/dashboard');
            }
        };
        fetchSession();
    }, [id, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || sending) return;

        const userMsgContent = input;
        setInput("");
        setSending(true);

        // Optimistic UI
        const tempMsg = { id: Date.now(), sender: 'APPRENANT', content: userMsgContent, evaluation: null };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await api.post(`/simulations/${id}/message/`, { content: userMsgContent });

            // La réponse contient le message IA.
            // MAIS on doit recharger la session pour avoir l'évaluation du message étudiant qui vient d'être créé
            // Car l'évaluation est asynchrone ou se fait lors du POST.
            // Si votre backend retourne l'évaluation dans la réponse du POST (ce qu'il ne fait pas encore par défaut), c'est mieux.
            // Sinon on recharge tout.

            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

            // Mise à jour constantes
            const aiMsg = sessionRes.data.messages[sessionRes.data.messages.length - 1];
            if (aiMsg.sender === 'PATIENT_IA') updateVitalsFromMessage(aiMsg.content);

        } catch (error) {
            toast.error("Erreur d'envoi");
        } finally {
            setSending(false);
        }
    };

    const handleClinicalAction = async (category: string, actionName: string) => {
        if (sending) return;
        setSending(true);

        try {
            await api.post(`/simulations/${id}/message/`, { content: `[ACTION] ${category} > ${actionName}` });
            const sessionRes = await api.get(`/simulations/${id}/`);
            setMessages(sessionRes.data.messages);

            const aiMsg = sessionRes.data.messages[sessionRes.data.messages.length - 1];
            if (aiMsg.sender === 'PATIENT_IA') updateVitalsFromMessage(aiMsg.content);
        } catch (error) {
            toast.error("Erreur action clinique");
        } finally {
            setSending(false);
        }
    };

    const handleExit = async () => {
        if(!confirm("Quitter sans valider ?")) return;
        router.push('/dashboard');
    };

    const handleFinalDiagnose = async (diagnosis: string, prescription: string) => {
        setIsDecisionModalOpen(false);
        const toastId = toast.loading("Analyse du jury...");
        try {
            await api.post(`/simulations/${id}/finish/`, { diagnosis, prescription });
            toast.dismiss(toastId);
            router.push(`/simulation/${id}/report`);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur technique.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>;

    return (
        <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
            {/* Header / Moniteur (ID pour le tour) */}
            <div id="tour-monitor">
                <PatientMonitor
                    caseTitle={caseInfo?.case_title}
                    patientInfo={{ age: caseInfo?.age || 0, sexe: caseInfo?.sexe || 'Inconnu' }}
                    vitals={vitals}
                    onExit={handleExit}
                />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Chat Area */}
                <div id="tour-chat-area" className="flex-1 flex flex-col relative bg-[#F8F9FC]">

                    {/* Bouton pour relancer le tour manuellement */}
                    <button onClick={() => { localStorage.removeItem(`hasSeenTour_simulation_v2`); window.location.reload(); }} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-brand-primary">
                        <HelpCircle size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
                        <div className="max-w-3xl mx-auto pb-24">
                            {messages.map((msg: any) => (
                                <ChatBubble
                                    key={msg.id}
                                    sender={msg.sender}
                                    content={msg.content}
                                    evaluation={msg.evaluation} // On passe l'évaluation ici !
                                />
                            ))}
                            {sending && (
                                <div className="flex gap-3 justify-start mb-4 opacity-50">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Loader2 className="animate-spin" size={16}/></div>
                                    <div className="bg-white p-3 rounded-2xl">Le patient écrit...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* FAB Diagnostic (ID pour le tour) */}
                    <div id="tour-diagnose-btn" className="absolute bottom-24 right-6 z-30">
                        <button
                            onClick={() => setIsDecisionModalOpen(true)}
                            className="flex items-center gap-3 pl-4 pr-5 py-3.5 bg-gradient-to-r from-brand-primary to-orange-600 text-white rounded-full shadow-xl hover:scale-105 transition-all"
                        >
                            <Gavel size={20} /> <span className="font-bold text-sm">DIAGNOSTIC</span>
                        </button>
                    </div>

                    {/* Input (ID pour le tour) */}
                    <div id="tour-chat-input" className="bg-white border-t border-gray-200 p-4 shadow-sm z-10">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question..."
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                    disabled={sending}
                                />
                                <button type="submit" disabled={!input.trim() || sending} className="p-3.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 transition-all">
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Workspace (ID pour le tour) */}
                <div id="tour-workspace-tools">
                    <SimulationWorkspace
                        onAction={handleClinicalAction}
                        disabled={sending}
                        messages={messages}
                        notes={notes}
                        setNotes={setNotes}
                        // hasNewTutorMessage n'est plus utile ici car c'est inline
                    />
                </div>
            </div>

            <Modal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} title="Conclusion Clinique">
                <ClinicalDecision onDiagnose={handleFinalDiagnose} onCancel={() => setIsDecisionModalOpen(false)} />
            </Modal>
        </div>
    );
}