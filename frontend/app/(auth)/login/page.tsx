'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Head from 'next/head';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

const ConnexionPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  const togglePassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      // TODO: Appel réel vers ton API (ex: AuthService.login)
      toast.success('Connexion réussie ! Bienvenue sur MedCaseGen.');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion | MedCaseGen</title>
        <meta
          name="description"
          content="Connectez-vous pour accéder à votre espace sur MedCaseGen — le générateur de cas médicaux intelligent."
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-blue-100">
          
          {/* SECTION GAUCHE (Illustration & texte) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:block lg:w-1/2 bg-gradient-to-b from-blue-100 to-indigo-100 p-8 relative"
          >
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-3xl font-bold text-blue-700 mb-3">
                Bienvenue sur MedCaseGen
              </h2>
              <p className="text-blue-700/90 mb-6">
                Connectez-vous pour accéder à vos cas médicaux, générer de nouveaux scénarios et suivre vos projets cliniques.
              </p>
              <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-inner">
                <Image
                  src="/images/medical-login.webp"
                  alt="Illustration médicale"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* SECTION DROITE (Formulaire) */}
          <AnimatePresence>
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.35 }}
              className="w-full lg:w-1/2 p-8"
            >
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
                  Connexion
                </h1>
                <p className="text-gray-600 mt-1">
                  Connectez-vous pour gérer vos cas médicaux et vos simulations cliniques.
                </p>
              </div>

              {/* FORMULAIRE */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <FiMail />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2 pl-10 pr-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition"
                      placeholder="exemple@medcasegen.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <FiLock />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-2 pl-10 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition"
                      placeholder="Entrez votre mot de passe"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((s) => !s)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                    />
                    <span className="ml-2 text-gray-600">Se souvenir de moi</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition shadow-md ${
                    loading
                      ? 'bg-blue-300 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </motion.button>
              </form>

              {/* AUTRES MÉTHODES */}
              <div className="mt-6">
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => toast('Connexion via Google (simulée)')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                    <span className="text-sm">Google</span>
                  </button>

                  <button
                    onClick={() => toast('Connexion via Microsoft (simulée)')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Image src="/icons/microsoft.svg" alt="Microsoft" width={20} height={20} />
                    <span className="text-sm">Microsoft</span>
                  </button>
                </div>
              </div>

              {/* LIEN VERS INSCRIPTION */}
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-500">Pas encore de compte ? </span>
                <Link href="/register" className="text-blue-700 hover:underline">
                  Créer un compte
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default ConnexionPage;
