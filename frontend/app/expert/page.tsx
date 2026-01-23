"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    CheckCircle, XCircle, Edit3, Download, RefreshCw,
    Database, Clock, AlertCircle, Filter, Search, ChevronDown, ChevronUp,
    Stethoscope, Activity, FileText, AlertTriangle, HelpCircle
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useExpertTour } from '@/hooks/useExpertTour'; // Import du tutoriel

// --- CONFIGURATION DES CHAMPS DE REJET ---
const REJECTION_FIELDS = [
    { key: 'case_title', label: 'Titre' },
    { key: 'case_summary', label: 'Résumé / Scénario' },
    { key: 'age', label: 'Âge / Sexe' },
    { key: 'symptoms', label: 'Symptômes' },
    { key: 'history', label: 'Antécédents' },
    { key: 'exams', label: 'Examens / Signes' },
    { key: 'diagnosis', label: 'Diagnostic' },
    { key: 'logic', label: 'Logique / Graphe' }
];

export default function ExpertDashboard() {
    const router = useRouter();

    // --- ÉTATS DONNÉES ---
    const [cases, setCases] = useState<any[]>([]);
    const [specialties, setSpecialties] = useState<any[]>([]);

    // --- ÉTATS UI ---
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);

    // --- FILTRES ---
    const [filterStatus, setFilterStatus] = useState<'non_approuve' | 'approuve' | 'rejete'>('non_approuve');
    const [filterSpecialty, setFilterSpecialty] = useState<string>(''); // ID de la spécialité
    const [filterDifficulty, setFilterDifficulty] = useState<string>('');
    const [filterAge, setFilterAge] = useState<string>('');
    const [filterSymptom, setFilterSymptom] = useState<string>('');
    const [filterDiagnosis, setFilterDiagnosis] = useState<string>('');

    // --- MODALE DE REJET (ÉTATS COMPLEXES) ---
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectGlobalComment, setRejectGlobalComment] = useState("");
    const [selectedRejectFields, setSelectedRejectFields] = useState<string[]>([]);
    const [fieldRejectComments, setFieldRejectComments] = useState<Record<string, string>>({});

    // État pour déplier les détails d'un rejet dans la liste (Accordion)
    const [expandedRejectionId, setExpandedRejectionId] = useState<number | null>(null);

    // --- TUTORIEL ---
    const [runTour, setRunTour] = useState(false);
    useExpertTour(runTour, setRunTour);

    // --- 1. CHARGEMENT INITIAL ---
    useEffect(() => {
        // Charger les spécialités
        api.get('/specialties/').then(res => setSpecialties(res.data)).catch(console.error);
        fetchCases();
    }, []);

    // Déclenchement auto du tour si chargement fini
    useEffect(() => {
        if (!loading) {
            const hasSeenExpertTour = localStorage.getItem('hasSeenExpertTour');
            if (!hasSeenExpertTour) {
                setTimeout(() => setRunTour(true), 1000);
                localStorage.setItem('hasSeenExpertTour', 'true');
            }
        }
    }, [loading]);

    // --- 2. RÉCUPÉRATION DES CAS (AVEC FILTRES) ---
    const fetchCases = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filterSpecialty) params.append('specialties', filterSpecialty);
            if (filterDifficulty) params.append('difficulty', filterDifficulty);
            if (filterAge) params.append('age', filterAge);
            if (filterSymptom) params.append('symptom', filterSymptom);
            if (filterDiagnosis) params.append('diagnosis', filterDiagnosis);

            const res = await api.get(`/cases/?${params.toString()}`);
            setCases(res.data);
        } catch (e) {
            toast.error("Erreur de chargement des cas.");
        } finally {
            setLoading(false);
        }
    };

    // Recharger quand un filtre change (Debounce simplifié)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCases();
        }, 500);
        return () => clearTimeout(timer);
    }, [filterSpecialty, filterDifficulty, filterAge, filterSymptom, filterDiagnosis]);


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

    // --- 4. GESTION DES STATUTS & REJET ---

    // Initialisation du rejet
    const openRejectionModal = (id: number) => {
        setRejectingId(id);
        setRejectGlobalComment("");
        setSelectedRejectFields([]);
        setFieldRejectComments({});
    };

    // Validation du rejet (Construction du JSON)
    const confirmRejection = async () => {
        if (!rejectingId) return;

        const rejectionPayload = {
            global: rejectGlobalComment,
            fields: {} as Record<string, string>
        };

        selectedRejectFields.forEach(fieldKey => {
            rejectionPayload.fields[fieldKey] = fieldRejectComments[fieldKey] || "Erreur détectée";
        });

        await executeStatusUpdate(rejectingId, 'rejete', rejectionPayload);
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        if (newStatus === 'rejete') {
            openRejectionModal(id);
            return;
        }
        await executeStatusUpdate(id, newStatus);
    };

    const executeStatusUpdate = async (id: number, newStatus: string, reasonData?: any) => {
        try {
            const payload: any = { status: newStatus };
            if (reasonData) payload.rejection_reason = reasonData;

            await api.patch(`/cases/${id}/`, payload);

            toast.success(`Statut mis à jour : ${newStatus}`);

            // Mise à jour locale
            setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, rejection_reason: reasonData } : c));

            setRejectingId(null);
        } catch (e) {
            toast.error("Erreur technique.");
        }
    };

    // Gestion des checkbox dans la modale
    const toggleField = (key: string) => {
        if (selectedRejectFields.includes(key)) {
            setSelectedRejectFields(prev => prev.filter(k => k !== key));
            const newComments = { ...fieldRejectComments };
            delete newComments[key];
            setFieldRejectComments(newComments);
        } else {
            setSelectedRejectFields(prev => [...prev, key]);
        }
    };

    // Filtrage local pour les onglets (Status)
    const displayedCases = cases.filter(c => c.status === filterStatus);

    if (loading && cases.length === 0) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <>
            {/* HEADER ADMIN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div id="expert-header-title" className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
                            <Database className="text-brand-primary" /> Administration
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Pilotage de la base de connaissances et flux de validation.
                        </p>
                    </div>
                    {/* Bouton Aide */}
                    <button
                        onClick={() => setRunTour(true)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors ml-2"
                        title="Relancer le tutoriel"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        id="expert-action-export"
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {exporting ? <Clock className="animate-spin" size={18}/> : <Download size={18} />}
                        Exporter
                    </button>
                    <button
                        id="expert-action-import"
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

            {/* --- BARRE DE FILTRES AVANCÉE (ID: #expert-filters-bar) --- */}
            <div id="expert-filters-bar" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center gap-2 text-brand-dark font-bold text-sm uppercase tracking-wider mb-4">
                    <Filter size={18} className="text-brand-primary" /> Critères de Recherche
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-end">

                    {/* SPÉCIALITÉ (Mis en avant) */}
                    <div className="w-full lg:w-1/4">
                        <label className="block text-xs font-bold text-brand-primary mb-1 ml-1 uppercase">Spécialité (Principal)</label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl text-brand-dark font-bold focus:ring-4 focus:ring-orange-200 focus:border-orange-300 outline-none transition-all cursor-pointer"
                                value={filterSpecialty}
                                onChange={(e) => setFilterSpecialty(e.target.value)}
                            >
                                <option value="">Toutes les spécialités</option>
                                {specialties.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* AUTRES FILTRES */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Difficulté</label>
                            <select
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="">Peu importe</option>
                                <option value="Facile">Facile</option>
                                <option value="Moyen">Moyen</option>
                                <option value="Difficile">Difficile</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Âge</label>
                            <input
                                type="number"
                                placeholder="Ex: 45"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Symptôme</label>
                            <div className="relative">
                                <Activity className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Ex: Fièvre"
                                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={filterSymptom}
                                    onChange={(e) => setFilterSymptom(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Maladie</label>
                            <div className="relative">
                                <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Ex: Palu"
                                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={filterDiagnosis}
                                    onChange={(e) => setFilterDiagnosis(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset */}
                    {(filterSpecialty || filterDifficulty || filterAge || filterSymptom || filterDiagnosis) && (
                        <button
                            onClick={() => {
                                setFilterSpecialty(''); setFilterDifficulty(''); setFilterAge(''); setFilterSymptom(''); setFilterDiagnosis('');
                            }}
                            className="h-[42px] px-4 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            {/* ONGLETS STATUTS (ID: #expert-tabs-nav) */}
            <div id="expert-tabs-nav" className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'non_approuve', label: 'À Valider' },
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
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                        Aucun cas trouvé avec ces critères.
                    </div>
                ) : (
                    displayedCases.map((c, index) => (
                        <div
                            key={c.id}
                            id={index === 0 ? "tour-first-case-card" : undefined}
                            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                ID: {c.source_fultang_id}
                            </span>

                                    {c.specialties && c.specialties.map((spec: any, idx: number) => (
                                        <span key={spec.id || idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                                    {spec.name}
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

                                {/* ACCORDÉON DE REJET */}
                                {c.status === 'rejete' && c.rejection_reason && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setExpandedRejectionId(expandedRejectionId === c.id ? null : c.id)}
                                            className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            <AlertTriangle size={14} />
                                            Voir le motif du rejet
                                            {expandedRejectionId === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>

                                        {expandedRejectionId === c.id && (
                                            <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-3 text-sm animate-fade-in">
                                                {typeof c.rejection_reason === 'string' ? (
                                                    <p className="text-red-800">{c.rejection_reason}</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-red-900 font-medium border-b border-red-200 pb-2">
                                                            {c.rejection_reason.global || "Pas de commentaire global"}
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {Object.entries(c.rejection_reason.fields || {}).map(([key, comment]: [string, any]) => (
                                                                <div key={key} className="bg-white/50 p-2 rounded border border-red-100">
                                                            <span className="block text-[10px] uppercase font-bold text-red-500">
                                                                {REJECTION_FIELDS.find(f => f.key === key)?.label || key}
                                                            </span>
                                                                    <span className="text-xs text-red-800">{comment}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS (ID sur le premier pour le tuto: #tour-first-case-actions) */}
                            <div
                                id={index === 0 ? "tour-first-case-actions" : undefined}
                                className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]"
                            >
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

            {/* --- MODALE DE REJET --- */}
            <Modal
                isOpen={!!rejectingId}
                onClose={() => setRejectingId(null)}
                title="Rejeter ce cas"
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

                    <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100 flex gap-2 items-start">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Analyse de la qualité</p>
                            <p>Cochez les éléments incohérents ou manquants.</p>
                        </div>
                    </div>

                    {/* Liste des champs à cocher */}
                    <div className="space-y-3 border-t border-b border-gray-100 py-4">
                        {REJECTION_FIELDS.map((field) => {
                            const isSelected = selectedRejectFields.includes(field.key);
                            return (
                                <div key={field.key} className={`rounded-lg border transition-all ${isSelected ? 'bg-red-50 border-red-200 p-3' : 'bg-white border-transparent p-1'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            checked={isSelected}
                                            onChange={() => toggleField(field.key)}
                                        />
                                        <span className={`text-sm font-medium ${isSelected ? 'text-red-900' : 'text-gray-600'}`}>
                                    {field.label}
                                </span>
                                    </label>

                                    {/* Input conditionnel */}
                                    {isSelected && (
                                        <input
                                            type="text"
                                            className="mt-2 w-full text-xs p-2 border border-red-200 rounded bg-white focus:outline-none focus:border-red-400 placeholder-red-200 text-red-800"
                                            placeholder={`Précisez l'erreur sur : ${field.label}`}
                                            value={fieldRejectComments[field.key] || ''}
                                            onChange={(e) => setFieldRejectComments(prev => ({...prev, [field.key]: e.target.value}))}
                                            autoFocus
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Commentaire Global */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Commentaire final (Synthèse)</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none text-sm resize-none"
                            placeholder="Synthèse du problème..."
                            value={rejectGlobalComment}
                            onChange={(e) => setRejectGlobalComment(e.target.value)}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => setRejectingId(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={confirmRejection}
                            disabled={selectedRejectFields.length === 0 && !rejectGlobalComment.trim()}
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