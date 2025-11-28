"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Confetti from "react-confetti";
import { toast } from "sonner";

type MedicalCase = {
  id: string;
  title: string;
  summary: string;
  description: string;
  image: string;
};

type MedicalCategory = {
  id: string;
  name: string;
  cases: MedicalCase[];
};

const MEDICAL_CATEGORIES: MedicalCategory[] = [
  {
    id: "c1",
    name: "Cardiologie",
    cases: [
      {
        id: "cas1",
        title: "Infarctus aigu du myocarde",
        summary: "Douleurs thoraciques irradiant au bras gauche.",
        description: "Patient masculin de 57 ans, tabagique, douleur thoracique depuis 2h avec sueurs et nausées. ECG suspect ST+ antérieur.",
        image: "/images/Cardiologie.png",
        },
      {
        id: "cas2",
        title: "Insuffisance cardiaque",
        summary:
          "Dyspnée d’effort, orthopnée, œdéme des membres inférieurs.",
        description:
          "Fatigue progressive depuis 10 jours, prise de poids, crépitants bilatéraux, tachycardie légère.",
        image: "/images/Cardiologie_1.png",
      },
    ],
  },
  {
    id: "c2",
    name: "Pneumologie",
    cases: [
      {
        id: "cas3",
        title: "Asthme sévère",
        summary: "Sifflements expiratoires, dyspnée, crise nocturne.",
        description:
          "Exacerbation asthmatique après infection virale, débit expiratoire bas, oxygénation 90%.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/7/75/Asthma_diagram.png",
      },
      {
        id: "cas4",
        title: "Pneumonie communautaire",
        summary: "Fièvre, toux productive purulente.",
        description:
          "Syndrome infectieux, douleur basithoracique droite, suspicion pneumocoque.",
        image: "/images/Pneumonie.png",
      },
    ],
  },
  {
    id: "c3",
    name: "Neurologie",
    cases: [
      {
        id: "cas5",
        title: "AVC ischémique",
        summary: "Déficit moteur brutal, trouble du langage.",
        description:
          "Patient hypertendu, apparition brutale il y a 45 min, score NIHSS = 8, suspicion ACM gauche.",
        image: "/images/Pneumonie_1.png",
      },
      {
        id: "cas6",
        title: "Épilepsie généralisée",
        summary: "Crises tonico-cloniques, post-critique.",
        description:
          "Patient 19 ans, crises répétées, pas de fièvre, examen neuro normal en intercritique.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/EEG_normal.svg",
      },
    ],
  },
];

export default function DashboardPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MedicalCategory | null>(null);
  const [activeMode, setActiveMode] = useState<"garde" | "entrainement">("garde");
  const [userName, setUserName] = useState("Marie");

  const handleNextPatient = () => {
    toast("Simulation d'un patient aléatoire lancée !");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  return (
    <div className="w-full mt-20 max-w-7xl mx-auto relative pb-10">
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      {/* HEADER */}
      <div className="mt-6 mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-300">
            Bonjour {userName} 👋
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aperçu clinique — entraînement et cas à traiter
          </p>
        </div>
      </div>

      {/* MODE */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            activeMode === "garde"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setActiveMode("garde")}
        >
          Garde de Nuit
        </button>

        <button
          className={`px-4 py-2 rounded-md ${
            activeMode === "entrainement"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setActiveMode("entrainement")}
        >
          Entraînement Ciblé
        </button>
      </div>

      {/* MODE GARDE */}
      {activeMode === "garde" && (
        <div className="mb-8">
          <button
            onClick={handleNextPatient}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-sky-700 transition"
          >
            Prochain Patient
          </button>
        </div>
      )}

      {/* MODE ENTRAINEMENT */}
      {activeMode === "entrainement" && (
        <>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
            Catégories médicales
          </h3>

          <div className="flex gap-3 flex-wrap">
            {MEDICAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-md border ${
                  selectedCategory?.id === cat.id
                    ? "bg-sky-600 text-white border-transparent"
                    : "bg-sky-100 text-sky-800 hover:bg-sky-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* CARDS */}
          {selectedCategory && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.cases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      className="object-cover"
                      priority={true}
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {c.title}
                    </h4>

                    <p className="text-sm mt-1 text-slate-500 dark:text-slate-300">
                      {c.summary}
                    </p>

                    <p className="text-sm mt-3 text-slate-600 dark:text-slate-400 line-clamp-3">
                      {c.description}
                    </p>

                    <button
                      className="mt-4 w-full rounded-md bg-sky-600 text-white p-2 hover:bg-sky-700 transition"
                      onClick={() => toast(`Simulation lancée : ${c.title}`)}
                    >
                      Lancer la Simulation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
