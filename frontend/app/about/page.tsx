// app/about/page.tsx (ou a-propos/page.tsx)
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Brain,
  Globe,
  Heart,
  Users,
  Shield,
  Zap,
  Award,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                MedCaseGen
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Le premier générateur africain de cas cliniques intelligents powered by IA
              </p>
              <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto opacity-95">
                Conçu par et pour les professionnels de santé en Afrique francophone, MedCaseGen vous aide à créer instantanément des cas cliniques réalistes, adaptés au contexte camerounais et subsaharien.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Brain, title: "IA contextualisée", desc: "Cas adaptés aux pathologies tropicales, ressources locales et contraintes réelles" },
                { icon: Globe, title: "100% Afrique", desc: "Noms, quartiers, habitudes alimentaires, croyances et épidémiologie locale" },
                { icon: Zap, title: "Instantané", desc: "Un cas complet en moins de 10 secondes, prêt à être utilisé en cours ou en examen" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 + 0.6 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20"
                >
                  <item.icon className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-blue-100">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action final */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez la révolution de la formation médicale en Afrique
            </h2>
            <p className="text-xl mb-10 opacity-95">
              Plus de 2 400 médecins, étudiants et formateurs font déjà confiance à MedCaseGen.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition text-lg shadow-lg"
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/dashboard"
                className="border-2 border-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition text-lg backdrop-blur-sm"
              >
                Tester un cas gratuit
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}