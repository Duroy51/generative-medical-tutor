"use client";

import { motion } from "framer-motion";
import { User, Lightbulb, Activity } from "lucide-react"; // J'ajoute Activity pour le système
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
    sender: 'APPRENANT' | 'PATIENT_IA' | 'TUTEUR';
    content: string;
}

export function ChatBubble({ sender, content }: ChatBubbleProps) {

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
            container: "justify-center my-4",
            bubble: "bg-amber-50 border-l-4 border-amber-400 text-amber-900 w-full max-w-2xl shadow-sm",
            icon: <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Lightbulb size={18} /></div>,
            label: "Mentor"
        }
    };

    const style = styles[sender] || styles.PATIENT_IA;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${style.container} mb-4`}
        >
            {sender !== 'APPRENANT' && (
                <div className="flex-shrink-0 mt-1">
                    {style.icon}
                </div>
            )}

            <div className={`flex flex-col ${sender === 'APPRENANT' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                {sender !== 'TUTEUR' && (
                    <span className="text-[10px] text-gray-400 mb-1 ml-1 uppercase font-bold tracking-wider">{style.label}</span>
                )}

                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${style.bubble}`}>

                    {/* RENDU MARKDOWN PERSONNALISÉ */}
                    <div className="markdown-content">
                        <ReactMarkdown
                            components={{
                                // 1. GESTION DES ASTÉRISQUES (*) -> Didascalies
                                em: ({node, ...props}) => (
                                    <span className="block text-gray-400 text-xs italic mb-1 border-l-2 border-gray-300 pl-2">
                            {props.children}
                        </span>
                                ),

                                // 2. GESTION DU GRAS (**)
                                strong: ({node, ...props}) => <span className="font-bold" {...props} />,

                                // 3. LISTES
                                ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 mt-1" {...props} />,
                                li: ({node, ...props}) => <li {...props} />,

                                // 4. PARAGRAPHES
                                // On évite les marges trop grandes sur le dernier élément
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                            }}
                        >
                            {/* Petite astuce : On remplace "(Système)" par du gras pour le mettre en valeur avant le rendu */}
                            {content.replace('(Système)', '**Système**')}
                        </ReactMarkdown>
                    </div>

                </div>
            </div>

        </motion.div>
    );
}