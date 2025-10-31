"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface text-text py-12 border-t border-border">
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
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Générateur de Cas Médicaux
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Une plateforme innovante pour la création de cas cliniques
              interactifs, favorisant l’apprentissage, la simulation et
              l’évaluation dans le domaine médical.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <h4 className="text-lg font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/generator"
                  className="hover:text-primary transition"
                >
                  Générateur
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Contact
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
            <h4 className="text-lg font-semibold mb-3">Contact</h4>

            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+237 690 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a
                  href="mailto:contact@genmed.app"
                  className="hover:text-primary transition"
                >
                  contact@genmed.app
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <a
                  href="https://genmed.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  www.genmed.app
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <hr className="border-border mb-6" />

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-secondary"
        >
          <div>
            © {currentYear} Générateur de Cas Médicaux — Tous droits réservés.
          </div>

          <div className="flex gap-4">
            <Link
              href="/terms"
              className="hover:text-primary transition duration-200"
            >
              Conditions d’utilisation
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition duration-200"
            >
              Politique de confidentialité
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
