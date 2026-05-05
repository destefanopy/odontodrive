import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, Check } from 'lucide-react';

interface OnboardingTooltipProps {
  message: string;
  onNext?: () => void;
  onDismiss?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  isLastStep?: boolean;
}

export default function OnboardingTooltip({
  message,
  onNext,
  onDismiss,
  position = 'bottom',
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

  const positionClasses = {
    top: 'sm:bottom-full sm:mb-4 sm:left-1/2 sm:-translate-x-1/2',
    bottom: 'sm:top-full sm:mt-4 sm:left-1/2 sm:-translate-x-1/2',
    left: 'sm:right-full sm:mr-4 sm:top-1/2 sm:-translate-y-1/2',
    right: 'sm:left-full sm:ml-4 sm:top-1/2 sm:-translate-y-1/2',
  };

  const arrowClasses = {
    top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-t-white border-r-transparent border-b-transparent border-l-transparent',
    bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-b-white border-r-transparent border-t-transparent border-l-transparent',
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-8px] top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 sm:absolute sm:w-72 sm:bottom-auto sm:left-auto sm:right-auto sm:inset-auto animate-in fade-in zoom-in duration-300 ${positionClasses[position]} ${className}`}>
      {/* Flecha del globo - solo visible en desktop */}
      <div className={`hidden sm:block absolute w-0 h-0 border-[8px] ${arrowClasses[position]}`} />
      
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
