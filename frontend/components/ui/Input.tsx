import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string; // Le label est optionnel (utile si on veut juste le champ)
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            {/* Label avec une typographie soignée */}
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    {label}
                </label>
            )}

            {/*
         Le champ input :
         - rounded-xl : Coins bien arrondis (moderne)
         - py-3.5 : Plus de hauteur pour un effet "aéré"
         - focus:ring-4 : Un halo doux lors du clic
         - transition-all : Animation fluide lors du focus
      */}
            <input
                className={`
          w-full px-4 py-3.5 rounded-xl border bg-gray-50 text-gray-900 placeholder:text-gray-400
          focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10
          transition-all duration-300 ease-in-out outline-none
          ${error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }
          ${className || ''}
        `}
                {...props}
            />

            {/* Message d'erreur avec animation */}
            {error && (
                <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
}