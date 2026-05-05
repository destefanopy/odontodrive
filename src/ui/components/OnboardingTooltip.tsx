import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface OnboardingTooltipProps {
  message: string;
  onNext?: () => void;
  onDismiss?: () => void;
  className?: string;
  isLastStep?: boolean;
  buttonText?: string;
}

export default function OnboardingTooltip({
  message,
  onNext,
  onDismiss,
  className = '',
  isLastStep = false,
  buttonText,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleNext = () => {
    setIsVisible(false);
    if (onNext) onNext();
  };

  if (!mounted || !isVisible) return null;

  return createPortal(
    <div className={`fixed bottom-4 left-4 right-4 z-[9999] sm:bottom-8 sm:right-8 sm:left-auto sm:w-[320px] sm:m-0 animate-in fade-in slide-in-from-bottom-8 duration-500 ${className}`}>
      
      {/* Contenedor principal */}
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-blue-100/50 p-5 relative overflow-hidden flex flex-col gap-3">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-1"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4 mt-2">
          <div className="w-14 h-14 rounded-full bg-blue-50/50 flex-shrink-0 flex items-center justify-center border border-blue-100 overflow-hidden shadow-sm">
            <Image 
              src="/robot_2.png" 
              alt="Asistente Odontodrive" 
              width={56} 
              height={56} 
              className="object-cover"
            />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-1">Odontodrive AI</h4>
            <p className="text-sm text-gray-600 leading-snug font-medium">{message}</p>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button 
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {isLastStep ? (
              <>¡Entendido! <Check size={14} /></>
            ) : buttonText ? (
              <>{buttonText} <ChevronRight size={14} /></>
            ) : (
              <>Siguiente <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
