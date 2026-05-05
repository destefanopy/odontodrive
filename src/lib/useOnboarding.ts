import { useState, useEffect } from 'react';

// Tipos de pasos:
// 0: No ha iniciado, debe crear el primer paciente (Paso 1).
// 1: Ya hizo click en nuevo paciente, debe ver el mensaje de "Datos Básicos" (Paso 2).
// 2: Ya guardó, debe ir a la ficha y ver el mensaje de "Ayuda de Ficha" (Paso 3).
// 3: Completado.

const STORAGE_KEY = 'odontodrive_onboarding_step';

export function useOnboarding() {
  const [step, setStep] = useState<number>(-1); // -1 = Loading state
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setStep(parseInt(stored, 10));
    } else {
      setStep(0);
    }
  }, []);

  const nextStep = () => {
    if (step < 3) {
      const newStep = step + 1;
      setStep(newStep);
      localStorage.setItem(STORAGE_KEY, newStep.toString());
      // Emitimos evento por si hay componentes escuchando en la misma vista
      window.dispatchEvent(new Event('onboarding_change'));
    }
  };

  const complete = () => {
    setStep(3);
    localStorage.setItem(STORAGE_KEY, '3');
    window.dispatchEvent(new Event('onboarding_change'));
  };

  const setSpecificStep = (newStep: number) => {
    setStep(newStep);
    localStorage.setItem(STORAGE_KEY, newStep.toString());
    window.dispatchEvent(new Event('onboarding_change'));
  };

  // Escuchar cambios de otros componentes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setStep(parseInt(stored, 10));
      }
    };
    
    window.addEventListener('onboarding_change', handleStorageChange);
    return () => window.removeEventListener('onboarding_change', handleStorageChange);
  }, []);

  return { step, nextStep, complete, setSpecificStep, isClient };
}
