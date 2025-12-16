"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  Stethoscope, 
  Clock, 
  User, 
  Activity,
  Heart,
  Brain,
  AlertCircle,
  ChevronRight,
  Star,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as ApiService from "@/lib/ApiService";

// Types
interface ClinicalCase {
  id: number;
  case_title: string;
  case_summary: string;
  patient_age: number;
  patient_gender: string;
  specialty: string;
  difficulty_level: string;
  estimated_time: number;
  author?: {
    username: string;
  };
  symptoms?: Array<{
    id: number;
    nom: string;
  }>;
}

// Composant Carte de cas
const CaseCard = ({ caseData, onClick }: { caseData: ClinicalCase; onClick: () => void }) => {
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'débutant':
        return 'bg-green-100 text-green-800';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'cardiologie':
        return <Heart className="w-4 h-4" />;
      case 'neurologie':
        return <Brain className="w-4 h-4" />;
      case 'urgences':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="p-5">
        {/* En-tête avec titre et difficulté */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getSpecialtyIcon(caseData.specialty)}
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
              {caseData.case_title}
            </h3>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(caseData.difficulty_level)}`}>
            {caseData.difficulty_level}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {caseData.case_summary}
        </p>

        {/* Métadonnées */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{caseData.patient_age} ans • {caseData.patient_gender === 'M' ? '♂' : '♀'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{caseData.estimated_time || 15} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span className="capitalize">{caseData.specialty}</span>
          </div>
        </div>

        {/* Symptômes */}
        {caseData.symptoms && caseData.symptoms.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
              <AlertCircle className="w-3 h-3" />
              <span>Symptômes principaux</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms.slice(0, 3).map((symptom) => (
                <span 
                  key={symptom.id}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                >
                  {symptom.nom}
                </span>
              ))}
              {caseData.symptoms.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{caseData.symptoms.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bouton Démarrer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {caseData.author && (
            <span className="text-xs text-gray-500">
              Par {caseData.author.username}
            </span>
          )}
          <button className="flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm group">
            <span>Commencer la simulation</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Composant Filtre
const FilterSidebar = ({ 
  filters, 
  setFilters,
  specialties,
  difficultyLevels 
}: { 
  filters: any;
  setFilters: (filters: any) => void;
  specialties: string[];
  difficultyLevels: string[];
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5" />
        Filtres
      </h3>

      {/* Recherche */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rechercher
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Symptôme, spécialité..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Spécialités */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spécialité
        </label>
        <div className="space-y-2">
          {specialties.map((specialty) => (
            <label key={specialty} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={(e) => {
                  const newSpecialties = e.target.checked
                    ? [...filters.specialties, specialty]
                    : filters.specialties.filter((s: string) => s !== specialty);
                  setFilters({ ...filters, specialties: newSpecialties });
                }}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Niveau de difficulté */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Niveau
        </label>
        <div className="space-y-2">
          {difficultyLevels.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.difficulty.includes(level)}
                onChange={(e) => {
                  const newDifficulty = e.target.checked
                    ? [...filters.difficulty, level]
                    : filters.difficulty.filter((d: string) => d !== level);
                  setFilters({ ...filters, difficulty: newDifficulty });
                }}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Réinitialiser */}
      <button
        onClick={() => setFilters({
          search: "",
          specialties: [],
          difficulty: [],
          duration: "all"
        })}
        className="w-full py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
};

export default function ClinicalCasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<ClinicalCase[]>([]);
  
  // État des filtres
  const [filters, setFilters] = useState({
    search: "",
    specialties: [] as string[],
    difficulty: [] as string[],
    duration: "all"
  });

  // Données pour les filtres
  const specialties = ["Cardiologie", "Neurologie", "Pédiatrie", "Urgences", "Médecine générale", "Chirurgie"];
  const difficultyLevels = ["Débutant", "Intermédiaire", "Avancé"];

  // Charger les cas cliniques
  useEffect(() => {
    loadClinicalCases();
  }, []);

  // Filtrer les cas quand les filtres changent
  useEffect(() => {
    let result = cases;

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(cas => 
        cas.case_title.toLowerCase().includes(searchLower) ||
        cas.case_summary.toLowerCase().includes(searchLower) ||
        cas.symptoms?.some(s => s.nom.toLowerCase().includes(searchLower)) ||
        cas.specialty.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par spécialité
    if (filters.specialties.length > 0) {
      result = result.filter(cas => 
        filters.specialties.includes(cas.specialty)
      );
    }

    // Filtre par difficulté
    if (filters.difficulty.length > 0) {
      result = result.filter(cas => 
        filters.difficulty.includes(cas.difficulty_level)
      );
    }

    setFilteredCases(result);
  }, [cases, filters]);

  const loadClinicalCases = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClinicalCases();
      setCases(response.data);
      setFilteredCases(response.data);
    } catch (error: any) {
      console.error("Erreur chargement cas cliniques:", error);
      toast.error("Erreur lors du chargement des cas cliniques");
      
      // Données de démo en cas d'erreur
      const demoCases: ClinicalCase[] = [
        {
          id: 1,
          case_title: "Douleur thoracique aiguë",
          case_summary: "Patient de 52 ans présentant une douleur thoracique constrictive avec irradiation au bras gauche",
          patient_age: 52,
          patient_gender: "M",
          specialty: "Cardiologie",
          difficulty_level: "Intermédiaire",
          estimated_time: 20,
          symptoms: [
            { id: 1, nom: "Douleur thoracique" },
            { id: 2, nom: "Dyspnée" },
            { id: 3, nom: "Sueurs" }
          ]
        },
        {
          id: 2,
          case_title: "Céphalées sévères",
          case_summary: "Femme de 34 ans avec céphalées brutales et vomissements",
          patient_age: 34,
          patient_gender: "F",
          specialty: "Neurologie",
          difficulty_level: "Avancé",
          estimated_time: 25,
          symptoms: [
            { id: 4, nom: "Céphalée" },
            { id: 5, nom: "Vomissements" },
            { id: 6, nom: "Photophobie" }
          ]
        },
        {
          id: 3,
          case_title: "Dyspnée d'effort",
          case_summary: "Homme de 68 ans avec essoufflement progressif à l'effort",
          patient_age: 68,
          patient_gender: "M",
          specialty: "Cardiologie",
          difficulty_level: "Débutant",
          estimated_time: 15,
          symptoms: [
            { id: 7, nom: "Dyspnée" },
            { id: 8, nom: "Fatigue" },
            { id: 9, nom: "Œdèmes" }
          ]
        },
        {
          id: 4,
          case_title: "Douleur abdominale",
          case_summary: "Patient de 28 ans avec douleur épigastrique et nausées",
          patient_age: 28,
          patient_gender: "M",
          specialty: "Urgences",
          difficulty_level: "Intermédiaire",
          estimated_time: 18,
          symptoms: [
            { id: 10, nom: "Douleur abdominale" },
            { id: 11, nom: "Nausées" },
            { id: 12, nom: "Fièvre" }
          ]
        }
      ];
      setCases(demoCases);
      setFilteredCases(demoCases);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseClick = (caseId: number) => {
    router.push(`/cases/${caseId}`);
  };

  const handleStartSimulation = async (caseId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le click sur la carte
    try {
      toast.loading("Démarrage de la simulation...");
      const response = await ApiService.startSimulation(caseId);
      toast.dismiss();
      toast.success("Simulation démarrée !");
      router.push(`/simulations/${response.data.id}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error("Erreur lors du démarrage de la simulation");
      console.error("Erreur démarrage simulation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Cas Cliniques
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Entraînez-vous avec des simulations médicales réalistes. 
                Choisissez un cas, interagissez avec un patient virtuel et développez vos compétences cliniques.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{cases.length}</div>
                <div className="text-sm text-blue-100">Cas disponibles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">
                  {cases.reduce((acc, cas) => acc + (cas.estimated_time || 15), 0)}
                </div>
                <div className="text-sm text-blue-100">Minutes d'apprentissage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Barre de statistiques */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredCases.length}
                </div>
                <div className="text-sm text-gray-600">Cas correspondants</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(filteredCases.map(c => c.specialty)).size}
                </div>
                <div className="text-sm text-gray-600">Spécialités</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredCases.filter(c => c.difficulty_level === "Débutant").length}
                </div>
                <div className="text-sm text-gray-600">Niveau débutant</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredCases.reduce((acc, c) => acc + (c.estimated_time || 15), 0)}
                </div>
                <div className="text-sm text-gray-600">Minutes totales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filtres */}
          <div className="lg:w-1/4">
            <FilterSidebar 
              filters={filters}
              setFilters={setFilters}
              specialties={specialties}
              difficultyLevels={difficultyLevels}
            />
          </div>

          {/* Liste des cas */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucun cas trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCases.map((clinicalCase, index) => (
                  <div 
                    key={clinicalCase.id} 
                    onClick={() => handleCaseClick(clinicalCase.id)}
                  >
                    <CaseCard 
                      caseData={clinicalCase}
                      onClick={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (optionnel) */}
            {filteredCases.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page 1 sur 1
                  </span>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}