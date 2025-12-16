'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiFileText } from 'react-icons/fi';
import * as ApiService from '@/lib/ApiService';
import { toast } from 'sonner';

type ClinicalCase = {
  id: number;
  case_title: string;
  case_summary?: string;
};

export default function ClinicalCasesPage() {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await ApiService.getClinicalCases();
        setCases(res.data);
      } catch (error) {
        toast.error('Impossible de charger les cas cliniques');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleStartSimulation = async (caseId: number) => {
    try {
      const res = await ApiService.startSimulation(caseId);
      const sessionId = res.data.id;

      toast.success('Simulation démarrée');
      router.push(`/dashboard/simulations/${sessionId}`);
    } catch (error) {
      toast.error('Erreur lors du démarrage de la simulation');
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des cas cliniques…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">
        Cas cliniques disponibles
      </h1>

      {cases.map((c) => (
        <div
          key={c.id}
          className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
        >
          <div>
            <h2 className="font-medium flex items-center gap-2">
              <FiFileText />
              {c.case_title}
            </h2>
            {c.case_summary && (
              <p className="text-sm text-gray-500 mt-1">
                {c.case_summary}
              </p>
            )}
          </div>

          <button
            onClick={() => handleStartSimulation(c.id)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FiPlay />
            Démarrer
          </button>
        </div>
      ))}
    </div>
  );
}
