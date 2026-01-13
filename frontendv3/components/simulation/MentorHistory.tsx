"use client";

import { Lightbulb, MessageSquareQuote } from 'lucide-react';

interface MentorHistoryProps {
    messages: any[];
}

export function MentorHistory({ messages }: MentorHistoryProps) {
    // Filtrer uniquement les messages du TUTEUR
    const tutorMessages = messages.filter((m) => m.sender === 'TUTEUR');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb size={14} /> Conseils du Mentor
                </h3>
                <span className="text-[10px] text-amber-600 font-medium">{tutorMessages.length} interventions</span>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {tutorMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-2 opacity-60">
                        <MessageSquareQuote size={32} />
                        <p className="text-xs">Aucune intervention pour le moment.<br/>Continuez comme ça !</p>
                    </div>
                ) : (
                    tutorMessages.map((msg) => (
                        <div key={msg.id} className="bg-amber-50 border border-amber-100 rounded-xl p-3 shadow-sm animate-fade-in">
                            <div className="flex gap-2 items-start">
                                <div className="mt-0.5 bg-amber-200 text-amber-700 rounded-full p-1 flex-shrink-0">
                                    <Lightbulb size={10} />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                        {msg.content.replace('🤔 Question du Mentor :', '').trim()}
                                    </p>
                                    <span className="text-[9px] text-amber-500/80 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}