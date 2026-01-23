"use client";

import { Clock, ChevronRight } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '@/lib/categoryIcons'; // On garde le nom du lib pour l'instant, c'est compatible

interface CaseCardProps {
    title: string;
    summary: string;
    specialty: string; // <--- RENOMMÉ (était category)
    difficulty?: 'Facile' | 'Moyen' | 'Difficile';
    onClick: () => void;
}

export function CaseCard({ title, summary, specialty, difficulty = 'Moyen', onClick }: CaseCardProps) {

    const difficultyDot = {
        Facile: "bg-green-400",
        Moyen: "bg-yellow-400",
        Difficile: "bg-red-500"
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Header de la carte : Icône + Spécialité */}
            <div className="flex justify-between items-start mb-3">
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold ${getCategoryColor(specialty)}`}>
                    {getCategoryIcon(specialty)}
                    <span>{specialty}</span>
                </div>

                {/* Indicateur de difficulté */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${difficultyDot[difficulty]}`}></span>
                    {difficulty}
                </div>
            </div>

            {/* Titre */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-primary transition-colors">
                {title}
            </h3>

            {/* Résumé */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                {summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock size={14} className="text-gray-300"/>
                    <span>15 min</span>
                </div>

                <span className="text-xs font-bold text-brand-primary flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Lancer <ChevronRight size={14} />
        </span>
            </div>
        </div>
    );
}