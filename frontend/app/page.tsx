// app/page.tsx — Page d'accueil professionnelle du Générateur de Cas Médicaux
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, FileText, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--background)', color: 'var(--text)' }}
    >
      {/* Section Hero */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6 md:px-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4"
        >
          Générateur de Cas Médicaux
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8"
        >
          Créez des cas cliniques interactifs, précis et personnalisés pour la
          formation médicale, l’évaluation des étudiants et la simulation
          clinique.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/generator">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition text-lg shadow-sm">
              <Sparkles size={20} />
              Lancer le générateur
              <ArrowRight size={18} />
            </button>
          </Link>

          <Link href="/about">
            <button className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-full transition text-lg">
              En savoir plus
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-white to-blue-50 border-t border-blue-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10">
            Pourquoi utiliser le Générateur de Cas Médicaux ?
          </h2>

          <div className="grid gap-10 md:grid-cols-3 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Brain size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cas intelligents</h3>
              <p className="text-gray-600 text-sm">
                Génération de cas cliniques cohérents grâce à l’intelligence
                artificielle, adaptés au niveau d’étude ou à la spécialité.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="bg-green-100 text-green-700 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Support pédagogique
              </h3>
              <p className="text-gray-600 text-sm">
                Permet aux enseignants de créer rapidement des supports
                d’évaluation, des QCM ou des cas de simulation réalistes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="bg-indigo-100 text-indigo-700 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Formation continue</h3>
              <p className="text-gray-600 text-sm">
                Idéal pour la mise à jour des connaissances médicales et
                l’autoformation basée sur des cas réalistes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
