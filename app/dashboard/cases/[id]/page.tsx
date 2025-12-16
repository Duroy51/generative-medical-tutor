'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlay, FiArrowLeft, FiFileText } from 'react-icons/fi';
import * as ApiService from '@/lib/ApiService';
import { toast } from 'sonner';

type ClinicalCaseDetail = {
  id: number;
  case_title: string;
  case_summary?: string;
  description?: string;
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [caseData, setCaseData] = useState<ClinicalCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Charger le détail du cas
  useEffect(() => {
    const fetchCaseDetail = async () => {
      try {
        const res = await ApiService.getClinicalCaseById(id as string);
        setCaseData(res.data);
      } catch (error) {
        toast.error("Impossible de charger le cas clinique");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetail();
  }, [id]);

  // Démarrer la simulation
  const handleStartSimulation = async () => {
    if (!caseData) return;

    setStarting(true);
    try {
      const res = await ApiService.startSimulation(caseData.id);
      const sessionId = res.data.id;

      toast.success("Simulation démarrée");
      router.push(`/simulations/${sessionId}`);
    } catch (error) {
      toast.error("Erreur lors du démarrage de la simulation");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement du cas clinique…</div>;
  }

  if (!caseData) {
    return <div className="p-6">Cas introuvable</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft />
        Retour
      </button>

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FiFileText />
          {caseData.case_title}
        </h1>
      </div>

      {/* Résumé */}
      {caseData.case_summary && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="font-medium mb-1">Résumé</h2>
          <p className="text-gray-700 text-sm">
            {caseData.case_summary}
          </p>
        </div>
      )}

      {/* Description complète (si présente) */}
      {caseData.description && (
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-1">Description détaillée</h2>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {caseData.description}
          </p>
        </div>
      )}

      {/* Action */}
      <div className="pt-4">
        <button
          onClick={handleStartSimulation}
          disabled={starting}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          <FiPlay />
          {starting ? 'Démarrage…' : 'Démarrer la simulation'}
        </button>
      </div>
    </div>
  );
}
ET
https://upload.wikimedia.org/wikipedia/commons/7/75/Asthma_diagram.png
NS_BINDING_ABORTED

GET
https://upload.wikimedia.org/wikipedia/commons/e/e0/EEG_normal.svg
NS_BINDING_ABORTED

Avertissements de cookies 2 