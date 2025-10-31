// app/(dashboard)/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Layers,
  Globe,
  Package,
  BarChart3,
  MessageSquare,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { toast } from "sonner";

type NavItem = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const USE_BODY_CLASS = true;


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (USE_BODY_CLASS) {
      document.body.classList.add("dashboard-mode");
    }
    return () => {
      if (USE_BODY_CLASS) document.body.classList.remove("dashboard-mode");
    };
  }, []);


  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };


  const navigation: NavSection[] = [
    {
      title: "Principal",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Vue d'ensemble" },
        { label: "Mon entreprise", href: "/dashboard/company", icon: <Building2 className="w-5 h-5" />, description: "Gérer mon entreprise" },
        { label: "Mes besoins", href: "/dashboard/needs", icon: <FileText className="w-5 h-5" />, description: "Besoins et demandes" },
        { label: "Domaines", href: "/dashboard/domaines", icon: <Layers className="w-5 h-5" />, description: "Secteurs d'activité" },
      ],
    },
    {
      title: "Partenariats",
      items: [
        { label: "Opportunités", href: "/dashboard/opportunities", icon: <Globe className="w-5 h-5" />, description: "Opportunités business" },
        { label: "Mes partenaires", href: "/dashboard/partners", icon: <Users className="w-5 h-5" />, description: "Réseau de partenaires" },
        { label: "Messages", href: "/dashboard/messages", icon: <MessageSquare className="w-5 h-5" />, description: "Messagerie" },
      ],
    },
    {
      title: "Gestion",
      items: [
        { label: "Documents", href: "/dashboard/documents", icon: <FileText className="w-5 h-5" />, description: "Documents partagés" },
        { label: "Offres & Services", href: "/dashboard/offers", icon: <Package className="w-5 h-5" />, description: "Catalogue d'offres" },
        { label: "Statistiques", href: "/dashboard/stats", icon: <BarChart3 className="w-5 h-5" />, description: "Analytiques" },
        { label: "Paramètres", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" />, description: "Préférences" },
      ],
    },
  ];

  const [authLoading, setAuthLoading] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Topbar onOpenSidebar={() => setSidebarOpen(true)} isSidebarOpen={sidebarOpen} />

      {/* Sidebar desktop avec fonction de réduction */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 z-50 overflow-y-auto bg-white border-r border-gray-200 pt-16 transition-all duration-300 ${
        sidebarCollapsed ? "w-22" : "w-72"
      }`}>
        {/* En-tête de la sidebar */}
        <div className="flex items-center justify-between h-10 px-1.5 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Hub</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md mx-auto">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${sidebarCollapsed ? 'mx-auto' : ''}`}
            aria-label={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          {navigation.map((section) => (
            <div key={section.title} className="space-y-3">
              {!sidebarCollapsed && (
                <h3 className="px-4 mb-4 text-xs font-bold text-gray-600 uppercase tracking-widest letter-spacing-1">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center rounded-lg transition-all duration-200 ${
                      sidebarCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3"
                    } ${
                      isActive(item.href)
                        ? "bg-blue-400 text-white shadow-lg shadow-blue-600/20 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title={sidebarCollapsed ? item.label : ""}
                  >
                    {/* Indicateur de sélection - ligne à gauche */}
                    {isActive(item.href) && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}

                    {/* Icône */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`transition-colors duration-200 ${
                          isActive(item.href)
                            ? "text-white"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        {item.icon}
                      </div>

                      {/* Badge */}
                      {item.badge && item.badge > 0 && (
                        <span
                          className={`absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] flex items-center justify-center shadow-md ${
                            sidebarCollapsed ? "scale-75" : ""
                          }`}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>

                    {/* Étiquette et description */}
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 ml-4 flex flex-col">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.description && (
                            <span className="text-xs opacity-75 mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {isActive(item.href) && (
                          <div className="flex-shrink-0 ml-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Pied de page de la sidebar */}
        <div className="border-t border-gray-200 p-4 mt-auto">

          {!sidebarCollapsed && (
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/dashboard/settings" 
                className="text-xs text-gray-700 px-3 py-2 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors font-medium"
              >
                Profil
              </Link>
              <Link href="/logout">
                <button className="text-xs text-red-600 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium w-full">
                  Déconnexion
                </button>
              </Link>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex flex-col gap-2">
              <Link 
                href="/dashboard/settings" 
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex justify-center"
                title="Paramètres"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </Link>
              <Link href="/logout">
                <button 
                  className="p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex justify-center w-full"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)} 
            aria-hidden="true" 
          />
          <aside className="fixed inset-y-0 left-0 w-80 z-50 bg-white border-r border-gray-200 lg:hidden transform transition-transform duration-300 pt-16 shadow-xl">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900">Hub</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive(item.href) 
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium border-l-2 border-blue-600 shadow-sm" 
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`${isActive(item.href) ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"} transition-colors`}>
                            {item.icon}
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[1.25rem] flex items-center justify-center">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="flex-1 ml-3 font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-gray-200 p-4 bg-white">
   
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setSidebarOpen(false)}
                  className="text-sm text-gray-700 px-4 py-2.5 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors font-medium"
                >
                  Profil
                </Link>
                <Link href="/logout">
                  <button className="text-sm text-red-600 px-4 py-2.5 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium w-full">
                    Déconnexion
                  </button>
                </Link>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className={`flex flex-1 flex-col overflow-hidden m-6 transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-24" : "lg:ml-72" }`}>
        <main id="main" className="flex-1 overflow-y-auto lg:p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>

    </div>
  );
}