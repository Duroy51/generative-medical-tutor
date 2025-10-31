'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Menu as MenuIcon,
  X as XIcon,
  LayoutDashboard,
  Stethoscope,
  FileText,
  Phone,
  Info,
  LogIn,
  UserPlus,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <header className="fixed top-0 w-full bg-white/85 backdrop-blur-sm z-50 border-b border-blue-100 transition-all">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:py-4 md:px-6">
        {/* Logo et titre */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-18 h-12">
              <Image
                src="/images/logo.png"
                alt="Générateur de cas médicaux"
                fill
                className="object-contain rounded-md"
                priority
              />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Cas Medicaux
            </span>
          </Link>
        </div>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
            <LayoutDashboard size={16} /> Accueil
          </Link>
          <Link href="/generator" className="hover:text-blue-600 transition flex items-center gap-1">
            <Stethoscope size={16} /> Générateur
          </Link>
          <Link href="/cases" className="hover:text-blue-600 transition flex items-center gap-1">
            <FileText size={16} /> Cas Médicaux
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition flex items-center gap-1">
            <Phone size={16} /> Contact
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition flex items-center gap-1">
            <Info size={16} /> À propos
          </Link>
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
              <LogIn size={16} /> Connexion
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition">
              <UserPlus size={16} /> S’inscrire
            </button>
          </Link>

          {/* Sélecteur de langue */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-3"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Bouton menu mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md border border-blue-200 hover:bg-blue-50 transition"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          height: mobileMenuOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'md:hidden bg-white border-t border-blue-100 overflow-hidden',
          { hidden: !mobileMenuOpen }
        )}
      >
        <div className="p-4 space-y-4">
          <nav className="flex flex-col gap-3 text-gray-700 font-medium">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <LayoutDashboard size={16} /> Accueil
            </Link>
            <Link href="/generator" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <Stethoscope size={16} /> Générateur
            </Link>
            <Link href="/cases" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <FileText size={16} /> Cas Médicaux
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <Phone size={16} /> Contact
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <Info size={16} /> À propos
            </Link>
          </nav>

          {/* Boutons mobile */}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                <LogIn size={16} /> Connexion
              </button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition">
                <UserPlus size={16} /> S’inscrire
              </button>
            </Link>

            {/* Sélecteur langue */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm mt-2"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
