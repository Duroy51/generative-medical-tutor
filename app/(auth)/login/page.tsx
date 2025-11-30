'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

import { useAuth } from '@/contexts/AuthContext';

const ConnexionPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  // STATES
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // --- Toggle show/hide password ---
  const togglePassword = () => setShowPassword(!showPassword);

  // --- Submit form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    try {
      setLoading(true);
      const username = email.split('@')[0]; // Simple extraction du nom d'utilisateur depuis l'email
      const res = await login(username, email);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      setShowConfetti(true);
      toast.success('Connexion réussie ! Bienvenue sur MedCaseGen 👋');

      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      toast.error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      <div className="flex w-full">

        {/* 60% — SECTION ILLUSTRATION */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden lg:flex flex-col justify-center items-center w-[70%]
          relative bg-gradient-to-b from-blue-50 to-indigo-100 p-10"
        >
          {/* Section texte - 15% de l'espace */}
          <div className="w-full flex flex-col justify-center items-center mb-6" style={{ height: '15%' }}>
            <div className="max-w-lg text-center">
              <h1 className="text-4xl font-bold text-blue-700 mb-4">
                MedCaseGen
              </h1>
              <p className="text-blue-700/90 text-lg leading-relaxed">
                Créez, analysez et gérez vos cas médicaux avec une IA développée
                pour le monde clinique moderne.
              </p>
            </div>
          </div>

          {/* Section image - 85% de l'espace */}
          <div className="w-full max-xxl relative" style={{ height: '85%' }}>
            <Image
              src="/images/medical-login.png"
              alt="Illustration médicale"
              fill
              priority
              className="object-cover"
            />
          </div>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Plateforme sécurisée – données protégées
          </p>
        </motion.div>

        {/* 40% — FORMULAIRE */}
        <AnimatePresence>
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.35 }}
            className="w-full lg:w-[40%] flex flex-col justify-center p-10 relative"
          >
            {showConfetti && (
              <Confetti
                width={typeof window !== 'undefined' ? window.innerWidth : 0}
                height={typeof window !== 'undefined' ? window.innerHeight : 0}
              />
            )}

            {/* HEADER */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-blue-700">
                Connexion
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Accédez à vos simulations et cas médicaux.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* EMAIL */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Adresse email ou nom d'utilisateur
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
                    placeholder="exemple@gmail.com"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 pl-10 pr-10 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-blue-700 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* BTN */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold
                bg-blue-600 hover:bg-blue-700 shadow-md transition"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </motion.button>
            </form>

            {/* FOOTER */}
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
  );
};

export default ConnexionPage;
