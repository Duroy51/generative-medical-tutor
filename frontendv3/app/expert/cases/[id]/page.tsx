"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ReasoningGraph } from '@/components/expert/ReasoningGraph';

// Icônes
import {
    ArrowLeft, Save, CheckCircle, XCircle,
    User, Activity, Plane, Wine, Dumbbell, Home,
    Stethoscope, FileText, Pill, Microscope, Eye,
    Bot, Brain, Tag, Baby, AlertTriangle, Scissors
} from 'lucide-react';

export default function CaseDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- CHARGEMENT ---
    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await api.get(`/cases/${id}/`);
                setCaseData(res.data);
            } catch (error) {
                toast.error("Erreur de chargement.");
                router.push('/expert');
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id, router]);

    // --- GESTION DES MODIFICATIONS ---
    const handleChange = (field: string, value: any) => {
        setCaseData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleModeDeVieChange = (category: string, field: string, value: string) => {
        setCaseData((prev: any) => ({
            ...prev,
            mode_de_vie: {
                ...prev.mode_de_vie,
                [category]: {
                    ...prev.mode_de_vie?.[category],
                    [field]: value
                }
            }
        }));
    };

    // --- SAUVEGARDE ---
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/cases/${id}/`, caseData);
            toast.success("Dossier mis à jour !");
        } catch (error) {
            toast.error("Erreur sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/cases/${id}/`, { status: newStatus });
            setCaseData((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Statut : ${newStatus}`);
        } catch (error) { toast.error("Erreur statut"); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
    if (!caseData) return null;

    return (
        <div className="space-y-8 pb-20">

            {/* --- HEADER --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/expert')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark">{caseData.case_title}</h1>
                        <div className="flex flex-wrap gap-2 text-xs mt-2 items-center">
                            <span className="px-2 py-0.5 bg-gray-100 rounded font-mono border border-gray-200">ID: {caseData.source_fultang_id}</span>

                            {caseData.categories?.map((cat: any) => (
                                <span key={cat.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded flex items-center gap-1">
                            <Tag size={10} /> {cat.name}
                        </span>
                            ))}

                            <span className={`px-2 py-0.5 font-bold rounded uppercase border ${caseData.status === 'approuve' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {caseData.status}
                    </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {caseData.status !== 'approuve' && (
                        <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange('approuve')}>
                            <CheckCircle size={18} className="mr-2"/> Valider
                        </Button>
                    )}
                    <Button onClick={handleSave} isLoading={saving} className="bg-brand-dark text-white hover:bg-gray-800">
                        <Save size={18} className="mr-2"/> Enregistrer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* === COLONNE GAUCHE (33%) === */}
                <div className="xl:col-span-4 space-y-6">

                    {/* 1. DONNÉES PERSONNELLES */}
                    <Section title="Données Personnelles" icon={User}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="Âge" type="number" value={caseData.age} onChange={(e) => handleChange('age', e.target.value)} />
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Sexe</label>
                                <select className="w-full px-4 py-3.5 rounded-xl border bg-gray-50 outline-none focus:border-brand-primary" value={caseData.sexe} onChange={(e) => handleChange('sexe', e.target.value)}>
                                    <option value="Homme">Homme</option>
                                    <option value="Femme">Femme</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input label="État Civil" value={caseData.etat_civil || ''} onChange={(e) => handleChange('etat_civil', e.target.value)} />
                            <Input label="Profession" value={caseData.profession || ''} onChange={(e) => handleChange('profession', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Enfants" type="number" value={caseData.nombre_enfant || 0} onChange={(e) => handleChange('nombre_enfant', e.target.value)} />
                            <Input label="Gr. Sanguin" value={caseData.groupe_sanguin || ''} onChange={(e) => handleChange('groupe_sanguin', e.target.value)} placeholder="Ex: O+" />
                        </div>
                    </Section>

                    {/* 2. MODE DE VIE */}
                    <Section title="Mode de Vie" icon={Home}>
                        <div className="mb-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-800 font-bold text-[10px] mb-2 uppercase"><Plane size={12}/> Voyage</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Lieu" value={caseData.mode_de_vie?.voyage?.lieu || ''} onChange={(e) => handleModeDeVieChange('voyage', 'lieu', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.voyage?.frequence || ''} onChange={(e) => handleModeDeVieChange('voyage', 'frequence', e.target.value)} />
                                <input className="input-mini col-span-2" placeholder="Durée" value={caseData.mode_de_vie?.voyage?.duree || ''} onChange={(e) => handleModeDeVieChange('voyage', 'duree', e.target.value)} />
                            </div>
                        </div>
                        <div className="mb-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 text-red-800 font-bold text-[10px] mb-2 uppercase"><Wine size={12}/> Addictions</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Nom" value={caseData.mode_de_vie?.addiction?.nom || ''} onChange={(e) => handleModeDeVieChange('addiction', 'nom', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.addiction?.frequence || ''} onChange={(e) => handleModeDeVieChange('addiction', 'frequence', e.target.value)} />
                                <input className="input-mini col-span-2" placeholder="Durée" value={caseData.mode_de_vie?.addiction?.duree || ''} onChange={(e) => handleModeDeVieChange('addiction', 'duree', e.target.value)} />
                            </div>
                        </div>
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 text-green-800 font-bold text-[10px] mb-2 uppercase"><Dumbbell size={12}/> Activité Physique</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-mini" placeholder="Activité" value={caseData.mode_de_vie?.sport?.nom || ''} onChange={(e) => handleModeDeVieChange('sport', 'nom', e.target.value)} />
                                <input className="input-mini" placeholder="Fréquence" value={caseData.mode_de_vie?.sport?.frequence || ''} onChange={(e) => handleModeDeVieChange('sport', 'frequence', e.target.value)} />
                            </div>
                        </div>
                    </Section>

                    {/* 3. IA CONFIG */}
                    <Section title="Configuration IA" icon={Bot}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><User size={12}/> Prompt Patient</label>
                                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-900 text-green-400 font-mono text-[10px] min-h-[100px] outline-none" value={caseData.system_prompt_patient || ''} onChange={(e) => handleChange('system_prompt_patient', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Brain size={12}/> Prompt Tuteur</label>
                                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-900 text-yellow-400 font-mono text-[10px] min-h-[100px] outline-none" value={caseData.system_prompt_tutor || ''} onChange={(e) => handleChange('system_prompt_tutor', e.target.value)} />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* === COLONNE DROITE (66%) === */}
                <div className="xl:col-span-8 space-y-6">

                    {/* MOTIF CONSULTATION */}
                    <div className="bg-white p-6 rounded-xl border border-brand-primary/20 shadow-sm">
                        <label className="text-xs font-bold text-brand-primary mb-2 block uppercase tracking-wider">Motif de Consultation</label>
                        <textarea
                            className="w-full text-xl font-medium text-brand-dark bg-transparent border-none outline-none resize-none placeholder-gray-300"
                            rows={2}
                            value={caseData.motif_consultation || ''}
                            onChange={(e) => handleChange('motif_consultation', e.target.value)}
                        />
                    </div>

                    {/* GRAPHE */}
                    <Section title="Logique IA (Graphe)" icon={Activity}>
                        <ReasoningGraph data={caseData.reasoning_graph} />
                    </Section>

                    {/* SYMPTÔMES (8 Attributs) */}
                    <Section title="Symptômes" icon={Activity}>
                        <div className="space-y-3">
                            {caseData.symptoms?.map((s: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between mb-3 border-b border-gray-200 pb-2">
                                        <span className="font-bold text-gray-900">{s.nom}</span>
                                        <div className="flex items-center gap-2 bg-white px-2 rounded-lg border border-gray-200">
                                            <span className="text-xs text-gray-400">Intensité</span>
                                            <span className="font-bold text-brand-primary">{s.degre}</span>
                                            <span className="text-xs text-gray-400">/10</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        <div><span className="label-mini">Localisation</span><div className="val">{s.localisation || '-'}</div></div>
                                        <div><span className="label-mini">Début</span><div className="val">{s.date_debut || '-'}</div></div>
                                        <div><span className="label-mini">Fréquence</span><div className="val">{s.frequence || '-'}</div></div>
                                        <div><span className="label-mini">Durée</span><div className="val">{s.duree || '-'}</div></div>
                                        <div className="col-span-2"><span className="label-mini">Facteur Déclenchant</span><div className="val">{s.activite_declenchante || '-'}</div></div>
                                        <div className="col-span-2"><span className="label-mini">Évolution</span><div className="val">{s.evolution || '-'}</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ANTÉCÉDENTS (DÉTAILLÉS) */}
                        <Section title="Antécédents & Historique" icon={FileText}>
                            <div className="space-y-4">
                                {caseData.history_entries?.map((h: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-gray-300 transition-colors">

                                        {/* Header Antécédent */}
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                        h.type === 'maladie' ? 'bg-orange-100 text-orange-700' :
                                            h.type === 'allergie' ? 'bg-red-100 text-red-700' :
                                                h.type === 'chirurgie' ? 'bg-blue-100 text-blue-700' :
                                                    h.type === 'obstetrical' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {h.type === 'chirurgie' && <Scissors size={10} />}
                                        {h.type === 'allergie' && <AlertTriangle size={10} />}
                                        {h.type === 'obstetrical' && <Baby size={10} />}
                                        {h.type}
                                    </span>
                                            <span className="font-bold text-sm text-gray-800">{h.nom || h.description}</span>
                                        </div>

                                        {/* Corps Antécédent (Champs Spécifiques) */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">

                                            {/* CAS MALADIE */}
                                            {h.type === 'maladie' && (
                                                <>
                                                    <div><span className="label-mini">Début</span><div className="val">{h.date || '-'}</div></div>
                                                    <div><span className="label-mini">Fin</span><div className="val">{h.date_fin || '-'}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Note</span><div className="val">{h.observation || h.description}</div></div>

                                                    {/* Traitement lié */}
                                                    {h.traitement_nom && (
                                                        <div className="col-span-2 mt-2 bg-blue-50/50 p-2 rounded border border-blue-100">
                                                            <div className="flex items-center gap-1 mb-1 text-blue-800 font-bold text-[10px]"><Pill size={10}/> Traitement Lié</div>
                                                            <div className="grid grid-cols-2 gap-1">
                                                                <span className="val font-semibold">{h.traitement_nom}</span>
                                                                <span className="val text-gray-500">{h.traitement_posologie}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* CAS CHIRURGIE */}
                                            {h.type === 'chirurgie' && (
                                                <>
                                                    <div><span className="label-mini">Date</span><div className="val">{h.date || '-'}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Détail</span><div className="val">{h.description}</div></div>
                                                </>
                                            )}

                                            {/* CAS ALLERGIE */}
                                            {h.type === 'allergie' && (
                                                <>
                                                    <div className="col-span-2"><span className="label-mini">Déclencheur</span><div className="val font-bold text-red-600">{h.declencheur || h.nom}</div></div>
                                                    <div className="col-span-2"><span className="label-mini">Réaction</span><div className="val">{h.manifestation || h.description}</div></div>
                                                </>
                                            )}

                                            {/* CAS OBSTETRICAL */}
                                            {h.type === 'obstetrical' && (
                                                <>
                                                    <div><span className="label-mini">Nb Grossesses (G)</span><div className="val font-bold">{h.nombre_grossesse}</div></div>
                                                    <div><span className="label-mini">Date Dernière</span><div className="val">{h.date || '-'}</div></div>
                                                </>
                                            )}

                                            {/* CAS FAMILIAL (Défaut) */}
                                            {h.type === 'familial' && (
                                                <div className="col-span-2"><span className="label-mini">Description</span><div className="val">{h.description}</div></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* TRAITEMENT */}
                        <Section title="Traitement Actuel" icon={Pill}>
                            <div className="space-y-3">
                                {caseData.current_treatments?.map((t: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="font-bold text-gray-900">{t.nom}</div>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="text-gray-500">{t.posologie}</span>
                                            <span className={t.efficacite?.includes('inefficace') ? 'text-red-500' : 'text-green-500'}>{t.efficacite}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* EXAMENS & DIAGNOSTICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Signes Physiques & Examens" icon={Microscope}>
                            <div className="space-y-4">
                                {/* Signes Physiques */}
                                {caseData.physical_findings?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Eye size={12}/> Inspection / Palpation</h4>
                                        {caseData.physical_findings.map((p: any, idx: number) => (
                                            <div key={idx} className="text-xs border-l-2 border-brand-primary pl-2 py-1 mb-1">
                                                <span className="font-bold text-gray-700">{p.nom_examen} : </span>
                                                <span className="text-gray-600">{p.resultat_observation}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Examens avec Anatomie */}
                                {caseData.exams?.map((e: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-brand-dark">{e.nom}</span>

                                            {/* Badge Anatomie */}
                                            {e.anatomie && (
                                                <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 uppercase font-bold">
                                            {e.anatomie}
                                        </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 mt-1 font-medium">
                                            {e.resultat}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Diagnostics" icon={Stethoscope}>
                            {caseData.diagnoses?.map((d: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-lg border mb-2 ${d.is_final ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800 text-sm">{d.description}</span>
                                        {d.is_final ? (
                                            <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Final</span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Différentiel</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .input-mini { width: 100%; padding: 4px 8px; font-size: 11px; border: 1px solid #E5E7EB; border-radius: 4px; outline: none; }
        .input-mini:focus { border-color: #D97706; background: white; }
        .label-mini { display: block; font-size: 9px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; margin-bottom: 1px; }
        .val { font-size: 12px; font-weight: 500; color: #1F2937; }
      `}</style>
        </div>
    );
}

function Section({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Icon size={16} className="text-brand-primary" />
                <h3 className="font-bold text-brand-dark text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}