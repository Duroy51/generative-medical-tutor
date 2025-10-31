"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, User, ChevronDown, Building2, LogOut } from 'lucide-react';


export default function Topbar({ onOpenSidebar, isSidebarOpen }: { onOpenSidebar: () => void; isSidebarOpen: boolean; }) {
 
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(2);


  return (
    <div 
      className="fixed top-0 right-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
      style={{ left: "288px" }}
    >
      {/* Left Section - Menu button & Brand */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onOpenSidebar}
          aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-900">
            Bonjour, <span className="text-blue-600">{}</span>
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">Bienvenue sur votre espace personnel</p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher entreprises, besoins..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Right Section - Controls & User Menu */}
      <div className="flex items-center gap-4">

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>

        {/* taille Selector */}
        <select
          value={textSize}
          onChange={(e) => setTextSize(e.target.value as 'small' | 'medium' | 'large')}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">Petite</option>
          <option value="medium">Moyenne</option>
          <option value="large">Grande</option>
        </select>


        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full border-2 border-white">
              {unreadMessages}
            </span>
          )}
        </button>

  
      </div>
    </div>
  );
}