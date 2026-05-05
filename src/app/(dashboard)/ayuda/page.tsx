"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Shield, Sparkles, TrendingUp, Mail, ChevronDown, ChevronUp, Bot, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      icon: Shield,
      title: "Seguridad y Respaldos",
      content: "¡Tu información está segura! Contamos con respaldos de seguridad automáticos y encriptación de grado bancario en nuestros servidores para que nunca pierdas una historia clínica. Toda la data de tus pacientes te pertenece y está resguardada en la nube con los más altos estándares.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Sparkles,
      title: "Diseño e Interfaces",
      content: "Odio los sistemas aburridos y confusos. Por eso, Odontodrive utiliza los mejores estándares de diseño (UI/UX) para que tu experiencia sea fluida, rápida y hermosa. Todo está pensado para que encuentres lo que necesitas en la menor cantidad de clics posibles.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      title: "Mejora Continua",
      content: "El sistema nunca deja de aprender ni de actualizarse. Estamos dispuestos a mejorar constantemente, analizando el feedback de todos los odontólogos para crear nuevas funciones. ¿Tienes una idea? ¡Queremos escucharla!",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "Soporte y Contacto",
      content: "¿Falta algo? ¿Ocurrió un error? ¡Escríbenos! Puedes enviar un correo directamente a soporte@odontodrive.com y nuestro equipo humano (yo solo soy el asistente 🤖) te atenderá a la brevedad.",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: CreditCard,
      title: "Pagos y Transacciones",
      content: "La tranquilidad financiera de tu clínica es clave. Trabajamos con procesadoras de pagos internacionales (como Stripe o MercadoPago) bajo la normativa PCI-DSS, lo que garantiza que todas tus transacciones son 100% seguras y encriptadas. Nosotros nunca almacenamos directamente los datos sensibles de tus tarjetas ni las de tus pacientes.",
      color: "text-rose-500",
      bgColor: "bg-rose-50"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0 max-w-4xl mx-auto">
      {/* Header del Robot */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
        
        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20 shadow-2xl relative z-10">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <Image 
              src="/robot_1.jpg" 
              alt="Odontodrive AI Robot" 
              width={160} 
              height={160}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="text-center md:text-left relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mb-4">
            <Bot className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold tracking-wide text-blue-100 uppercase">Odontodrive AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
            ¿En qué te puedo <br className="hidden md:block" /> ayudar hoy?
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
            Soy tu asistente virtual. Aquí te explico cómo funciona Odontodrive por dentro y respondo las dudas más clásicas.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-6">
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const Icon = faq.icon;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "border border-gray-100 rounded-2xl transition-all duration-300 overflow-hidden",
                  isOpen ? "bg-white shadow-md ring-1 ring-gray-100" : "bg-gray-50 hover:bg-gray-100/80"
                )}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors", faq.bgColor)}>
                      <Icon className={cn("w-6 h-6", faq.color)} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {faq.title}
                    </h3>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen ? "bg-gray-900 text-white rotate-180" : "bg-white text-gray-400 border border-gray-200"
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-5 pt-0 pl-[5.25rem] pr-6 pb-6">
                    <p className="text-gray-600 leading-relaxed font-medium text-sm sm:text-base">
                      {faq.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
