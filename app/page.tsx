// app/page.tsx — Page d'accueil professionnelle du Générateur de Cas Médicaux
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight,Stethoscope,
  Brain,
  Globe,
  Heart,
  Users,
  Shield,
  Zap,
  Award,
  TrendingUp,
  MessageCircle, FileText, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from "next/image";

import Header from "@/components/header"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--text)' }} >
      <Header />
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
          <Link href="/dashboard/generator">
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

      {/* Mission & Vision */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Notre mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Former la prochaine génération de médecins africains avec des outils pédagogiques <span className="font-bold text-blue-600">réalistes, modernes et culturellement pertinents</span>.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Trop souvent, les étudiants en médecine en Afrique étudient sur des cas européens ou américains qui ne reflètent pas leur future réalité quotidienne : paludisme grave, drépanocytose, VIH, tuberculose, HTA non contrôlée, accouchements à risque, etc.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-6">
              MedCaseGen change cela en générant des milliers de cas cliniques <strong>100 % adaptés au terrain africain</strong>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/medical-bg.png" // tu peux remplacer par une vraie photo
              alt="Équipe médicale africaine en formation"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-2xl font-bold">Formation médicale africaine</p>
              <p className="opacity-90">Pour l'Afrique, par l'Afrique</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            MedCaseGen en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: "15 000+", label: "Cas générés" },
              { value: "8", label: "Pays utilisateurs" },
              { value: "96,8%", label: "Précision diagnostique IA" },
              { value: "2 400+", label: "Utilisateurs actifs" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-blue-100 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités clés */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Pourquoi choisir MedCaseGen ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Cas hyper-réalistes", desc: "Noms camerounais/congolais/sénégalais, quartiers réels, habitudes locales, croyances traditionnelles intégrées" },
              { icon: Shield, title: "Validé par des médecins africains", desc: "Chaque cas est revu par notre comité médical basé à Yaoundé, Douala et Dakar" },
              { icon: Users, title: "Pour tous les niveaux", desc: "Externes, internes, résidents, formateurs, préparations ECOS/concours" },
              { icon: Award, title: "Mode examen blanc", desc: "Cas chronométrés avec correction automatique et explication détaillée" },
              { icon: TrendingUp, title: "Mise à jour épidémiologique", desc: "Données actualisées : choléra, rougeole, Ebola, paludisme résistant, etc." },
              { icon: MessageCircle, title: "Communauté active", desc: "Partage de cas, discussions, défis cliniques entre utilisateurs" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
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
        <Footer />
    </div>
  );
}
