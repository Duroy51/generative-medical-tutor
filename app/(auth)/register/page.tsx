'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

// === Composants réutilisables ===
const InputField = ({ label, error, ...props }: any) => (
  <div className="relative">
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      {...props}
      className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, error, options, ...props }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <select
      {...props}
      className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function InscriptionPageClient() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ================= VALIDATION =================
  const validate = () => {
    const e: any = {};

    if (!form.username.trim()) e.username = "Nom d'utilisateur requis";
    if (!form.email) e.email = 'Email requis';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.first_name.trim()) e.first_name = 'Prénom requis';
    if (!form.last_name.trim()) e.last_name = 'Nom requis';

    if (!form.password) e.password = 'Mot de passe requis';
    if (form.password.length < 6) e.password = 'Minimum 6 caractères';

    if (!form.confirmPassword) e.confirmPassword = 'Confirmez le mot de passe';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Les mots de passe ne correspondent pas';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ================= FORM SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return toast.error('Veuillez corriger les erreurs.');

    setLoading(true);

    try {
      const res = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      if (!res.success) throw new Error(res.error);

      toast.success('Compte créé 🎉');
      setShowConfetti(true);

      // Rediriger vers login après un délai
      setTimeout(() => {
        if (res.message === 'redirect_to_login') {
          router.push('/login');
        } else {
          // Ou rediriger vers la page d'accueil si connecté automatiquement
          router.push('/dashboard');
        }
      }, 1800);

    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    }
  };

  // ================= LOADING OVERLAY =================
  {loading && (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-700">Création de votre compte...</p>
      </div>
    </div>
  )}

  return (
    <main className="min-h-screen w-full bg-blue-50 flex p-4">
      <div className="w-full max-6xl bg-white rounded-xl shadow-xl overflow-hidden grid lg:grid-cols-2">

        {/* ==== Illustration ==== */}
        <div className="hidden lg:flex bg-gradient-to-b from-blue-100 to-indigo-100 p-10 flex-col">
          <div className="h-[15%] flex flex-col justify-end items-center text-center mb-4">
            <h2 className="text-4xl font-bold text-blue-700 mb-2">
              Rejoignez MedCaseGen
            </h2>
            <p className="text-blue-700/90 text-lg">
              Simulations médicales, cas cliniques et collaboration entre experts.
            </p>
          </div>

          <div className="h-[85%] relative rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/images/medical-bg.png"
              alt="Illustration médicale"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* ==== Formulaire ==== */}
        <AnimatePresence>
          <motion.div
            key="form-side"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="p-8 flex flex-col"
          >
            {showConfetti && (
              <Confetti
                width={typeof window !== 'undefined' ? window.innerWidth : 0}
                height={typeof window !== 'undefined' ? window.innerHeight : 0}
              />
            )}

            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Créer un compte
                </h1>
              </div>
              <p className="text-gray-600 text-sm">
                Remplissez le formulaire pour créer votre compte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <InputField
                label="Prénom"
                name="first_name"
                type="text"
                placeholder="Votre prénom"
                value={form.first_name}
                onChange={handleChange}
                error={errors.first_name}
              />
              <InputField
                label="Nom"
                name="last_name"
                type="text"
                placeholder="Votre nom"
                value={form.last_name}
                onChange={handleChange}
                error={errors.last_name}
              />

              <InputField
                label="Nom d'utilisateur"
                name="username"
                type="text"
                placeholder="Choisissez un nom d'utilisateur"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
              />

              <InputField
                label="Adresse email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              // Après le champ email, ajoutez :
              <p className="text-xs text-gray-500 mt-1">
                Vous serez inscrit en tant qu'<strong>Apprenant</strong> par défaut.
                Contactez l'administrateur pour obtenir le rôle Expert.
              </p>

              {/* --- Password + confirm --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="relative">
                  <InputField
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 caractères"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[42px] text-gray-500"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="relative">
                  <InputField
                    label="Confirmer mot de passe"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[42px] text-gray-500"
                    onClick={() => setShowConfirmPassword(v => !v)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/** 
              <SelectField
                label="Rôle"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Sélectionner un rôle' },
                  { value: 'apprenant', label: 'Apprenant' },
                  { value: 'expert', label: 'Expert' },
                ]}
                error={errors.role}
              />
              */}

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </motion.button>

              <p className="text-sm text-gray-600 text-center">
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => router.push('/login')}
                >
                  Se connecter
                </button>
              </p>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
