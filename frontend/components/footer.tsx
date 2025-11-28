"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Mail, Phone, Stethoscope } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-blue-50 text-gray-800 py-12 border-t border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedCaseGen
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Plateforme innovante de génération de cas médicaux interactifs 
              pour l'apprentissage, la simulation et l'évaluation clinique.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <h4 className="text-lg font-semibold text-blue-700 mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/dashboard/generator" className="hover:text-blue-600 transition-colors duration-200">
                  Générateur
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors duration-200">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors duration-200">
                  À propos
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Ressources */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.09 }}
          >
            <h4 className="text-lg font-semibold text-blue-700 mb-3">Ressources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/dashboard/cas-medicaux" className="hover:text-blue-600 transition-colors duration-200">
                  Cas médicaux
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-blue-600 transition-colors duration-200">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-600 transition-colors duration-200">
                  Support
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <h4 className="text-lg font-semibold text-blue-700 mb-3">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>+237 690 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a
                  href="mailto:contact@medcasegen.com"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  contact@medcasegen.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <a
                  href="https://medcasegen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  www.medcasegen.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <hr className="border-blue-200 mb-6" />

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600"
        >
          <div>
            © {currentYear} MedCaseGen — Tous droits réservés.
          </div>

          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Confidentialité
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Conditions
            </Link>
            <Link
              href="/cookies"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}