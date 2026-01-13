"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    CheckCircle, XCircle, Edit3, Download, RefreshCw,
    Database, Clock, AlertCircle, Filter, Search
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function ExpertDashboard() {
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [cases, setCases] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);

    // --- FILTRES ---
    const [filterStatus, setFilterStatus] = useState<'non_approuve' | 'approuve' | 'rejete'>('non_approuve');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('');

    // --- MODALE DE REJET ---
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        api.get('/categories/').then(res => setCategories(res.data)).catch(console.error);
        fetchCases();
    }, []);

    // --- 2. RÉCUPÉRATION DES CAS ---
    const fetchCases = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('categories', filterCategory);
            if (filterDifficulty) params.append('difficulty', filterDifficulty);

            const res = await api.get(`/cases/?${params.toString()}`);
            setCases(res.data);
        } catch (e) {
            toast.error("Erreur de chargement des cas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, [filterCategory, filterDifficulty]);


    // --- 3. ACTIONS GLOBALES ---
    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Interrogation de Fultang...");
        try {
            const res = await api.post('/cases/trigger-import/');
            toast.dismiss(toastId);

            if (res.data.message.includes("Aucun nouveau")) {
                toast(res.data.message, { icon: 'ℹ️' });
            } else {
                toast.success("Nouveaux cas importés !");
                fetchCases();
            }
        } catch (e) {
            toast.dismiss(toastId);
            toast.error("Erreur lors de l'import.");
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        const toastId = toast.loading("Génération du dataset...");
        try {
            await api.post('/cases/trigger-export/');
            toast.dismiss(toastId);
            toast.success("Dataset exporté sur MinIO.");
        } catch (e) {
            toast.dismiss(toastId);
            toast.error("Erreur d'export.");
        } finally {
            setExporting(false);
        }
    };

    // --- 4. GESTION DES STATUTS ---
    const handleUpdateStatus = async (id: number, newStatus: string) => {
        if (newStatus === 'rejete') {
            setRejectingId(id);
            return;
        }
        await executeStatusUpdate(id, newStatus);
    };

    const executeStatusUpdate = async (id: number, newStatus: string, reason?: string) => {
        try {
            const payload: any = { status: newStatus };
            if (reason) payload.rejection_reason = reason;

            await api.patch(`/cases/${id}/`, payload);

            toast.success(`Cas mis à jour : ${newStatus}`);
            setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, rejection_reason: reason } : c));

            setRejectingId(null);
            setRejectReason("");
        } catch (e) {
            toast.error("Erreur technique.");
        }
    };

    const displayedCases = cases.filter(c => c.status === filterStatus);

    if (loading && cases.length === 0) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <>
            {/* HEADER ADMIN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
                        <Database className="text-brand-primary" /> Administration
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Pilotage de la base de connaissances et flux de validation.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {exporting ? <Clock className="animate-spin" size={18}/> : <Download size={18} />}
                        Exporter
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50"
                    >
                        {importing ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18} />}
                        Importer Fultang
                    </button>
                </div>
            </div>

            {/* --- STATS RAPIDES (La barre que vous vouliez) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Carte À VALIDER */}
                <div
                    onClick={() => setFilterStatus('non_approuve')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'non_approuve' ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">À Valider</p>
                        <p className="text-3xl font-black text-orange-500 mt-1">{cases.filter(c => c.status === 'non_approuve').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                        <AlertCircle size={24} />
                    </div>
                </div>

                {/* Carte APPROUVÉS */}
                <div
                    onClick={() => setFilterStatus('approuve')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'approuve' ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Approuvés</p>
                        <p className="text-3xl font-black text-green-600 mt-1">{cases.filter(c => c.status === 'approuve').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <CheckCircle size={24} />
                    </div>
                </div>

                {/* Carte REJETÉS */}
                <div
                    onClick={() => setFilterStatus('rejete')}
                    className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${filterStatus === 'rejete' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'}`}
                >
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rejetés</p>
                        <p className="text-3xl font-black text-red-500 mt-1">{cases.filter(c => c.status === 'rejete').length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                        <XCircle size={24} />
                    </div>
                </div>
            </div>

            {/* FILTRES AVANCÉS */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <Filter size={16} /> Filtres :
                </div>

                <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white transition-colors outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[200px]"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white transition-colors outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[150px]"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                    <option value="">Toutes difficultés</option>
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                </select>

                {(filterCategory || filterDifficulty) && (
                    <button
                        onClick={() => { setFilterCategory(''); setFilterDifficulty(''); }}
                        className="text-xs text-red-500 font-bold hover:underline ml-auto"
                    >
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* BARRE D'ONGLETS (Navigation secondaire) */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'non_approuve', label: 'File d\'attente' },
                        { id: 'approuve', label: 'Base Active' },
                        { id: 'rejete', label: 'Corbeille' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id as any)}
                            className={`
                        whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                        ${filterStatus === tab.id
                                ? 'border-brand-primary text-brand-primary font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* LISTE DES CAS */}
            <div className="space-y-4">
                {displayedCases.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                        Aucun cas trouvé.
                    </div>
                ) : (
                    displayedCases.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                ID: {c.source_fultang_id}
                            </span>

                                    {c.categories && c.categories.map((cat: any, index: number) => (
                                        <span key={cat.id || index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                                    {cat.name || cat}
                                </span>
                                    ))}

                                    {c.difficulty && (
                                        <span className={`px-2 py-1 text-xs font-bold rounded border ${
                                            c.difficulty === 'Difficile' ? 'bg-red-50 text-red-700 border-red-100' :
                                                c.difficulty === 'Facile' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                    {c.difficulty}
                                </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.case_title}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.case_summary}</p>

                                <div className="flex gap-4 text-xs text-gray-400 font-mono">
                                    <span>{c.age} ans • {c.sexe}</span>
                                </div>

                                {c.status === 'rejete' && c.rejection_reason && (
                                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex items-start gap-2">
                                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                                        <div>
                                            <span className="font-bold">Motif du rejet :</span> {c.rejection_reason}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                                <button
                                    onClick={() => router.push(`/expert/cases/${c.id}`)}
                                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Edit3 size={16} /> Voir / Éditer
                                </button>

                                {c.status === 'non_approuve' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(c.id, 'approuve')}
                                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={16} /> Approuver
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(c.id, 'rejete')}
                                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-50 text-red-700 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={16} /> Rejeter
                                        </button>
                                    </>
                                )}

                                {c.status === 'approuve' && (
                                    <button
                                        onClick={() => handleUpdateStatus(c.id, 'non_approuve')}
                                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-orange-50 text-orange-700 text-sm font-bold rounded-lg hover:bg-orange-100 transition-colors"
                                    >
                                        <AlertCircle size={16} /> Suspendre
                                    </button>
                                )}

                                {c.status === 'rejete' && (
                                    <button
                                        onClick={() => handleUpdateStatus(c.id, 'non_approuve')}
                                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <RefreshCw size={16} /> Restaurer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODALE DE REJET */}
            <Modal
                isOpen={!!rejectingId}
                onClose={() => { setRejectingId(null); setRejectReason(""); }}
                title="Rejeter ce cas"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100 flex gap-2">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        Vous êtes sur le point de rejeter ce cas. Merci d'indiquer la raison pour aider nos équipes.
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Motif du rejet</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none text-sm resize-none"
                            placeholder="Ex: Données cliniques incohérentes, diagnostic erroné, manque de détails..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => rejectingId && executeStatusUpdate(rejectingId, 'rejete', rejectReason)}
                            disabled={!rejectReason.trim()}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            Confirmer le rejet
                        </button>
                    </div>
                </div>
            </Modal>

        </>
    );
}