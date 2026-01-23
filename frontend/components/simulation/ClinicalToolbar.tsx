"use client";

import {
    Activity,       // Constantes
    Eye,            // Inspection
    Stethoscope,    // Auscultation
    Hand,           // Palpation
    Microscope,     // Examens
    Thermometer,    // Température
    Search
} from 'lucide-react';

interface ClinicalToolbarProps {
    onAction: (category: string, actionName: string) => void;
    disabled: boolean;
}

export function ClinicalToolbar({ onAction, disabled }: ClinicalToolbarProps) {

    // Ordre clinique logique : On regarde, on mesure, on touche, on écoute.
    const tools = [
        {
            category: "1. Inspection Générale",
            icon: <Eye size={18} className="text-emerald-600" />,
            actions: [
                "État Général & Conscience",
                "Peau et Muqueuses (Coloration)",
                "Faciès & Regard",
                "Gorge / Bouche",
                "Marche & Posture",
                "Signes de détresse respiratoire"
            ]
        },
        {
            category: "2. Constantes Vitales",
            icon: <Activity size={18} className="text-blue-600" />,
            actions: [
                "Prise de Tension (TA)",
                "Fréquence Cardiaque (Pouls)",
                "Fréquence Respiratoire",
                "Température",
                "Saturation O2 (SpO2)",
                "Glycémie Capillaire (Dextro)"
            ]
        },
        {
            category: "3. Palpation",
            icon: <Hand size={18} className="text-purple-600" />,
            actions: [
                "Palpation Abdominale",
                "Pouls Périphériques",
                "Recherche d'œdèmes (Godet)",
                "Aires Ganglionnaires",
                "Palpation des reliefs osseux"
            ]
        },
        {
            category: "4. Auscultation",
            icon: <Stethoscope size={18} className="text-brand-primary" />,
            actions: [
                "Auscultation Cardiaque",
                "Auscultation Pulmonaire",
                "Bruits intestinaux (Hydro-aériques)",
                "Souffles vasculaires"
            ]
        },
        {
            category: "Examens Spécifiques",
            icon: <Microscope size={18} className="text-gray-600" />,
            actions: [
                "Examen Neurologique (Réflexes)",
                "Examen ORL (Otoscope)",
                "Bandelette Urinaire",
                "ECG (Électrocardiogramme)"
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-brand-dark text-xs uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} /> Actes Cliniques
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">Sélectionnez un geste</span>
            </div>

            {/* Liste Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
                {tools.map((group, idx) => (
                    <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>

                        {/* Titre de catégorie */}
                        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-gray-50/80 rounded-lg text-gray-800 font-bold text-xs uppercase tracking-wide border border-gray-100">
                            {group.icon}
                            {group.category}
                        </div>

                        {/* Boutons d'action */}
                        <div className="grid grid-cols-1 gap-1">
                            {group.actions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => onAction(group.category.replace(/^[0-9].\s/, ''), action)}
                                    disabled={disabled}
                                    className="text-left text-xs font-medium px-3 py-2.5 rounded-lg border border-transparent text-gray-600 hover:bg-brand-light hover:text-brand-primary hover:border-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center group"
                                >
                                    {action}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary font-bold">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Marge de fin pour le scroll */}
                <div className="h-4"></div>
            </div>
        </div>
    );
}