"use client";

import { Lightbulb, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MentorSidecarProps {
    adviceId: number | null; // <--- NOUVEAU : On écoute l'ID unique
    adviceContent: string | null;
}

export function MentorSidecar({ adviceId, adviceContent }: MentorSidecarProps) {
    const [isVisible, setIsVisible] = useState(false);

    // À chaque fois que l'ID change (nouveau message), on force l'affichage
    useEffect(() => {
        if (adviceId && adviceContent) {
            setIsVisible(true);
        }
    }, [adviceId, adviceContent]); // Dépendance sur l'ID !

    if (!adviceContent) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    id="tour-mentor-sidecar"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="mx-3 mb-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm relative overflow-hidden"
                >
                    {/* Bandeau décoratif */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>

                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 animate-pulse">
                                <Lightbulb size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Question du Mentor
                </span>
                            <button
                                onClick={() => setIsVisible(false)} // Ferme uniquement ce message
                                className="absolute top-2 right-2 p-1 text-amber-400 hover:text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Contenu */}
                        <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                            {adviceContent}
                        </p>

                        <div className="mt-2 pt-2 border-t border-amber-100 text-[9px] text-amber-600/70 text-right italic">
                            Réflexion socratique
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}