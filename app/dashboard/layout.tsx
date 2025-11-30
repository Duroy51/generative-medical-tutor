// app/dashboard/layout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, UserCircle, Calendar, Heart, BarChart3, DollarSign, HelpCircle, ChevronLeft, ChevronRight, Menu, FileText, ChevronDown, LogOut } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { Stethoscope, Pill, AlertCircle, History, Activity } from "lucide-react"; // icônes médicales supplémentaires

import DraggableFloatingButton from "./components/DraggableFloatingButton";
import Topbar from "./components/Topbar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  description?: string;
};

type SidebarProps = {
  children: React.ReactNode;
  className?: string;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// --- Navigation adaptée au thème médical ---

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
    description: "Vue d'ensemble clinique et indicateurs",
  },
  {
    title: "Cas cliniques en Catégories",
    href: "/dashboard/categories",
    icon: FileText, // ou HeartPulse si tu veux quelque chose d’imagerie médicale
    description: "Gestion, analyse et suivi des cas cliniques",
  },
  {
    title: "Examens complémentaires",
    href: "/dashboard/examens",
    icon: Stethoscope, // ou FlaskConical / Microscope selon ta préférence
    description: "Résultats biologiques, imagerie et analyses",
  },
  {
    title: "Traitements en cours",
    href: "/dashboard/traiements",
    icon: Pill, // Lucide : Pill ou Syringe
    description: "Médications, posologies et suivi thérapeutique",
  },
  {
    title: "Diagnostiques",
    href: "/dashboard/diagnostiques",
    icon: AlertCircle,
    description: "Conclusions cliniques et diagnostics différentiels",
  },
  {
    title: "Antécédents médicaux",
    href: "/dashboard/antecedents",
    icon: History,
    description: "Pathologies passées, allergies et interventions",
  },
  {
    title: "Symptômes",
    href: "/dashboard/symptomes",
    icon: Heart,
    description: "Plaintes patient, manifestations et durée",
  },
];

/**

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
    description: "Vue d'ensemble clinique et indicateurs",
  },
  {
    title: "Patients",
    href: "/dashboard/patients",
    icon: Users,
    badge: 3,
    description: "Liste des patients, dossiers et suivi",
  },
  {
    title: "Rendez-vous",
    href: "/dashboard/appointments",
    icon: Calendar,
    description: "Planning, créneaux et gestion des RDV",
  },
  {
    title: "Dossiers de génération",
    href: "/dashboard/generator",
    icon: Heart,
    description: "Dossiers ou cas marqués comme favoris",
  },
  {
    title: "Les cas médicaux",
    href: "/dashboard/cas-medicaux",
    icon: FileText,
    description: "Accédez à tous vos cas médicaux et dossiers patients",
  },
  {
    title: "Statistiques",
    href: "/dashboard/statistiques",
    icon: BarChart3,
    description: "Performance clinique et indicateurs",
  },
];

*/


function Sidebar({ children, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // NOTE: Expanded width = w-72 (18rem = 288px) to match Topbar left: "288px"
  const expandedWidth = "w-72"; // 18rem
  const collapsedWidth = "w-20"; // 5rem

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      {/* Topbar (fixé) */}
      <Topbar />
      <DraggableFloatingButton />

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-transform active:scale-95"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6 text-sky-700 dark:text-sky-300" />
        </button>
      </div>

      <div className="flex flex-1 gap-1 md:gap-4 lg:gap-6 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside
          className={cx(
            "hidden md:flex flex-col transition-all duration-300 ease-out fixed left-0 top-0 bottom-0 h-screen z-40",
            isCollapsed ? collapsedWidth : expandedWidth,
            "bg-gradient-to-b from-sky-800 via-sky-900 to-slate-900 text-white",
            "shadow-2xl border-r border-sky-900/30",
            "overflow-y-auto",
            className
          )}
          // On ajoute padding pour s'aligner au Topbar : Topbar est fixé et overlay, mais ici on laisse le scrolling complet
        >
          {/* Brand */}
          <div className="flex items-center justify-between p-4 border-b border-sky-700/30 flex-shrink-0">
            {!isCollapsed ? (
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shadow-md">
                  {/* Petit logo textuel médical */}
                  <span className="text-white font-bold text-lg">HC</span>
                </div>
                <div className="overflow-hidden">
                  <div className="text-white text-sm font-bold leading-tight">
                    Clinique Pro
                  </div>
                  <div className="text-sky-200 text-xs">Dashboard médical</div>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">HC</span>
                </div>
              </Link>
            )}

            <button
              onClick={() => setIsCollapsed((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors active:scale-95"
              aria-label={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-sky-200" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-sky-200" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            <LayoutGroup>
              {/* Primary navigation */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <div key={item.href} className="relative group">
                      {isActive && !isCollapsed && (
                        <motion.div
                          layoutId="sidebar-active-med"
                          className="absolute inset-0 rounded-lg bg-sky-700/20 border border-sky-600/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      <Link
                        href={item.href}
                        className={cx(
                          "relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive
                            ? "text-sky-50 bg-sky-900/30"
                            : "text-sky-200 hover:text-white hover:bg-sky-900/20"
                        )}
                        aria-current={isActive ? "page" : undefined}
                        title={item.description}
                      >
                        <Icon
                          className={cx(
                            "w-6 h-6 flex-shrink-0 transition-colors duration-200",
                            isActive ? "text-sky-300" : "text-sky-300/70"
                          )}
                        />

                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={cx(
                                  "text-sm font-medium transition-colors",
                                  isActive ? "text-white" : "text-sky-100"
                                )}
                              >
                                {item.title}
                              </span>
                              {item.badge ? (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-rose-500 text-white shadow"
                                >
                                  {item.badge}
                                </motion.span>
                              ) : null}
                            </div>
                            {item.description && (
                              <div className="text-xs text-sky-200 mt-1 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-sky-700/30"></div>

              {/* Secondary navigation
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-sky-200 uppercase tracking-wider">
                  Opérations
                </div>
              )} */}

            </LayoutGroup>
          </nav>

          {/* Footer de la sidebar - profil / déconnexion */}
          <div className="p-4 border-t border-sky-700/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                {/* avatar placeholder; Topbar affichera avatar réel */}
                <span className="text-white font-semibold text-sm">Dr</span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">Dr. André</div>
                  <div className="text-xs text-sky-200">Cardiologue</div>
                </div>
              )}
              <button
                onClick={() => {
                  setIsLoggingOut(true);
                  // Simuler logout (remplace par ta logique réelle)
                  setTimeout(() => {
                    setIsLoggingOut(false);
                    router.push("/logout");
                  }, 600);
                }}
                className="p-2 rounded-md hover:bg-white/5 transition-colors"
                aria-label="Se déconnecter"
              >
                {isLoggingOut ? (
                  <svg
                    className="animate-spin w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" />
                  </svg>
                ) : (
                  <LogOut className="w-5 h-5 text-sky-200" />
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer (simple) */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-72 h-full bg-white shadow-xl overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b">
                <div className="font-bold text-sky-800">Clinique Pro</div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-md">
                  <ChevronDown className="w-5 h-5 text-sky-700" />
                </button>
              </div>
            </motion.aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className={cx(
            "flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8 transition-all duration-300",
            isCollapsed ? "md:ml-20" : "md:ml-72"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}
