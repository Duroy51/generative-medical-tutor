"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertCircle, Activity, FileText, Pill, Search } from 'lucide-react';

export default function CaseDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Chargement des données
    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await api.get(`/cases/${id}/`);
                setCaseData(res.data);
            } catch (error) {
                toast.error("Impossible de charger le cas clinique.");
                router.push('/expert');
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id, router]);

    // Gestion de la modification des champs principaux
    const handleChange = (field: string, value: any) => {
        setCaseData((prev: any) => ({ ...prev, [field]: value }));
    };

    // Sauvegarde globale
    const handleSave = async () => {
        setSaving(true);
        try {
            // On envoie uniquement les champs principaux modifiables pour l'instant
            // (Pour modifier les listes imbriquées comme les symptômes, il faudrait une logique plus complexe d'ajout/suppression)
            const payload = {
                case_title: caseData.case_title,
                case_summary: caseData.case_summary,
                age: caseData.age,
                sexe: caseData.sexe,
                difficulty: caseData.difficulty,
                motif_consultation: caseData.motif_consultation,
                learning_objectives: caseData.learning_objectives,
                patient_persona: caseData.patient_persona,
                initial_statement: caseData.initial_statement
            };

            await api.patch(`/cases/${id}/`, payload);
            toast.success("Cas clinique mis à jour avec succès !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    // Changement de statut
    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/cases/${id}/`, { status: newStatus });
            setCaseData((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Statut changé à : ${newStatus}`);
        } catch (error) {
            toast.error("Erreur changement statut");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Chargement du dossier...</div>;
    if (!caseData) return null;

    return (
        <div className="space-y-6 pb-20">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/expert')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                            Édition : {caseData.case_title}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                        caseData.status === 'approuve' ? 'bg-green-100 text-green-700' :
                            caseData.status === 'rejete' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                    }`}>
                        {caseData.status}
                    </span>
                            <span className="text-xs text-gray-400">ID Fultang: {caseData.source_fultang_id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {caseData.status !== 'approuve' && (
                        <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange('approuve')}>
                            <CheckCircle size={18} className="mr-2"/> Valider
                        </Button>
                    )}
                    {caseData.status !== 'rejete' && (
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange('rejete')}>
                            <XCircle size={18} className="mr-2"/> Rejeter
                        </Button>
                    )}
                    <Button onClick={handleSave} isLoading={saving}>
                        <Save size={18} className="mr-2"/> Enregistrer
                    </Button>
                </div>
            </div>

            {/* --- FORMULAIRE PRINCIPAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLONNE GAUCHE : IDENTITÉ & CONTEXTE */}
                <div className="lg:col-span-1 space-y-6">
                    <Section title="Identité Patient" icon={Activity}>
                        <Input label="Âge" type="number" value={caseData.age} onChange={(e) => handleChange('age', e.target.value)} />
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Sexe</label>
                            <select
                                className="w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={caseData.sexe}
                                onChange={(e) => handleChange('sexe', e.target.value)}
                            >
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                            </select>
                        </div>
                        <Input label="Profession" value={caseData.profession || ''} onChange={(e) => handleChange('profession', e.target.value)} />
                        <Input label="État Civil" value={caseData.etat_civil || ''} onChange={(e) => handleChange('etat_civil', e.target.value)} />
                    </Section>

                    <Section title="Paramètres Pédagogiques" icon={FileText}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Difficulté</label>
                            <select
                                className="w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={caseData.difficulty}
                                onChange={(e) => handleChange('difficulty', e.target.value)}
                            >
                                <option value="Facile">Facile</option>
                                <option value="Moyen">Moyen</option>
                                <option value="Difficile">Difficile</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Objectifs d'apprentissage</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 min-h-[100px] outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={caseData.learning_objectives || ''}
                                onChange={(e) => handleChange('learning_objectives', e.target.value)}
                            />
                        </div>
                    </Section>
                </div>

                {/* COLONNE DROITE : CLINIQUE & SIMULATION */}
                <div className="lg:col-span-2 space-y-6">
                    <Section title="Détails du Cas" icon={Search}>
                        <Input label="Titre du cas" value={caseData.case_title} onChange={(e) => handleChange('case_title', e.target.value)} />

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Résumé clinique (Pour l'étudiant)</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 min-h-[80px] outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={caseData.case_summary || ''}
                                onChange={(e) => handleChange('case_summary', e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Motif de consultation</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border bg-gray-50 min-h-[60px] outline-none focus:ring-2 focus:ring-brand-primary/20"
                                value={caseData.motif_consultation || ''}
                                onChange={(e) => handleChange('motif_consultation', e.target.value)}
                            />
                        </div>
                    </Section>

                    <Section title="Configuration du Patient IA" icon={AlertCircle}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Personnalité (Prompt)</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 min-h-[100px] outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={caseData.patient_persona || ''}
                                    onChange={(e) => handleChange('patient_persona', e.target.value)}
                                    placeholder="Ex: Anxieux, parle vite..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phrase d'introduction</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 min-h-[100px] outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={caseData.initial_statement || ''}
                                    onChange={(e) => handleChange('initial_statement', e.target.value)}
                                    placeholder="Ex: Bonjour docteur, j'ai mal..."
                                />
                            </div>
                        </div>
                    </Section>

                    {/* --- LISTES DE DÉTAILS (Lecture Seule pour l'instant) --- */}
                    {/* C'est ici que l'on affiche tout ce que le LLM a extrait */}

                    <Section title={`Symptômes (${caseData.symptoms?.length || 0})`} icon={Activity}>
                        <DataList items={caseData.symptoms} fields={['nom', 'localisation', 'degre', 'date_debut']} />
                    </Section>

                    <Section title={`Antécédents (${caseData.history_entries?.length || 0})`} icon={FileText}>
                        <DataList items={caseData.history_entries} fields={['type', 'description']} />
                    </Section>

                    <Section title={`Diagnostics (${caseData.diagnoses?.length || 0})`} icon={Pill}>
                        <div className="space-y-2">
                            {caseData.diagnoses?.map((d: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${d.is_final ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <span className="font-medium text-gray-800">{d.description}</span>
                                    {d.is_final && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">FINAL</span>}
                                </div>
                            ))}
                        </div>
                    </Section>

                </div>
            </div>
        </div>
    );
}

// --- PETITS COMPOSANTS DE PRÉSENTATION LOCAUX ---

function Section({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Icon size={18} className="text-brand-primary" />
                <h3 className="font-bold text-gray-800">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

function DataList({ items, fields }: any) {
    if (!items || items.length === 0) return <p className="text-gray-400 text-sm italic">Aucune donnée.</p>;

    return (
        <div className="space-y-3">
            {items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                    {fields.map((field: string) => (
                        item[field] ? (
                            <div key={field} className="mb-1 last:mb-0">
                                <span className="text-gray-500 font-medium capitalize">{field.replace('_', ' ')}: </span>
                                <span className="text-gray-900">{item[field]}</span>
                            </div>
                        ) : null
                    ))}
                </div>
            ))}
        </div>
    );
}