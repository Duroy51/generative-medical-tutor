"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "Comment créer un nouveau patient ?",
    answer:
      "Pour créer un nouveau patient, cliquez sur 'Patients' dans le menu, puis sur 'Nouveau Patient'. Remplissez le formulaire et sauvegardez.",
  },
  {
    question: "Comment générer un cas médical ?",
    answer:
      "Allez dans 'Générateur', sélectionnez un patient ou créez-en un nouveau, puis remplissez les informations du cas et sauvegardez.",
  },
  {
    question: "Comment gérer les paiements ?",
    answer:
      "Dans la section 'Facturation', vous pouvez consulter les paiements, filtrer par patient ou date et suivre le statut de chaque transaction.",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Vous pouvez envoyer un message directement via le formulaire de contact ci-dessous, ou consulter nos guides et FAQ pour assistance rapide.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return alert("Veuillez saisir un message.");
    alert("Message envoyé au support : " + message);
    setMessage("");
  };

  return (
    <div className="p-6 mt-20 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-primary">Centre d'aide & Support</h1>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Questions fréquentes</h2>
        {FAQ_LIST.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition hover:shadow-md"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-100">{faq.question}</span>
              <span className="text-gray-500">{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && (
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Envoyer un message au support</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        ></textarea>
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
