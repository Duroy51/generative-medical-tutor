"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {TrendingUp} from "lucide-react";

interface HistoryChartProps {
    sessions: any[]; // La liste brute des sessions
}

export function HistoryChart({ sessions }: HistoryChartProps) {

    // On prépare les données : Score par Date
    // On inverse pour avoir du plus ancien au plus récent
    const data = [...sessions].reverse().map((s) => ({
        date: new Date(s.start_time).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
        score: s.report ? s.report.score_global : 0, // On suppose que le serializer renvoie le rapport
        name: s.case.case_title
    })).filter(d => d.score > 0); // On ne garde que les sessions finies

    if (data.length < 2) return null; // Pas assez de données pour une courbe

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-primary"/> Historique de Performance
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: '#D97706', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#D97706"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#D97706', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}