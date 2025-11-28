"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Configuration des pages avec titres médicalisés
const pageConfig: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Accueil",
    description: "Tableau de bord médical et aperçu général.",
  },
  "/dashboard/orders": {
    title: "Commandes",
    description: "Historique et suivi des commandes médicales.",
  },
  "/dashboard/tables": {
    title: "Réservations",
    description: "Gestion des créneaux et planification.",
  },
  "/dashboard/favorites": {
    title: "Mes Favoris",
    description: "Vos examens, cas ou documents enregistrés.",
  },
  "/dashboard/profiles": {
    title: "Profil",
    description: "Informations personnelles et compte utilisateur.",
  },
};

export default function Topbar() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fonction de fallback si page non définie
  const getDefaultPageConfig = (pathname: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment =
      segments[segments.length - 1] || "Dashboard";

    const title = lastSegment
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title,
      description: `Gestion de ${title.toLowerCase()}`,
    };
  };

  const currentPage =
    pageConfig[pathname] || getDefaultPageConfig(pathname);

  return (
    <header
      className="fixed top-0 right-0 z-30 h-20 bg-white dark:bg-gray-900 border-b border-blue-100 shadow-sm dark:shadow-blue-900/20 backdrop-blur-md"
      style={{ left: "288px" }}
    >
      <div className="h-full px-8">
        <div className="flex items-center justify-between h-full">

          {/* --- SECTION GAUCHE --- */}
          <div className="flex flex-col justify-center min-w-[30%]">
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300 leading-tight truncate">
              {currentPage.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
              {currentPage.description}
            </p>
          </div>

          {/* --- BARRE DE RECHERCHE (centrée) --- */}
          <div className="hidden md:flex flex-1 justify-center px-10">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                aria-label="Recherche"
                type="text"
                placeholder="Rechercher un patient, un dossier, un examen..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-blue-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* --- SECTION DROITE : Avatar + Actions --- */}
          <div className="flex items-center gap-6 min-w-[260px] justify-end">

            {/* Sélecteur de langue */}
            <div>
              <select
                className="border border-blue-200 dark:border-gray-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            {/* Profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-4 border-l border-blue-100 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-600 shadow-md">
                  <Image
                    src="/images/avatar-medical.png"
                    alt="Avatar utilisateur"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>

                <div className="hidden xl:block text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    André
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-300">
                    Apprenant
                  </div>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden xl:block" />
              </button>

              {/* Menu déroulant */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                  <Link href="/logout">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-2 transition">
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
