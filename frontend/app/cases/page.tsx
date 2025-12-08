// app/cases/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Clock, 
  Activity, 
  ArrowRight, 
  Brain, 
  Stethoscope, 
  Users,
  MapPin,
  TrendingUp,
  Grid3x3,
  List,
  ChevronDown,
  Award,
  BookOpen,
  Target,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

// --- TYPES ---
type Difficulty = "Débutant" | "Intermédiaire" | "Expert";
type ViewMode = "grid" | "list";
type SortOption = "recent" | "popular" | "duration";

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  difficulty: Difficulty;
  duration: string;
  author: string;
  authorAvatar?: string;
  location: string;
  completionRate?: number;
  popularity?: number;
}

// --- DONNÉES MOCKÉES (Enrichies) ---
const CASES_DATA: CaseStudy[] = [
  {
    id: "1",
    title: "Fièvre résistante chez un jeune adulte",
    category: "Infectiologie",
    summary: "Patient de 24 ans revenant d'un séjour au village, présentant une fièvre persistante malgré automédication. Investigation du paludisme résistant.",
    image: "/images/medical-bg.png",
    difficulty: "Débutant",
    duration: "10 min",
    author: "Dr. Kamga",
    location: "Yaoundé, Cameroun",
    completionRate: 0,
    popularity: 245
  },
  {
    id: "2",
    title: "Douleur thoracique et HTA mal contrôlée",
    category: "Cardiologie",
    summary: "Homme de 55 ans, hypertendu connu, se plaint d'une douleur constrictive irradiant vers la mâchoire gauche. Urgence cardiologique.",
    image: "/images/Cardiologie.png",
    difficulty: "Expert",
    duration: "20 min",
    author: "Dr. Ndi",
    location: "Douala, Cameroun",
    completionRate: 0,
    popularity: 892
  },
  {
    id: "3",
    title: "Détresse respiratoire du nourrisson",
    category: "Pédiatrie",
    summary: "Nourrisson de 18 mois admis pour dyspnée sifflante et tirage intercostal en pleine saison des pluies. Diagnostic différentiel pédiatrique.",
    image: "/images/Pneumonie.png",
    difficulty: "Intermédiaire",
    duration: "15 min",
    author: "Pr. Sow",
    location: "Dakar, Sénégal",
    completionRate: 0,
    popularity: 567
  },
  {
    id: "4",
    title: "Troubles de la conscience brutaux",
    category: "Neurologie",
    summary: "Jeune femme de 22 ans amenée par sa famille suite à une perte de connaissance tonico-clonique. Investigation neurologique approfondie.",
    image: "/images/Pneumonie_1.png",
    difficulty: "Intermédiaire",
    duration: "25 min",
    author: "Dr. Diallo",
    location: "Bamako, Mali",
    completionRate: 0,
    popularity: 423
  },
  {
    id: "5",
    title: "Douleur abdominale fosse iliaque droite",
    category: "Chirurgie",
    summary: "Adolescent présentant une douleur progressive avec nausées et fébricule depuis 24h. Suspicion appendicite aiguë.",
    image: "/images/Cardiologie_1.png",
    difficulty: "Débutant",
    duration: "12 min",
    author: "Dr. Atangana",
    location: "Garoua, Cameroun",
    completionRate: 0,
    popularity: 334
  },
  {
    id: "6",
    title: "Crise vaso-occlusive douloureuse",
    category: "Hématologie",
    summary: "Enfant drépanocytaire SS connu, douleurs osseuses intenses suite à une déshydratation. Gestion de la drépanocytose.",
    image: "/images/medical-login.png",
    difficulty: "Intermédiaire",
    duration: "18 min",
    author: "Dr. Bilong",
    location: "Libreville, Gabon",
    completionRate: 0,
    popularity: 498
  },
  {
    id: "7",
    title: "Ictère néonatal sévère",
    category: "Pédiatrie",
    summary: "Nouveau-né de 3 jours avec ictère cutanéo-muqueux intense. Évaluation et prise en charge urgente.",
    image: "/images/medical-bg.png",
    difficulty: "Expert",
    duration: "22 min",
    author: "Dr. Kouassi",
    location: "Abidjan, Côte d'Ivoire",
    completionRate: 0,
    popularity: 712
  },
  {
    id: "8",
    title: "Diabète décompensé aux urgences",
    category: "Endocrinologie",
    summary: "Patient diabétique type 2 admis pour acidocétose diabétique. Gestion des complications métaboliques.",
    image: "/images/Cardiologie.png",
    difficulty: "Intermédiaire",
    duration: "16 min",
    author: "Pr. Mbaye",
    location: "Dakar, Sénégal",
    completionRate: 0,
    popularity: 621
  }
];

const CATEGORIES = ["Tout", "Infectiologie", "Cardiologie", "Pédiatrie", "Neurologie", "Chirurgie", "Hématologie", "Endocrinologie"];
const DIFFICULTIES: (Difficulty | "Tout")[] = ["Tout", "Débutant", "Intermédiaire", "Expert"];
const DURATIONS = ["Tout", "< 15 min", "15-20 min", "> 20 min"];

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "Tout">("Tout");
  const [selectedDuration, setSelectedDuration] = useState("Tout");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 6;

  // Calcul des statistiques
  const totalCases = CASES_DATA.length;
  const completedCases = CASES_DATA.filter(c => c.completionRate && c.completionRate > 0).length;
  const progressPercentage = Math.round((completedCases / totalCases) * 100);

  // Filtrage et tri
  const filteredAndSortedCases = useMemo(() => {
    let filtered = CASES_DATA.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tout" || item.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "Tout" || item.difficulty === selectedDifficulty;
      
      let matchesDuration = true;
      if (selectedDuration !== "Tout") {
        const duration = parseInt(item.duration);
        if (selectedDuration === "< 15 min") matchesDuration = duration < 15;
        else if (selectedDuration === "15-20 min") matchesDuration = duration >= 15 && duration <= 20;
        else if (selectedDuration === "> 20 min") matchesDuration = duration > 20;
      }
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
    });

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "popular") return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === "duration") return parseInt(a.duration) - parseInt(b.duration);
      return 0; // "recent" - ordre par défaut
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedDuration, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCases.length / itemsPerPage);
  const paginatedCases = filteredAndSortedCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper pour la couleur des badges de difficulté
  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case "Débutant": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Intermédiaire": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Expert": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyIcon = (diff: Difficulty) => {
    switch (diff) {
      case "Débutant": return "●";
      case "Intermédiaire": return "●●";
      case "Expert": return "●●●";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 text-slate-800 font-sans">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* --- HERO HEADER SECTION --- */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-3xl blur-3xl -z-10"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/60"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold mb-5 shadow-lg shadow-blue-500/30"
            >
              <Brain className="w-4 h-4" />
              <span>Apprentissage par simulation clinique</span>
            </motion.div>
            
            {/* Titre */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight"
            >
              Bibliothèque de Cas Cliniques
            </motion.h1>
            
            {/* Sous-titre */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed"
            >
              Explorez notre collection de cas cliniques interactifs adaptés au contexte africain.
              Perfectionnez votre raisonnement diagnostique à travers des situations réelles.
            </motion.p>

            {/* Statistiques */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-700">{totalCases}</p>
                  <p className="text-sm text-gray-600">Cas disponibles</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100">
                <div className="bg-amber-600 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-700">3</p>
                  <p className="text-sm text-gray-600">Niveaux de difficulté</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-2xl border border-emerald-100">
                <div className="bg-emerald-600 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-700">{progressPercentage}%</p>
                  <p className="text-sm text-gray-600">Progression globale</p>
                </div>
              </div>
            </motion.div>

            {/* Barre de progression */}
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner"
            >
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* --- STICKY TOOLBAR --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-gray-200/60 mb-10 sticky top-20 z-30"
        >
          {/* Ligne 1: Search + View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            {/* Search Bar */}
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Rechercher un cas (ex: Paludisme, Fièvre...)" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Sort Dropdown */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium cursor-pointer hover:border-blue-300 transition-all outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Plus populaires</option>
                <option value="recent">Plus récents</option>
                <option value="duration">Par durée</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "grid" 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium hover:border-blue-300 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>

          {/* Ligne 2: Filtres (Desktop always visible, Mobile collapsible) */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${
                        selectedCategory === cat 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Difficulté
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff}
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${
                        selectedDifficulty === diff 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Durée
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(dur => (
                    <button
                      key={dur}
                      onClick={() => {
                        setSelectedDuration(dur);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${
                        selectedDuration === dur 
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- RESULTS COUNT --- */}
        {filteredAndSortedCases.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-600 mb-6"
          >
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              {filteredAndSortedCases.length} cas {filteredAndSortedCases.length > 1 ? 'trouvés' : 'trouvé'}
            </span>
          </motion.div>
        )}

        {/* --- GRID / LIST VIEW --- */}
        <AnimatePresence mode="wait">
          {paginatedCases.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* GRID VIEW */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedCases.map((cas, index) => (
                    <motion.div
                      key={cas.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                    >
                      {/* Image Section */}
                      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image 
                          src={cas.image} 
                          alt={cas.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                          <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-blue-800 uppercase tracking-wide shadow-lg border border-blue-100">
                            {cas.category}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 shadow-lg backdrop-blur-md ${getDifficultyColor(cas.difficulty)}`}>
                            {getDifficultyIcon(cas.difficulty)}
                          </span>
                        </div>

                        {/* Popularity Badge */}
                        {cas.popularity && cas.popularity > 500 && (
                          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Populaire
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-4 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-tight">
                            {cas.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                            <span className="truncate">{cas.location}</span>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                            {cas.summary}
                          </p>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-5 pb-5 border-b border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <Clock size={13} className="text-blue-600" /> 
                            <span className="font-medium">{cas.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <Users size={13} className="text-indigo-600" /> 
                            <span className="font-medium">{cas.author}</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Link href={`/dashboard/examens?id=${cas.id}`} className="block">
                          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 group">
                            <Stethoscope size={18} className="group-hover:rotate-12 transition-transform" />
                            Commencer le cas
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {paginatedCases.map((cas, index) => (
                    <motion.div
                      key={cas.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Link href={`/dashboard/examens?id=${cas.id}`}>
                        <div className="flex flex-col sm:flex-row gap-4 p-5">
                          {/* Image */}
                          <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <Image 
                              src={cas.image} 
                              alt={cas.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                                  {cas.category}
                                </span>
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getDifficultyColor(cas.difficulty)}`}>
                                  {cas.difficulty}
                                </span>
                                {cas.popularity && cas.popularity > 500 && (
                                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Populaire
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                {cas.title}
                              </h3>
                              
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {cas.summary}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-blue-500" />
                                <span>{cas.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-blue-600" />
                                <span className="font-medium">{cas.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users size={13} className="text-indigo-600" />
                                <span className="font-medium">{cas.author}</span>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex items-center sm:ml-4">
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl whitespace-nowrap flex items-center gap-2">
                              <Stethoscope size={16} />
                              <span className="hidden sm:inline">Commencer</span>
                              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* --- EMPTY STATE --- */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 shadow-lg"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-full mb-6 shadow-inner">
                <Activity size={56} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun cas trouvé</h3>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Nous n'avons trouvé aucun cas correspondant à vos critères de recherche.
                {searchTerm && <span className="block mt-2 font-medium text-gray-700">Recherche : "{searchTerm}"</span>}
              </p>
              <button 
                onClick={() => { 
                  setSearchTerm(""); 
                  setSelectedCategory("Tout");
                  setSelectedDifficulty("Tout");
                  setSelectedDuration("Tout");
                  setCurrentPage(1);
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Réinitialiser tous les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-12"
          >
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all border-2 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </motion.div>
        )}

      </main>

      <Footer />
    </div>
  );
}