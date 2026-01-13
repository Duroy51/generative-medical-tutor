"use client";

import { Activity, Thermometer, Heart, Wind, Droplets, User, ArrowLeft } from 'lucide-react';

export interface VitalsData {
    ta?: string;   // Tension Artérielle
    fc?: string;   // Fréquence Cardiaque
    temp?: string; // Température
    spo2?: string; // Saturation O2
    fr?: string;   // Fréquence Respiratoire
    glyc?: string; // Glycémie
}

interface PatientMonitorProps {
    caseTitle: string;
    patientInfo: { age: number; sexe: string };
    vitals: VitalsData;
    onExit: () => void;
}

export function PatientMonitor({ caseTitle, patientInfo, vitals, onExit }: PatientMonitorProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm z-30 shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* 1. INFO PATIENT (Gauche) */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={onExit}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        title="Quitter"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${patientInfo.sexe === 'Homme' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-pink-50 border-pink-200 text-pink-600'}`}>
                            <User size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-brand-dark leading-tight line-clamp-1 max-w-[200px]">
                                {caseTitle}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">
                                {patientInfo.age} ans • {patientInfo.sexe}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. LE MONITEUR (Centre - Style "Machine") */}
                <div className="flex-1 flex justify-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 bg-gray-900 p-1.5 rounded-xl border border-gray-700 shadow-inner min-w-fit">
                        <VitalCard icon={Activity} label="TA" value={vitals.ta} unit="mmHg" color="text-green-400" />
                        <Divider />
                        <VitalCard icon={Heart} label="FC" value={vitals.fc} unit="bpm" color="text-red-400" />
                        <Divider />
                        <VitalCard icon={Thermometer} label="TEMP" value={vitals.temp} unit="°C" color="text-orange-400" />
                        <Divider />
                        <VitalCard icon={Droplets} label="SpO2" value={vitals.spo2} unit="%" color="text-blue-400" />
                        <Divider />
                        <VitalCard icon={Wind} label="FR" value={vitals.fr} unit="/min" color="text-cyan-400" />
                    </div>
                </div>

                {/* 3. ACTIONS (Droite) */}
                <div className="hidden md:flex w-auto justify-end">
                    <button
                        onClick={onExit}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg border border-transparent hover:border-red-100 transition-all"
                    >
                        Terminer la session
                    </button>
                </div>

            </div>
        </div>
    );
}

// Sous-composant pour une tuile de constante
function VitalCard({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="flex flex-col items-center justify-between w-14 sm:w-16 h-12 px-1">
            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                <Icon size={10} /> {label}
            </div>
            {value ? (
                <div className={`text-sm sm:text-base font-mono font-bold leading-none ${color} animate-pulse`}>
                    {value}
                </div>
            ) : (
                <div className="text-sm font-mono text-gray-700 leading-none">--</div>
            )}
            <div className="text-[8px] text-gray-600 font-medium scale-90 origin-bottom">{unit}</div>
        </div>
    );
}

function Divider() {
    return <div className="w-px bg-gray-700 my-1 opacity-50"></div>;
}