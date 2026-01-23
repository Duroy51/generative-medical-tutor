import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourConfig {
    startCondition: boolean;
    page: 'dashboard' | 'simulation' | 'profile';
    onComplete?: () => void;
}

export function useStudentTour({ startCondition, page, onComplete }: TourConfig) {

    useEffect(() => {
        // Clés pour le localStorage afin de ne pas répéter le tour
        const tourKey = `hasSeenTour_${page}_v2`; // v2 pour forcer le reset si vous aviez déjà une v1
        const hasSeen = localStorage.getItem(tourKey);

        if (!startCondition || hasSeen) return;

        // --- SCÉNARIO 1 : DASHBOARD ---
        const dashboardSteps = [
            {
                element: '#student-welcome',
                popover: {
                    title: '👋 Bienvenue Docteur !',
                    description: 'Ceci est votre QG médical. C\'est ici que tout commence.'
                }
            },
            {
                element: '#student-hero-action',
                popover: {
                    title: '🚑 Urgences',
                    description: 'Cliquez ici pour prendre en charge un patient aléatoire immédiatement. Idéal pour tester vos réflexes.'
                }
            },
            {
                element: '#student-skills-radar',
                popover: {
                    title: '📈 Votre Progression',
                    description: 'Suivez l\'évolution de vos compétences cliniques en temps réel après chaque cas.'
                }
            },
            {
                element: '#student-library-tabs',
                popover: {
                    title: '📚 Bibliothèque de Cas',
                    description: 'Explorez des cas par spécialité ou revoyez vos anciennes consultations.'
                }
            }
        ];

        // --- SCÉNARIO 2 : SIMULATION (Nouveau Design) ---
        const simulationSteps = [
            {
                element: '#tour-monitor',
                popover: {
                    title: '❤️ Moniteur Patient',
                    description: 'Gardez un œil sur les constantes vitales. Elles évoluent selon vos actions et l\'état du patient.'
                }
            },
            {
                element: '#tour-chat-input',
                popover: {
                    title: '💬 Dialogue Clinique',
                    description: 'Posez vos questions ici. Soyez empathique et précis.'
                }
            },
            {
                element: '#tour-workspace-tools', // ID à ajouter sur SimulationWorkspace
                popover: {
                    title: '🩺 Boîte à Outils',
                    description: 'Accédez aux examens physiques (Auscultation, Palpation...) et à votre bloc-notes.'
                }
            },
            {
                // On pointe vers la zone de chat pour expliquer le nouveau feedback
                element: '#tour-chat-area',
                popover: {
                    title: '💡 Feedback en Direct',
                    description: 'NOUVEAU : Si vous voyez une pastille rouge 🔴 sur votre message, cliquez dessus ! C\'est un conseil critique de votre mentor.'
                }
            },
            {
                element: '#tour-diagnose-btn',
                popover: {
                    title: '✅ Conclure',
                    description: 'Une fois votre enquête terminée, validez votre diagnostic ici.'
                }
            }
        ];

        // --- SCÉNARIO 3 : PROFIL ---
        const profileSteps = [
            {
                element: '#profile-header',
                popover: {
                    title: '👤 Votre Identité',
                    description: 'Votre niveau global et vos badges sont affichés ici.'
                }
            },
            {
                element: '#profile-stats',
                popover: {
                    title: '📊 Statistiques',
                    description: 'Détail de vos performances par domaine médical.'
                }
            },
            {
                element: '#profile-ai-coach',
                popover: {
                    title: '🤖 Coach IA',
                    description: 'Votre mentor personnel analyse vos forces et faiblesses pour vous donner des conseils stratégiques.'
                }
            }
        ];

        let steps = [];
        if (page === 'dashboard') steps = dashboardSteps;
        if (page === 'simulation') steps = simulationSteps;
        if (page === 'profile') steps = profileSteps;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'C\'est parti !',
            nextBtnText: 'Suivant →',
            prevBtnText: 'Retour',
            steps: steps,
            onDestroyed: () => {
                localStorage.setItem(tourKey, 'true');
                if (onComplete) onComplete();
            }
        });

        // Petit délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            driverObj.drive();
        }, 1000);

    }, [startCondition, page]);
}