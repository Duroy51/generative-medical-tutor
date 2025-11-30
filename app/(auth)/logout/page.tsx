'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, Loader2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await logout();

      if (!res.success) throw new Error(res.error);

      toast.success('Déconnecté avec succès.');
      setTimeout(() => router.push('/login'), 500);

    } catch (err: any) {
      toast.error('Erreur lors de la déconnexion.');
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) router.back();
    else router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">

        {/* ==== Header ==== */}
        <div className="px-6 py-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center mb-4 shadow-inner">
            <LogOut className="w-7 h-7 text-blue-700" />
          </div>
          <h2 className="text-2xl font-bold text-blue-700 mb-1">
            Déconnexion
          </h2>
          <p className="text-sm text-blue-600/80">
            Êtes-vous sûr de vouloir quitter MedCaseGen ?
          </p>
        </div>

        {/* ==== Content ==== */}
        <div className="px-6 py-6 border-t border-blue-100">

          {/* Info session */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center gap-4 border border-blue-100">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Session active</p>
              <p className="text-sm text-blue-600">
                Vous êtes connecté à votre compte MedCaseGen
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md ${
                isLoggingOut
                  ? 'bg-blue-300 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
              }`}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Déconnexion en cours...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Confirmer la déconnexion
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Annuler
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Retourner au tableau de bord
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-700">
            <Stethoscope className="w-4 h-4" />
            <span className="text-sm font-medium">MedCaseGen</span>
          </div>
        </div>
        
        {/* Message informatif */}
        <p className="text-center text-xs text-blue-500/80 mt-6">
          Vous serez redirigé vers la page de connexion après déconnexion.
        </p>
      </div>

    </main>
  );
}
