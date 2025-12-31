"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    CheckCircle, XCircle, Edit3, Download, RefreshCw,
    Database, Clock, AlertCircle
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import {useAuth} from "@/context/AuthContext"; // <--- AJOUTER CET IMPORT

export default function ExpertDashboard() {
    // --- ÉTATS ---
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const router = useRouter(); // <--- AJOUTER CETTE LIGNE
    const { user, isLoading: authLoading } = useAuth();

    // Filtres
    const [filterStatus, setFilterStatus] = useState<'non_approuve' | 'approuve' | 'rejete'>('non_approuve');

    // Modale d'édition
    const [editingCase, setEditingCase] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    // --- CHARGEMENT DES DONNÉES ---
    const fetchCases = async () => {
        try {
            const res = await api.get('/cases/');
            setCases(res.data);
        } catch (e) {
            toast.error("Erreur de chargement des cas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    // --- ACTIONS GLOBALES (IMPORT/EXPORT) ---
    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Interrogation de Fultang...");
        try {
            // Astuce : ajoutez ?mock=true si vous testez en local sans Fultang
            const res = await api.post('/cases/trigger-import/');
            toast.dismiss(toastId);

            if (res.data.message.includes("Aucun nouveau")) {
                toast(res.data.message, { icon: 'ℹ️' });
            } else {
                toast.success("Nouveaux cas importés !");
                fetchCases(); // Rafraîchir la liste
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
        const toastId = toast.loading("Génération du dataset JSONL...");
        try {
            await api.post('/cases/trigger-export/');
            toast.dismiss(toastId);
            toast.success("Dataset exporté vers MinIO avec succès.");
        } catch (e) {
            toast.dismiss(toastId);
            toast.error("Erreur d'export.");
        } finally {
            setExporting(false);
        }
    };

    // --- ACTIONS SUR UN CAS (STATUS / EDIT) ---
    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/cases/${id}/`, { status: newStatus });
            toast.success(`Cas ${newStatus === 'approuve' ? 'approuvé' : 'rejeté'} !`);

            // Mise à jour optimiste locale
            setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (e) {
            toast.error("Erreur de mise à jour.");
        }
    };

    const openEditModal = (c: any) => {
        setEditingCase(c);
        setEditForm({
            case_title: c.case_title,
            case_summary: c.case_summary,
            difficulty: c.difficulty
        });
    };

    const saveEdits = async () => {
        if (!editingCase) return;
        try {
            await api.patch(`/cases/${editingCase.id}/`, editForm);
            toast.success("Modifications enregistrées.");
            setCases(prev => prev.map(c => c.id === editingCase.id ? { ...c, ...editForm } : c));
            setEditingCase(null);
        } catch (e) {
            toast.error("Erreur sauvegarde.");
        }
    };

    // Filtrage pour l'affichage
    const displayedCases = cases.filter(c => c.status === filterStatus);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>;

    return (
        <>
            {/* HEADER ADMIN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
                        <Database className="text-brand-primary" /> Administration
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez la base de connaissances et les pipelines de données.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {exporting ? <Clock className="animate-spin" size={18}/> : <Download size={18} />}
                        Exporter Dataset
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

            {/* STATS RAPIDES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">À valider</p>
                        <p className="text-2xl font-black text-orange-500">{cases.filter(c => c.status === 'non_approuve').length}</p>
                    </div>
                    <AlertCircle className="text-orange-100" size={32} />
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Approuvés</p>
                        <p className="text-2xl font-black text-green-600">{cases.filter(c => c.status === 'approuve').length}</p>
                    </div>
                    <CheckCircle className="text-green-100" size={32} />
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Rejetés</p>
                        <p className="text-2xl font-black text-red-500">{cases.filter(c => c.status === 'rejete').length}</p>
                    </div>
                    <XCircle className="text-red-100" size={32} />
                </div>
            </div>

            {/* ONGLETS DE FILTRAGE */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'non_approuve', label: 'À Valider', icon: AlertCircle },
                        { id: 'approuve', label: 'Base Active', icon: CheckCircle },
                        { id: 'rejete', label: 'Corbeille', icon: XCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id as any)}
                            className={`
                        whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                        ${filterStatus === tab.id
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${filterStatus === tab.id ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {cases.filter(c => c.status === tab.id).length}
                    </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* LISTE DES CAS */}
            <div className="space-y-4">
                {displayedCases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        Aucun cas dans cette catégorie.
                    </div>
                ) : (
                    displayedCases.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">

                            {/* Infos principales */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">
                                ID: {c.source_fultang_id}
                            </span>

                                    {/* --- CORRECTION ICI : Gestion de la clé unique --- */}
                                    {c.categories && c.categories.map((cat: any, index: number) => (
                                        <span
                                            key={cat.id || `cat-${c.id}-${index}`}
                                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded"
                                        >
                                    {cat.name || cat}
                                </span>
                                    ))}
                                    {/* ------------------------------------------------ */}

                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.case_title}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.case_summary}</p>

                                <div className="flex gap-4 text-xs text-gray-400">
                                    <span>Patient: {c.age} ans, {c.sexe}</span>
                                    <span>Difficulté: {c.difficulty || 'Non définie'}</span>
                                </div>
                            </div>

                            {/* Actions Admin */}
                            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                <button
                                    onClick={() => router.push(`/expert/cases/${c.id}`)}
                                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Edit3 size={16} /> Éditer
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
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODALE D'ÉDITION */}
            <Modal
                isOpen={!!editingCase}
                onClose={() => setEditingCase(null)}
                title="Éditer le cas clinique"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={editForm.case_title || ''}
                            onChange={e => setEditForm({...editForm, case_title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
                        <textarea
                            className="w-full p-2 border rounded-lg h-32"
                            value={editForm.case_summary || ''}
                            onChange={e => setEditForm({...editForm, case_summary: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={editForm.difficulty || 'Moyen'}
                            onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
                        >
                            <option value="Facile">Facile</option>
                            <option value="Moyen">Moyen</option>
                            <option value="Difficile">Difficile</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button onClick={() => setEditingCase(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Annuler</button>
                        <button onClick={saveEdits} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryHover">Sauvegarder</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}