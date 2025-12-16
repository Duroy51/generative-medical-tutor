

// app/dashboard/layout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  UserCircle, 
  FileText, 
  MessageSquare, 
  History, 
  Stethoscope, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  LogOut,
  BookOpen,
  UserPlus,
  Settings,
  BarChart
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  role?: string; // Si certaines routes sont r�serv�es � certains r�les
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// --- Navigation adapt�e � MedCaseGen ---
const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
    description: "Vue d'ensemble de vos simulations",
  },
  {
    title: "Cas cliniques",
    href: "/dashboard/cases",
    icon: BookOpen,
    description: "Parcourir les cas disponibles",
  },
  {
    title: "Mes simulations",
    href: "/dashboard/simulations",
    icon: MessageSquare,
    description: "Historique de vos simulations",
  },
  {
    title: "Nouvelle simulation",
    href: "/dashboard/examens",
    icon: Stethoscope,
    description: "D�marrer une nouvelle simulation",
  },
];

// Items pour les experts
const expertNavItems: NavItem[] = [
  {
    title: "Cr�er un cas",
    href: "/dashboard/create-case",
    icon: FileText,
    description: "Cr�er un nouveau cas clinique",
    role: "EXPERT"
  },
  {
    title: "G�rer les cas",
    href: "/dashboard/manage-cases",
    icon: Settings,
    description: "Mod�rer et g�rer les cas",
    role: "EXPERT"
  },
  {
    title: "Statistiques",
    href: "/dashboard/analytics",
    icon: BarChart,
    description: "Analyses et rapports",
    role: "EXPERT"
  },
];

function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const expandedWidth = "w-72";
  const collapsedWidth = "w-20";

  // Filtrer les items en fonction du r�le
  const getFilteredNavItems = () => {
    const baseItems = [...navItems];
    if (user?.role === "EXPERT") {
      baseItems.push(...expertNavItems);
    }
    return baseItems;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("D�connexion r�ussie");
      router.push("/login");
    } catch (error) {
      toast.error("Erreur lors de la d�connexion");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-lg transition-transform active:scale-95"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={cx(
          "hidden md:flex flex-col transition-all duration-300 ease-out",
          "bg-gradient-to-b from-blue-900 to-blue-800 text-white",
          "shadow-2xl",
          "overflow-y-auto h-screen sticky top-0",
          isCollapsed ? collapsedWidth : expandedWidth
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-700">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">MedCaseGen</div>
                <div className="text-blue-200 text-xs">Simulation m�dicale</div>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isCollapsed ? "�tendre la sidebar" : "R�duire la sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-blue-200" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-blue-200" />
            )}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username}
                </div>
                <div className="text-xs text-blue-200">
                  {user.role === "EXPERT" ? "Expert" : "Apprenant"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <LayoutGroup>
            {getFilteredNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <div key={item.href} className="relative group">
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-blue-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <Link
                    href={item.href}
                    className={cx(
                      "relative z-10 flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-blue-100 hover:text-white hover:bg-blue-700/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-blue-200/70 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </LayoutGroup>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-700/50 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin" />
                {!isCollapsed && <span>D�connexion...</span>}
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span>Se d�connecter</span>}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsMobileOpen(false)} 
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="relative w-80 h-full bg-white shadow-xl overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-bold text-gray-900">MedCaseGen</div>
                    <div className="text-sm text-gray-500">Simulation m�dicale</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* User Info Mobile */}
            {user && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.role === "EXPERT" ? "Expert" : "Apprenant"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Mobile */}
            <nav className="p-4 space-y-2">
              {getFilteredNavItems().map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cx(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Se d�connecter</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cx(
          "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-all duration-300",
          "md:ml-0", // Nous utilisons sticky sidebar au lieu de margin
          isCollapsed ? "md:pl-20" : "md:pl-72"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
