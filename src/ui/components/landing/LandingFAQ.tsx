"use client";

import React, { useState } from 'react';
import { Shield, Sparkles, TrendingUp, Mail, ChevronDown, CreditCard, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingFAQ() {
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
      icon: RefreshCw,
      title: "Migración sin costo",
      content: "Podemos ayudarte con la migración sin ningún costo a este sistema con nuestro servicio técnico.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50"
    },
    {
      icon: Download,
      title: "Disponibilidad de Datos",
      content: "Con Odontodrive siempre dispones de tus datos, tenemos la opción de exportar ficha donde podes descargar en un formato compatible de lectura.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
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
      content: "¿Falta algo? ¿Ocurrió un error? ¡Escríbenos! Puedes enviar un correo directamente a soporte@odontodrive.com y nuestro equipo humano te atenderá a la brevedad.",
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
    <section className="py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Preguntas Frecuentes</h2>
          <p className="text-slate-600 text-lg">Todo lo que necesitas saber sobre OdontoDrive.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const Icon = faq.icon;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "border border-slate-200 rounded-3xl transition-all duration-300 overflow-hidden",
                  isOpen ? "bg-white shadow-lg shadow-cyan-100/50 ring-1 ring-cyan-100" : "bg-slate-50 hover:bg-slate-100/80"
                )}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm", faq.bgColor)}>
                      <Icon className={cn("w-7 h-7", faq.color)} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {faq.title}
                    </h3>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 shadow-sm",
                    isOpen ? "bg-slate-900 text-white rotate-180" : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-6 pt-0 pl-[6.5rem] pr-8 pb-8">
                    <p className="text-slate-600 leading-relaxed font-medium text-base sm:text-lg">
                      {faq.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
