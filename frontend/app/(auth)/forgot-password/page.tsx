'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import * as ApiService from '@/lib/ApiService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);  // État pour message "email envoyé"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre email.');
      return;
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <FiMail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email envoyé !</h2>
          <p className="text-gray-600 mb-6">
            Vérifiez votre boîte de réception pour le lien de réinitialisation.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <FiArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Sidebar image comme dans ConnexionPage, si tu veux – sinon supprime */}
        <div className="hidden lg:block lg:w-full p-8 bg-gradient-to-b from-amber-100 to-orange-100">
          <div className="text-center">
            <h3 className="text-xl font-bold text-amber-700 mb-2">Mot de passe oublié ?</h3>
            <p className="text-amber-600">Nous vous enverrons un lien pour réinitialiser.</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-amber-700 mb-2">Réinitialiser le mot de passe</h1>
            <p className="text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiMail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-10 pr-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-500 outline-none transition"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                loading || !email
                  ? 'bg-amber-300 cursor-not-allowed text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-amber-700 hover:underline flex items-center justify-center gap-1">
              <FiArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}