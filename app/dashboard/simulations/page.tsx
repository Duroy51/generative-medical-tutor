'use client';

import { useEffect, useState } from 'react';
import { FiPlay, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import * as ApiService from '@/lib/ApiService';
type Simulation = {
  id: number;
  status: string;
  start_time: string;
  end_time: string | null;
  case: {
    id: number;
    case_title: string;
    case_summary?: string;
  };
};

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await ApiService.getSimulations();
        setSimulations(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger vos simulations");
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <FiClock className="mx-auto mb-2" />
        Chargement des simulations...
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FiAlertCircle className="mx-auto mb-2" />
        Aucune simulation trouvée.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">
        Mes simulations médicales
      </h1>

      {simulations.map((simulation) => (
        <div
          key={simulation.id}
          className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div>
            <h2 className="font-medium">
              {simulation.case.case_title}
            </h2>

            <p className="text-sm text-gray-500">
              Statut : {simulation.status}
            </p>

            <p className="text-xs text-gray-400">
              Démarrée le {new Date(simulation.start_time).toLocaleString()}
            </p>
          </div>
          
            <button
                onClick={() => router.push(`/dashboard/simulations/${simulation.id}`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
                <FiPlay />
                Reprendre
            </button>

        </div>
      ))}
    </div>
  );
}
