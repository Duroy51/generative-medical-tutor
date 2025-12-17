"use client";

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface SkillsRadarProps {
    skillMatrix: Record<string, { level: number, sessions: number }> | null;
}

// Catégories par défaut à afficher pour un nouvel utilisateur (Score 0)
const DEFAULT_CATEGORIES = [
    "Cardiologie",
    "Pneumologie",
    "Infectiologie",
    "Neurologie",
    "Urgences",
    "Pédiatrie"
];

export function SkillsRadar({ skillMatrix }: SkillsRadarProps) {

    // 1. TRANSFORMATION DES DONNÉES
    let data = [];

    if (!skillMatrix || Object.keys(skillMatrix).length === 0) {
        // CAS 1 : Nouvel utilisateur (Matrice vide) -> On affiche les défauts à 0
        data = DEFAULT_CATEGORIES.map(cat => ({
            subject: cat,
            A: 0,
            fullMark: 100,
        }));
    } else {
        // CAS 2 : Utilisateur avec données
        data = Object.entries(skillMatrix).map(([category, stats]) => ({
            subject: category,
            A: stats.level,
            fullMark: 100,
            sessions: stats.sessions
        }));

        // 2. GESTION DU TROP-PLEIN (Scalabilité)
        // Un radar chart devient illisible avec > 8 axes.
        // Stratégie : On trie par niveau et on garde le Top 6 pour montrer le "Profil Dominant".
        if (data.length > 6) {
            // On trie pour avoir les compétences les plus fortes en premier
            data.sort((a, b) => b.A - a.A);
            // On garde les 6 premières
            data = data.slice(0, 6);
        }
    }

    // Sécurité pour le rendu graphique (il faut au moins 3 points pour faire un polygone)
    // Si après filtrage on a moins de 3 catégories, on ajoute des placeholders
    while (data.length < 3) {
        data.push({ subject: " ", A: 0, fullMark: 100, sessions: 0 });
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[350px]">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-brand-dark">Profil de Compétences</h3>
                    <p className="text-xs text-gray-400">
                        {Object.keys(skillMatrix || {}).length > 6
                            ? "Top 6 de vos domaines maîtrisés"
                            : "Niveau moyen par spécialité"}
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />

                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
                        />

                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />

                        <Radar
                            name="Niveau"
                            dataKey="A"
                            stroke="#D97706" // Orange Brand
                            strokeWidth={3}
                            fill="#D97706"
                            fillOpacity={0.2}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [`${value}/100`, 'Niveau']}
                            labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Message si vide (optionnel, pour guider) */}
                {(!skillMatrix || Object.keys(skillMatrix).length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs text-brand-primary font-medium mt-20">
                            Commencez une simulation pour voir votre progression
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}