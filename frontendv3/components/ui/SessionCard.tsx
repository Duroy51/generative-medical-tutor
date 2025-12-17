"use client";

import { Play, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '@/lib/categoryIcons';

interface SessionCardProps {
    session: any;
    onResume: () => void;
    onDelete: () => void;
}

export function SessionCard({ session, onResume, onDelete }: SessionCardProps) {
    // Formatage de la date
    const date = new Date(session.start_time).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    // Récupération de la catégorie du cas (si disponible)
    const categoryName = session.case.categories && session.case.categories.length > 0
        ? session.case.categories[0].name
        : "Général";

    return (
        <div className="bg-white rounded-xl p-5 border border-brand-primary/20 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">

            {/* Bandeau latéral pour indiquer "En cours" */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary"></div>

            <div className="flex justify-between items-start mb-3 pl-2">
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-semibold ${getCategoryColor(categoryName)}`}>
                    {getCategoryIcon(categoryName)}
                    <span>{categoryName}</span>
                </div>
                <span className="text-xs text-brand-primary font-bold bg-brand-primary/10 px-2 py-1 rounded-full">
            En cours
        </span>
            </div>

            <div className="pl-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-1">
                    {session.case.case_title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {date}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12}/> {session.messages.length} messages</span>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onResume}
                        className="flex-1 bg-brand-dark text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Play size={14} fill="currentColor" /> Reprendre
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer la session"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}