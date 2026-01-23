"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useStudentTour } from '@/hooks/useStudentTour'; // <--- 1. IMPORT DU HOOK

// Composants UI
import { Navbar } from '@/components/layout/Navbar';
import { CaseCard } from '@/components/ui/CaseCard';
import { SessionCard } from '@/components/ui/SessionCard';
import { Modal } from '@/components/ui/Modal';
import { SkillProgression } from '@/components/dashboard/SkillsRadar';

// Icônes
import { Search, Sparkles, Stethoscope, LayoutGrid, History, Play, Activity } from 'lucide-react';

// Interfaces
interface Category {
    id: number;
    name: string;
}

interface ClinicalCase {
    id: number;
    case_title: string;
    case_summary: string;
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    categories: Category[]; // ou specialties selon votre backend
}

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [cases, setCases] = useState<ClinicalCase[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'explore' | 'history'>('explore');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startingSim, setStartingSim] = useState(false);

    // --- ÉTATS MODALE ---
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [conflictData, setConflictData] = useState<{caseId: number, sessionId: number} | null>(null);

    // --- 2. ACTIVATION DE L'ONBOARDING ---
    // Ne se lance que si le chargement est terminé (!loading)
    // Le hook vérifie lui-même le localStorage pour ne pas se relancer à chaque fois.
    useStudentTour({
        startCondition: !loading,
        page: 'dashboard'
    });

    // --- CHARGEMENT ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // On charge tout en parallèle
                const [userRes, casesRes, catsRes, sessionsRes] = await Promise.all([
                    api.get('/users/me/'),
                    api.get('/cases/'),
                    api.get('/specialties/'),
                    api.get('/simulations/')
                ]);

                setUserStats(userRes.data.skill_matrix);
                setCases(casesRes.data);
                setCategories(catsRes.data);
                setSessions(sessionsRes.data);
            } catch (error) {
                console.error("Erreur de chargement", error);
                toast.error("Impossible de charger les données du tableau de bord.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- ACTIONS SIMULATION ---
    const handleStartSimulation = async (caseId?: number) => {
        setStartingSim(true);
        const toastLoading = toast.loading("Préparation du patient...");

        try {
            const payload = caseId ? { case_id: caseId } : {};
            const res = await api.post('/simulations/start/', payload);

            toast.dismiss(toastLoading);

            if (res.status === 200) {
                // Conflit : Session existante
                setConflictData({ caseId: caseId!, sessionId: res.data.id });
                setIsConflictModalOpen(true);
            } else {
                // Succès : Nouvelle session
                router.push(`/simulation/${res.data.id}`);
            }
        } catch (error) {
            toast.dismiss(toastLoading);
            toast.error("Erreur lors du démarrage.");
        } finally {
            setStartingSim(false);
        }
    };

    const confirmResume = () => {
        if (conflictData) {
            setIsConflictModalOpen(false);
            router.push(`/simulation/${conflictData.sessionId}`);
        }
    };

    const confirmRestart = async () => {
        if (!conflictData) return;
        setIsConflictModalOpen(false);
        const toastId = toast.loading("Réinitialisation...");

        try {
            const payload = { case_id: conflictData.caseId, force_new: true };
            const res = await api.post('/simulations/start/', payload);
            toast.dismiss(toastId);
            router.push(`/simulation/${res.data.id}`);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Erreur redémarrage.");
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if(!confirm("Supprimer cette session de l'historique ?")) return;
        try {
            await api.delete(`/simulations/${sessionId}/`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            toast.success("Session supprimée.");
        } catch (error) {
            toast.error("Erreur suppression.");
        }
    };

    // --- FILTRAGE ---
    const filteredCases = cases.filter(c => {
        const caseCats: any[] = (c as any).specialties || c.categories || [];
        const matchesCategory = selectedCategory
            ? caseCats.some((cat: any) => cat.name === selectedCategory)
            : true;
        const matchesSearch = c.case_title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECTION SUPÉRIEURE (HERO + PROGRESSION) --- */}
                <div className="mb-10 animate-slide-up">
                    {/* 3. ID POUR LE TOUR : student-welcome */}
                    <h1 id="student-welcome" className="text-3xl font-extrabold text-brand-dark mb-6">
                        Bonjour, <span className="text-brand-primary">{user?.username}</span> 👋
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 4. ID POUR LE TOUR : student-hero-action */}
                        <div
                            id="student-hero-action"
                            onClick={() => handleStartSimulation()}
                            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-brand-dark text-white p-8 md:p-10 shadow-2xl shadow-brand-primary/10 group cursor-pointer transition-transform hover:scale-[1.005] flex flex-col justify-center min-h-[280px]"
                        >
                            {/* Effets de fond */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary rounded-full mix-blend-screen filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-4 border border-brand-primary/20">
                                        <Sparkles size={14} /> Mode Aléatoire
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                                        Prêt pour la <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-400">Garde de Nuit ?</span>
                                    </h2>
                                    <p className="text-gray-400 max-w-md text-sm md:text-base mb-6">
                                        Un patient arrive aux urgences. Vous ne connaissez rien de lui. Testez vos réflexes cliniques en conditions réelles.
                                    </p>
                                    <button className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg w-full md:w-auto justify-center">
                                        {startingSim ? 'Lancement...' : 'Prendre le patient'} <Stethoscope size={18} />
                                    </button>
                                </div>
                                <div className="hidden md:block opacity-90 group-hover:rotate-6 transition-transform duration-500 bg-white/5 p-6 rounded-full backdrop-blur-sm border border-white/10">
                                    <Activity className="text-brand-primary h-16 w-16" />
                                </div>
                            </div>
                        </div>

                        {/* 5. ID POUR LE TOUR : student-skills-radar */}
                        <div id="student-skills-radar" className="lg:col-span-1 h-full min-h-[280px]">
                            <SkillProgression skillMatrix={userStats} />
                        </div>
                    </div>
                </div>

                {/* --- NAVIGATION SECONDAIRE (ONGLETS) --- */}
                {/* 6. ID POUR LE TOUR : student-library-tabs */}
                <div id="student-library-tabs" className="flex items-center justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                activeTab === 'explore'
                                    ? 'bg-brand-dark text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <LayoutGrid size={16} /> Bibliothèque
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                activeTab === 'history'
                                    ? 'bg-brand-dark text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <History size={16} /> Mes Sessions
                            {sessions.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'history' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                            {sessions.length}
                        </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- CONTENU DYNAMIQUE --- */}

                {/* TAB 1 : EXPLORER */}
                {activeTab === 'explore' && (
                    <div className="animate-fade-in">
                        {/* Filtres */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${!selectedCategory ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    Tout
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${selectedCategory === cat.name ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un cas..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Grille Cases */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-gray-100"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredCases.map((c) => (
                                    <CaseCard
                                        key={c.id}
                                        title={c.case_title}
                                        summary={c.case_summary}
                                        specialty={
                                            ((c as any).specialties && (c as any).specialties.length > 0) ? (c as any).specialties[0].name :
                                                (c.categories && c.categories.length > 0) ? c.categories[0].name : "Général"
                                        }
                                        difficulty={c.difficulty}
                                        onClick={() => handleStartSimulation(c.id)}
                                    />
                                ))}
                                {filteredCases.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Search className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                        <p>Aucun cas ne correspond à votre recherche.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2 : HISTORIQUE */}
                {activeTab === 'history' && (
                    <div className="animate-fade-in">
                        {sessions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Aucune session en cours</h3>
                                <p className="text-gray-500 text-sm mt-1">Lancez une simulation depuis la bibliothèque pour commencer.</p>
                                <button onClick={() => setActiveTab('explore')} className="mt-6 text-brand-primary font-bold text-sm hover:underline">
                                    Explorer la bibliothèque
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sessions.map((session) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onResume={() => router.push(`/simulation/${session.id}`)}
                                        onDelete={() => handleDeleteSession(session.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- MODALE --- */}
                <Modal
                    isOpen={isConflictModalOpen}
                    onClose={() => setIsConflictModalOpen(false)}
                    title="Simulation déjà en cours"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Vous avez déjà une session active pour ce cas clinique. Vous pouvez la reprendre ou tout recommencer.
                        </p>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={confirmResume}
                                className="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={18} fill="currentColor" /> Reprendre la session
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs uppercase font-bold">ou</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <button
                                onClick={confirmRestart}
                                className="w-full py-3 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:border-red-100 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                                Recommencer à zéro
                            </button>
                        </div>
                    </div>
                </Modal>

            </main>
        </div>
    );
}