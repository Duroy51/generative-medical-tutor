"use client";

import { motion } from "framer-motion";
import { User, Stethoscope, Lightbulb } from "lucide-react";

interface ChatBubbleProps {
    sender: 'APPRENANT' | 'PATIENT_IA' | 'TUTEUR';
    content: string;
}

export function ChatBubble({ sender, content }: ChatBubbleProps) {

    // Configuration du style selon l'expéditeur
    const styles = {
        APPRENANT: {
            container: "justify-end",
            bubble: "bg-brand-primary text-white rounded-br-none",
            icon: null, // Pas d'icône pour soi-même, juste la bulle
            label: "Vous"
        },
        PATIENT_IA: {
            container: "justify-start",
            bubble: "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200"><User size={16} /></div>,
            label: "Patient"
        },
        TUTEUR: {
            container: "justify-center my-4", // Centré pour l'intervention
            bubble: "bg-amber-50 border-l-4 border-amber-400 text-amber-900 w-full max-w-2xl shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Lightbulb size={18} /></div>,
            label: "Mentor Socratique"
        }
    };

    const style = styles[sender] || styles.PATIENT_IA;
    const isTutor = sender === 'TUTEUR';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${style.container} mb-4`}
        >
            {/* Icône à gauche pour le Patient ou Tuteur */}
            {sender !== 'APPRENANT' && (
                <div className="flex-shrink-0 mt-1">
                    {style.icon}
                </div>
            )}

            <div className={`flex flex-col ${sender === 'APPRENANT' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <span className="text-xs text-gray-400 mb-1 ml-1">{style.label}</span>

                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${style.bubble}`}>
                    {/* Si c'est le tuteur, on met un titre */}
                    {isTutor && <div className="font-bold text-amber-700 mb-1 flex items-center gap-2"><Lightbulb size={14}/> Intervention Pédagogique</div>}
                    {content}
                </div>
            </div>

        </motion.div>
    );
}