import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useExpertTour(startTour: boolean, setStartTour: (v: boolean) => void) {

    useEffect(() => {
        if (!startTour) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Compris, au travail !',
            nextBtnText: 'Suivant →',
            prevBtnText: 'Retour',
            onDestroyed: () => setStartTour(false),
            steps: [
                {
                    element: '#expert-header-title',
                    popover: {
                        title: 'QG de l\'Expert',
                        description: 'Bienvenue dans votre tour de contrôle. C\'est ici que vous garantissez la qualité médicale de l\'IA.'
                    }
                },
                {
                    element: '#expert-action-import',
                    popover: {
                        title: 'Le flux de données',
                        description: 'Cliquez ici pour aspirer les nouveaux cas depuis l\'hôpital. L\'IA les structurera automatiquement pour vous.'
                    }
                },
                {
                    element: '#expert-filters-bar',
                    popover: {
                        title: 'Filtres de précision',
                        description: 'Utilisez ces filtres pour auditer des cohortes spécifiques (ex: Tous les cas de "Cardiologie" jugés "Difficiles").'
                    }
                },
                {
                    element: '#tour-first-case-card',
                    popover: {
                        title: 'Votre mission principale',
                        description: 'Chaque carte est un patient. Vérifiez le résumé. Si l\'IA a halluciné, corrigez-la ou rejetez le cas.'
                    }
                },
                // NOUVEAU STEP : Focus précis sur les boutons d'action du premier cas
                {
                    element: '#tour-first-case-actions',
                    popover: {
                        title: 'Validation & Rejet',
                        description: 'C\'est ici que vous décidez du sort du cas.\n\n✅ **Approuver** : Le rend accessible aux étudiants.\n❌ **Rejeter** : L\'envoie à la corbeille avec un motif.'
                    }
                }
            ]
        });

        // Petit délai pour laisser le temps au DOM de s'afficher
        setTimeout(() => {
            driverObj.drive();
        }, 800);

    }, [startTour, setStartTour]);
}