import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, Check } from 'lucide-react';

interface OnboardingTooltipProps {
  message: string;
  onNext?: () => void;
  onDismiss?: () => void;
  className?: string;
  isLastStep?: boolean;
}

export default function OnboardingTooltip({
  message,
  onNext,
  onDismiss,
  className = '',
  isLastStep = false,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para que no aparezca de golpe al cargar la página
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-[9999] sm:absolute sm:w-72 sm:bottom-auto sm:left-auto sm:right-auto sm:top-auto sm:inset-auto sm:m-0 animate-in fade-in zoom-in duration-300 ${className}`}>

      
      {/* Contenedor principal */}
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 relative overflow-hidden flex flex-col gap-3">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
        
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 mt-1">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center border border-blue-100 overflow-hidden shadow-sm">
            <Image 
              src="/robot_2.png" 
              alt="Asistente Odontodrive" 
              width={48} 
              height={48} 
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-900 mb-1">Odontodrive AI</h4>
            <p className="text-sm text-gray-600 leading-snug">{message}</p>
          </div>
        </div>

        <div className="flex justify-end mt-1">
          <button 
            onClick={onNext}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-full transition-colors shadow-sm"
          >
            {isLastStep ? (
              <>¡Entendido! <Check size={14} /></>
            ) : (
              <>Siguiente <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
