"use client";

import {
    Activity,       // Pour les constantes
    Eye,            // Inspection
    Stethoscope,    // Auscultation
    Hand,           // Palpation (la main)
    Thermometer,    // Température
    HeartPulse,     // Cardio
    //Lungs,          // Pulmo (si dispo, sinon on utilise autre chose)
    Search          // Autre
} from 'lucide-react';

interface ClinicalToolbarProps {
    onAction: (actionCategory: string, actionName: string) => void;
    disabled: boolean;
}

export function ClinicalToolbar({ onAction, disabled }: ClinicalToolbarProps) {

    // Configuration des actions disponibles
    const tools = [
        {
            category: "Constantes Vitales",
            icon: <Activity size={18} className="text-blue-500" />,
            actions: ["Prise de Tension (TA)", "Fréquence Cardiaque", "Saturation O2 (SpO2)", "Température", "Fréquence Respiratoire"]
        },
        {
            category: "Inspection",
            icon: <Eye size={18} className="text-emerald-500" />,
            actions: ["État Général", "Peau et Muqueuses", "Gorge / Bouche", "Signes de détresse"]
        },
        {
            category: "Auscultation",
            icon: <Stethoscope size={18} className="text-brand-primary" />,
            actions: ["Auscultation Cardiaque", "Auscultation Pulmonaire", "Bruits intestinaux"]
        },
        {
            category: "Palpation",
            icon: <Hand size={18} className="text-purple-500" />, // Hand au lieu de Heart pour la palpation
            actions: ["Palpation Abdominale", "Pouls Périphériques", "Recherche d'œdèmes", "Ganglions (Aires ganglionnaires)"]
        }
    ];

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden shadow-sm">
            {/* En-tête */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-brand-dark text-sm uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} /> Examen Clinique
                </h3>
                <p className="text-xs text-gray-400 mt-1">Sélectionnez un geste à effectuer</p>
            </div>

            {/* Liste des actions scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {tools.map((group, idx) => (
                    <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold text-sm">
                            <div className="p-1.5 rounded-md bg-gray-50 border border-gray-100">
                                {group.icon}
                            </div>
                            {group.category}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {group.actions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => onAction(group.category, action)}
                                    disabled={disabled}
                                    className="text-left text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-100 text-gray-600 hover:bg-brand-light hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center group"
                                >
                                    {action}
                                    {/* Petite flèche qui apparait au survol */}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}