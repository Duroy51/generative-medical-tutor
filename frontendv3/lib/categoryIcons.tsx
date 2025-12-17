import { Heart, Activity, Brain, Stethoscope, Baby, Bone, Eye, Pill, Thermometer } from 'lucide-react';

// On accepte string, mais aussi undefined ou null pour éviter le crash
export const getCategoryIcon = (categoryName?: string | null) => {
    // SÉCURITÉ : Si pas de nom, on renvoie l'icône par défaut tout de suite
    if (!categoryName) return <Stethoscope className="text-brand-primary" />;

    const normalized = categoryName.toLowerCase();

    if (normalized.includes('cardio')) return <Heart className="text-red-500" />;
    if (normalized.includes('neuro')) return <Brain className="text-pink-500" />;
    if (normalized.includes('pédia')) return <Baby className="text-blue-400" />;
    if (normalized.includes('urgence')) return <Activity className="text-orange-500" />;
    if (normalized.includes('ortho') || normalized.includes('musculo')) return <Bone className="text-stone-500" />;
    if (normalized.includes('ophtalmo')) return <Eye className="text-cyan-500" />;
    if (normalized.includes('pharmaco') || normalized.includes('traitement')) return <Pill className="text-green-500" />;
    if (normalized.includes('infectio') || normalized.includes('viral') || normalized.includes('grippe')) return <Thermometer className="text-red-400" />;

    return <Stethoscope className="text-brand-primary" />;
};

export const getCategoryColor = (categoryName?: string | null) => {
    // SÉCURITÉ : Si pas de nom, on renvoie la couleur par défaut
    if (!categoryName) return "bg-brand-light text-brand-dark border-gray-100";

    const normalized = categoryName.toLowerCase();

    if (normalized.includes('cardio')) return "bg-red-50 text-red-700 border-red-100";
    if (normalized.includes('neuro')) return "bg-pink-50 text-pink-700 border-pink-100";
    if (normalized.includes('urgence')) return "bg-orange-50 text-orange-700 border-orange-100";
    if (normalized.includes('pédia')) return "bg-blue-50 text-blue-700 border-blue-100";
    if (normalized.includes('infectio')) return "bg-red-50 text-red-600 border-red-100";

    return "bg-brand-light text-brand-dark border-gray-100";
};