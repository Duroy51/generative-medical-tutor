"use client";

import { useState } from 'react';
import { AlertTriangle, FileText, Pill, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ClinicalDecisionProps {
    onDiagnose: (diagnosis: string, prescription: string) => void;
    onCancel: () => void; // Nouveau bouton annuler
}

export function ClinicalDecision({ onDiagnose, onCancel }: ClinicalDecisionProps) {
    const [diagnosis, setDiagnosis] = useState("");
    const [prescription, setPrescription] = useState("");

    const handleSubmit = () => {
        if (!diagnosis.trim()) return;
        onDiagnose(diagnosis, prescription);
    };

    return (
        <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 items-start">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-0.5">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-purple-900 text-sm">Moment de vérité</h4>
                    <p className="text-xs text-purple-700 mt-1">
                        Vous êtes sur le point de conclure ce cas. Une fois validé, vous ne pourrez plus revenir en arrière.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Zone Diagnostic */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                        <FileText size={16} className="text-brand-primary"/> Diagnostic Principal
                    </label>
                    <textarea
                        className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all h-24 resize-none shadow-sm"
                        placeholder="Ex: Paludisme simple à P. Falciparum..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Zone Prescription */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                        <Pill size={16} className="text-blue-500"/> Traitement & Conduite
                    </label>
                    <textarea
                        className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-24 resize-none shadow-sm"
                        placeholder="Ex: Coartem 4 comprimés, Paracétamol..."
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                    Annuler
                </button>
                <Button
                    onClick={handleSubmit}
                    disabled={!diagnosis.trim()}
                    className="flex-[2] bg-brand-primary hover:bg-brand-primaryHover text-white shadow-lg shadow-brand-primary/20"
                >
                    Valider le diagnostic
                </Button>
            </div>
        </div>
    );
}