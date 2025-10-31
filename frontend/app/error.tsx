// app/error.tsx — Boundary d’erreur globale professionnelle
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Home,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function GlobalError({ error }: { error: Error }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('🔥 Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white border border-red-200 shadow-lg rounded-2xl p-8 text-center">
        {/* Icône d’erreur */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-600 p-4 rounded-full">
            <AlertCircle size={40} />
          </div>
        </div>

        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Oups ! Une erreur s’est produite
        </h1>
        <p className="text-gray-600 mb-6">
          Nous avons rencontré un problème lors du chargement de cette page.  
          Vous pouvez essayer de revenir en arrière ou de retourner à l’accueil.
        </p>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium transition"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium transition"
          >
            <Home size={18} />
            Accueil
          </button>
        </div>

        {/* Bouton pour afficher les détails */}
        <div className="mt-4">
          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex items-center justify-center gap-2 mx-auto text-sm text-gray-600 hover:text-gray-800 transition"
          >
            {showDetails ? (
              <>
                <ChevronUp size={16} />
                Masquer les détails techniques
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Afficher les détails techniques
              </>
            )}
          </button>

          {showDetails && (
            <pre className="mt-4 text-left bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 overflow-auto max-h-64">
              {error?.message || 'Aucun message disponible.'}
              {error?.stack && (
                <>
                  {'\n\n'}Trace :
                  {'\n'}
                  {error.stack}
                </>
              )}
            </pre>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-8 text-xs text-gray-400">
          Si le problème persiste, contactez l’équipe technique.
        </p>
      </div>
    </div>
  );
}
