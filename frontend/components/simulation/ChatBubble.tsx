"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { User, Lightbulb, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Evaluation {
    relevance_score: number;
    pedagogical_feedback?: string;
}

interface ChatBubbleProps {
    sender: 'APPRENANT' | 'PATIENT_IA' | 'TUTEUR';
    content: string;
    evaluation?: Evaluation; // Données venant du backend
}

export function ChatBubble({ sender, content, evaluation }: ChatBubbleProps) {
    const [showFeedback, setShowFeedback] = useState(false);

    // Détection d'un feedback critique à afficher
    // On affiche si le score est faible (< 6) ET qu'il y a un texte de feedback
    const hasCriticalFeedback = sender === 'APPRENANT' &&
        evaluation &&
        evaluation.relevance_score < 6 &&
        evaluation.pedagogical_feedback;

    const styles = {
        APPRENANT: {
            container: "justify-end",
            bubble: "bg-brand-primary text-white rounded-br-none",
            icon: null,
            label: "Vous"
        },
        PATIENT_IA: {
            container: "justify-start",
            bubble: "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200"><User size={16} /></div>,
            label: "Patient"
        },
        TUTEUR: {
            // Cas rare où le tuteur parle "hors contexte" (ex: intro)
            container: "justify-center my-4",
            bubble: "bg-amber-50 border-l-4 border-amber-400 text-amber-900 w-full max-w-2xl shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Lightbulb size={18} /></div>,
            label: "Mentor"
        }
    };

    const style = styles[sender] || styles.PATIENT_IA;

    // Si c'est un message "TUTEUR" pur (ancienne méthode), on ne l'affiche plus
    // car le feedback est maintenant attaché au message de l'apprenant.
    if (sender === 'TUTEUR') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col mb-4 ${sender === 'APPRENANT' ? 'items-end' : 'items-start'}`}
        >
            <div className={`flex gap-3 ${style.container} max-w-[85%]`}>
                {sender !== 'APPRENANT' && (
                    <div className="flex-shrink-0 mt-1">
                        {style.icon}
                    </div>
                )}

                <div className={`flex flex-col ${sender === 'APPRENANT' ? 'items-end' : 'items-start'} w-full`}>
                    <span className="text-[10px] text-gray-400 mb-1 ml-1 uppercase font-bold tracking-wider">{style.label}</span>

                    <div className="relative group">
                        {/* Bulle du message principal */}
                        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${style.bubble} ${hasCriticalFeedback ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
                            <div className="markdown-content">
                                <ReactMarkdown
                                    components={{
                                        em: ({node, ...props}) => <span className="block text-gray-400 text-xs italic mb-1 border-l-2 border-gray-300 pl-2">{props.children}</span>,
                                        strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 mt-1" {...props} />,
                                        li: ({node, ...props}) => <li {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                                    }}
                                >
                                    {content.replace('(Système)', '**Système**')}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* INDICATEUR DE FEEDBACK (Pastille Rouge) */}
                        {hasCriticalFeedback && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => setShowFeedback(!showFeedback)}
                                className="absolute -bottom-3 -left-3 z-10 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer"
                                title="Le mentor a une remarque"
                            >
                                <AlertCircle size={16} fill="currentColor" className="text-white" />
                                <span className="sr-only">Voir le feedback</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* VOLET DE FEEDBACK DÉPLIANT */}
            <AnimatePresence>
                {showFeedback && hasCriticalFeedback && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden w-full max-w-[85%]" // Même largeur max que la bulle
                    >
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-900 shadow-inner flex gap-3 relative mr-1">
                            {/* Flèche décorative pointant vers le message */}
                            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-red-50 border-t border-l border-red-100 transform rotate-45"></div>

                            <div className="flex-shrink-0 mt-0.5 text-red-500">
                                <Lightbulb size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-red-700 mb-1 uppercase tracking-wider text-[10px]">Conseil du Mentor</p>
                                <p className="leading-relaxed">
                                    {evaluation?.pedagogical_feedback}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="text-red-400 hover:text-red-700 self-start"
                            >
                                <ChevronUp size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}