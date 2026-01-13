import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useSimulationTour(startTour: boolean, setStartTour: (v: boolean) => void) {

    useEffect(() => {
        if (!startTour) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Commencer !',
            nextBtnText: 'Suivant',
            prevBtnText: 'Précédent',
            onDestroyed: () => setStartTour(false), // Reset l'état à la fermeture
            steps: [
                {
                    element: '#tour-header-patient',
                    popover: {
                        title: '👨‍⚕️ Le Dossier Patient',
                        description: 'Ici, vous voyez les infos administratives. Le moniteur se remplira automatiquement (TA, Pouls...) dès que vous effectuerez des mesures.'
                    }
                },
                {
                    element: '#tour-chat-area',
                    popover: {
                        title: '💬 L\'Anamnèse (Dialogue)',
                        description: 'Discutez avec le patient ici. Posez des questions pour comprendre ses symptômes et son histoire.'
                    }
                },
                {
                    element: '#tour-tab-tools',
                    popover: {
                        title: '🩺 Actes Cliniques',
                        description: 'Ne restez pas théorique ! Cliquez ici pour effectuer des examens physiques (Tension, Auscultation, etc.).'
                    }
                },
                {
                    element: '#tour-tab-notes',
                    popover: {
                        title: '📝 Bloc-Notes',
                        description: 'Notez vos observations et hypothèses ici. C\'est un brouillon personnel pour structurer votre pensée.'
                    }
                },
                {
                    element: '#tour-mentor-sidecar',
                    popover: {
                        title: '💡 Votre Mentor',
                        description: 'Si vous êtes bloqué ou si vous faites une erreur de raisonnement, le Mentor Socratique apparaîtra ici pour vous guider.'
                    }
                }
            ]
        });

        driverObj.drive();

    }, [startTour, setStartTour]);
}