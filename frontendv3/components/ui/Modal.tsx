"use client";

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Empêcher le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fond sombre flouté */}
            <div
                className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Contenu de la modale */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* En-tête */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Corps */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}