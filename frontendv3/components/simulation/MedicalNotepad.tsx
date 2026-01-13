"use client";

import { PenLine } from 'lucide-react';

interface MedicalNotepadProps {
    notes: string;
    setNotes: (notes: string) => void;
}

export function MedicalNotepad({ notes, setNotes }: MedicalNotepadProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-yellow-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-yellow-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <PenLine size={14} /> Notes Cliniques
                </h3>
                <span className="text-[10px] text-yellow-600 font-medium">Brouillon personnel</span>
            </div>

            {/* Zone de texte */}
            <div className="flex-1 p-0 relative">
        <textarea
            className="w-full h-full p-4 resize-none outline-none text-sm text-gray-700 leading-relaxed bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-white"
            placeholder="Notez ici vos observations, hypothèses et éléments clés..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            spellCheck={false}
        />
                {/* Petit guide en bas */}
                <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 pointer-events-none">
                    Vos notes ne sont pas vues par le patient
                </div>
            </div>
        </div>
    );
}