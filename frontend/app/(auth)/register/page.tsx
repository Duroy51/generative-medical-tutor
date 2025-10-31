'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserPlus, Stethoscope } from 'lucide-react';

interface UserData {
  name: string;
  prenom?: string;
  sexe?: string;
  date_naissance?: string;
  email: string;
  password?: string;
  telephone?: string;
  ville?: string;
  adresse?: string;
  avatar_url?: string;
  bio?: string;
}

export default function InscriptionPageClient() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData>({
    name: '',
    prenom: '',
    sexe: '',
    date_naissance: '',
    email: '',
    ville: '',
    telephone: '',
    adresse: '',
    avatar_url: '',
    bio: '',
  });
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!userData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!userData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = "Format d'email invalide";
    if (!password) newErrors.password = 'Le mot de passe est requis';
    else if (password.length < 6) newErrors.password = 'Le mot de passe doit faire au moins 6 caractères';
    if (!userData.date_naissance) newErrors.date_naissance = 'La date de naissance est requise';
    if (userData.sexe && !['homme', 'femme', ''].includes(userData.sexe)) newErrors.sexe = 'Sexe invalide';
    if (userData.telephone && !/^[+0-9\s-]{7,}$/.test(userData.telephone)) newErrors.telephone = 'Numéro de téléphone invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Veuillez remplir tous les champs requis.');
      return;
    }

    setLoading(true);
    try {
      // Exemple d'appel API à adapter
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Compte créé avec succès 🎉');
      setShowConfetti(true);

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription | MedCaseGen</title>
        <meta
          name="description"
          content="Créez votre compte pour accéder au générateur de cas médicaux, partager et explorer des études cliniques."
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Partie gauche (visuelle) */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-b from-blue-100 to-indigo-100 p-8">
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-bold text-blue-700 mb-3">Rejoignez MedCaseGen</h2>
              <p className="text-blue-700/90 mb-6">
                Créez un compte pour accéder à notre plateforme de génération de cas médicaux, partager vos études et collaborer avec d'autres professionnels de santé.
              </p>
              <div className="relative w-full h-56 rounded-lg overflow-hidden shadow-inner">
                <Image src="/images/medical-bg.jpg" alt="illustration médicale" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Formulaire d’inscription */}
          <AnimatePresence mode="wait">
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.35 }}
              className="p-8"
            >
              {mounted && showConfetti && (
                <Confetti
                  width={typeof window !== 'undefined' ? window.innerWidth : 0}
                  height={typeof window !== 'undefined' ? window.innerHeight : 0}
                />
              )}

              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 flex items-center gap-2 justify-center lg:justify-start">
                  <UserPlus className="w-6 h-6" /> Inscription à MedCaseGen
                </h1>
                <p className="text-gray-600 mt-1">Accédez à un espace dédié aux cas médicaux simulés et réels.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom et prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nom" name="name" value={userData.name} onChange={handleChange} error={errors.name} />
                  <InputField label="Prénom" name="prenom" value={userData.prenom} onChange={handleChange} error={errors.prenom} />
                </div>

                {/* Sexe et date de naissance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Sexe"
                    name="sexe"
                    value={userData.sexe}
                    onChange={handleChange}
                    error={errors.sexe}
                    options={[
                      { value: '', label: 'Sélectionnez' },
                      { value: 'homme', label: 'Homme' },
                      { value: 'femme', label: 'Femme' },
                    ]}
                  />
                  <InputField
                    label="Date de naissance"
                    name="date_naissance"
                    type="date"
                    value={userData.date_naissance}
                    onChange={handleChange}
                    error={errors.date_naissance}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                {/* Email et mot de passe */}
                <InputField label="Email" name="email" type="email" value={userData.email} onChange={handleChange} error={errors.email} />
                <InputField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="Minimum 6 caractères"
                />

                {/* Ville et téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Ville" name="ville" value={userData.ville} onChange={handleChange} error={errors.ville} />
                  <InputField
                    label="Téléphone"
                    name="telephone"
                    type="tel"
                    value={userData.telephone}
                    onChange={handleChange}
                    error={errors.telephone}
                    placeholder="+237 6XXXXXXXX"
                  />
                </div>

                {/* Adresse et bio */}
                <InputField label="Adresse" name="adresse" value={userData.adresse} onChange={handleChange} error={errors.adresse} />
                <TextareaField label="Bio" name="bio" value={userData.bio} onChange={handleChange} error={errors.bio} placeholder="Décrivez votre spécialité, votre domaine d’intérêt..." />

                {/* Lien vers connexion */}
                <div className="text-sm text-gray-600 mt-2">
                  Déjà inscrit ?{' '}
                  <button type="button" className="text-blue-600 hover:underline ml-1" onClick={() => router.push('/login')}>
                    Se connecter
                  </button>
                </div>

                {/* Bouton d'envoi */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition shadow-md ${
                      loading
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {loading ? 'Création du compte...' : 'Créer mon compte'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

/* ---------- Sous-composants de champ réutilisables ---------- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
const InputField: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div>
    <label className="block text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}
const SelectField: React.FC<SelectProps> = ({ label, options, error, ...props }) => (
  <div>
    <label className="block text-gray-700 mb-1">{label}</label>
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}
const TextareaField: React.FC<TextareaProps> = ({ label, error, ...props }) => (
  <div>
    <label className="block text-gray-700 mb-1">{label}</label>
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
      rows={4}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
