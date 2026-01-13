"use client";

import { useState } from 'react';
import { ClinicalToolbar } from './ClinicalToolbar';
import { MedicalNotepad } from './MedicalNotepad';
import { MentorHistory } from './MentorHistory';
import { Activity, FileEdit, Lightbulb } from 'lucide-react';

interface SimulationWorkspaceProps {
    onAction: (category: string, actionName: string) => void;
    disabled: boolean;
    messages: any[];
    notes: string;
    setNotes: (n: string) => void;
    hasNewTutorMessage?: boolean;
}

export function SimulationWorkspace({
                                        onAction, disabled, messages, notes, setNotes, hasNewTutorMessage
                                    }: SimulationWorkspaceProps) {

    const [activeTab, setActiveTab] = useState<'tools' | 'notes' | 'mentor'>('tools');

    const tabs = [
        { id: 'tools', label: 'Actes', icon: Activity },
        { id: 'notes', label: 'Notes', icon: FileEdit },
        { id: 'mentor', label: 'Mentor', icon: Lightbulb, alert: hasNewTutorMessage },
    ];

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl z-20 w-80 lg:w-96 transition-all duration-300">
            <div className="flex border-b border-gray-200 bg-gray-50">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            id={`tour-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                        flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all relative
                        ${isActive
                                ? 'bg-white text-brand-primary border-t-2 border-brand-primary'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                    `}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            {tab.alert && !isActive && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse border border-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-hidden relative bg-white">
                {activeTab === 'tools' && <ClinicalToolbar onAction={onAction} disabled={disabled} />}
                {activeTab === 'notes' && <MedicalNotepad notes={notes} setNotes={setNotes} />}
                {activeTab === 'mentor' && <MentorHistory messages={messages} />}
            </div>
        </div>
    );
}