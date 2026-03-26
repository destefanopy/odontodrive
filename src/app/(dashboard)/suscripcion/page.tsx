"use client";

import React, { useState, Suspense } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/infrastructure/supabase";

function SuscripcionContent() {
  const [isLoadingPlan, setIsLoadingPlan] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const handleCheckout = async (planId: string) => {
    try {
      if (planId === "free") return; 
      setIsLoadingPlan(planId);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error("Debes iniciar sesión primero.");
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: planId.toLowerCase()
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert("Error procesando pago: " + err.message);
    } finally {
      setIsLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
      
      {isSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm animate-in slide-in-from-top flex-col sm:flex-row text-center sm:text-left">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-black text-lg">¡Pago exitoso y Plan Actualizado!</h3>
            <p className="text-sm font-medium opacity-90">Tu nueva capacidad de almacenamiento ha sido activada en tu cuenta.</p>
          </div>
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
          Almacenamiento y Planes
        </h1>
        <p className="mt-4 text-lg text-gray-600 font-medium">
          Sube tus radiografías, escaneos intraorales y PDFs de alta calidad. 
          Desbloquea el poder completo de la IA sin preocuparte por el espacio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 items-start">
        
        {/* FREE */}
        <PricingCard 
          plan="Free" id="free"
          storage="100 MB" price="0" 
          features={["Historia Clínica Básica", "Agenda de Citas", "Odontograma", "Límite: Archivos muy ligeros"]}
          isPopular={false} color="gray"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "free"}
        />

        {/* BASICO */}
        <PricingCard 
          plan="Básico" id="basico"
          storage="1 GB" price="4" 
          features={["Todo lo de Free", "Análisis con IA (Imágenes/PDF)", "Soporte para fotos intraorales", "Ideal para consultorio único"]}
          isPopular={false} color="blue"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "basico"}
        />

        {/* ESTANDAR */}
        <PricingCard 
          plan="Estándar" id="estandar"
          storage="5 GB" price="10" 
          features={["Todo lo de Básico", "Archivos DICOM / STL ligeros", "Copias de seguridad automáticas", "Soporte por email"]}
          isPopular={true} color="accent"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "estandar"}
        />

        {/* AVANZADO */}
        <PricingCard 
          plan="Avanzado" id="avanzado"
          storage="20 GB" price="20" 
          features={["Todo lo de Estándar", "Radiografías panorámicas masivas", "Múltiples sucursales ligeras", "Soporte prioritario 24/7"]}
          isPopular={false} color="purple"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "avanzado"}
        />

        {/* PREMIUM */}
        <PricingCard 
          plan="Premium" id="premium"
          storage="40 GB" price="30" 
          features={["Todo lo de Avanzado", "Almacenamiento masivo sin límites", "Integración completa clínica", "Análisis médico avanzado"]}
          isPopular={false} color="amber" icon="👑"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "premium"}
        />

      </div>
    </div>
  );
}

export default function SuscripcionPage() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <SuscripcionContent />
    </Suspense>
  );
}

function PricingCard({ plan, id, storage, price, features, isPopular, color, icon, onCheckout, isLoading }: any) {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "bg-accent/10 text-accent border-accent/30 ring-2 ring-accent",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const btnMap: Record<string, string> = {
    gray: "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    blue: "bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50",
    accent: "bg-accent text-white hover:bg-[#1f8c88] shadow-md shadow-accent/20",
    purple: "bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50",
    amber: "bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50",
  };

  return (
    <div className={`relative bg-white rounded-3xl p-6 shadow-sm border ${isPopular ? 'ring-2 ring-accent border-transparent scale-105 z-10' : 'border-gray-100'} flex flex-col h-full transition-transform hover:-translate-y-1`}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-accent text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full">
            Recomendado
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {plan} {icon}
        </h3>
        <p className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colorMap[color]}`}>
          {storage} de Cuota
        </p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-black text-gray-900">${price}</span>
        <span className="text-sm text-gray-500 font-medium">/mes</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start text-sm text-gray-600 font-medium">
            <svg className={`w-5 h-5 mr-3 shrink-0 ${color === 'accent' ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button 
        onClick={() => onCheckout(id)}
        disabled={isLoading || id === 'free'}
        className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-accent ${btnMap[color]} disabled:opacity-50`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (id === 'free' ? 'Plan Actual' : `Elegir ${plan}`)}
      </button>
    </div>
  );
}
