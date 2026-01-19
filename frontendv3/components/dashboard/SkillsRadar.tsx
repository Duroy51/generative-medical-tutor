"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Trophy, Star } from "lucide-react";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryIcons"; // On réutilise nos icônes

interface SkillProps {
    skillMatrix: Record<string, { level: number, sessions: number }>;
}

export function SkillProgression({ skillMatrix }: SkillProps) {

    // Transformation des données : On trie par niveau décroissant
    const skills = Object.entries(skillMatrix || {})
        .map(([name, data]) => ({
            name,
            score: data.level, // Score sur 100
            sessions: data.sessions,
            // Calcul du "Rang" basé sur le score
            rank: data.level < 30 ? "Novice"
                : data.level < 60 ? "Interne"
                    : data.level < 85 ? "Confirmé"
                        : "Expert"
        }))
        .sort((a, b) => b.score - a.score); // Les meilleurs en haut

    // Fonction pour la couleur de la barre
    const getBarColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 50) return "bg-brand-primary";
        return "bg-orange-400";
    };

    if (skills.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <Trophy size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Vos compétences apparaîtront ici après votre première simulation.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={20}/>
                    Progression
                </h3>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {skills.length} Spécialités
        </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                {skills.map((skill, index) => (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        {/* Header de la ligne */}
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${getCategoryColor(skill.name)} bg-opacity-10 border-none`}>
                                    {getCategoryIcon(skill.name)}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800 block">{skill.name}</span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase">{skill.rank} • {skill.sessions} Sessions</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black text-brand-dark">{skill.score}</span>
                                <span className="text-[10px] text-gray-400">/100</span>
                            </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.score}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full rounded-full ${getBarColor(skill.score)} relative`}
                            >
                                {/* Petit effet de brillance sur la barre */}
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30"></div>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}