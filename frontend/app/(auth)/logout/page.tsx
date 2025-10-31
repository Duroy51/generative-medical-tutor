'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LogoutPage() {
  const router = useRouter();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {

      toast.success('Déconnecté avec succès.');
      setTimeout(() => {
        router.push('/login');
      }, 300);  // Timeout réduit pour fluidité
    } catch (err) {
      console.error('Erreur déconnexion:', err);
      toast.error('Erreur lors de la déconnexion.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) router.back();
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Déconnexion</h2>
            <p className="text-sm text-gray-500">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
          </div>

          <div className="border-t border-amber-100 px-6 py-6">
            <div className="bg-amber-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
             
              </div>
              
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isLoggingOut
                    ? 'bg-amber-300 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg'
                }`}
                aria-label="Confirmer la déconnexion"
                role="button"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Déconnexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Confirmer la déconnexion</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 transition disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Annuler</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link href="/dashboard" className="text-sm text-amber-700 hover:underline">
                Retourner au tableau de bord
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Vous serez redirigé vers la page de connexion après déconnexion.
        </p>
      </div>
    </div>
  );
}