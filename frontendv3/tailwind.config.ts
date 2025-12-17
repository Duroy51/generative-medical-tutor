import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: "#111827",    // Bleu nuit (un peu plus clair)
                    primary: "#D97706", // Orange vibrant (plus chaleureux)
                    primaryHover: "#b45309",
                    light: "#F9FAFB",   // Gris très très clair (presque blanc)
                    secondary: "#60A5FA", // Optionnel, un bleu plus doux
                    success: "#34D399",  // Optionnel, pour les succès (vert)
                    error: "#F87171",    // Optionnel, pour les erreurs (rouge)
                    text: "#374151",     // Gris foncé pour le texte principal
                    muted: "#6B7280",    // Gris moyen pour le texte secondaire
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Police d'Inter, en premier
            },
            boxShadow: {
                DEFAULT: '0 2px 10px rgba(0, 0, 0, 0.07)',  // Ombre subtile
            },
            keyframes: { // Gardez ça : Ce sont les animations
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'blob': 'blob 7s infinite',
            },
        },
    },
    plugins: [],
};
export default config;