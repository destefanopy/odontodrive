"use client";

import React, { useState, Suspense, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/infrastructure/supabase";

function SuscripcionContent() {
  const [isLoadingPlan, setIsLoadingPlan] = useState<string | null>(null);
  const [errorLog, setErrorLog] = useState<any>(null);

  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"pending" | "success" | "error">("pending");
  const [verifyErrorMsg, setVerifyErrorMsg] = useState("");

  useEffect(() => {
    const subId = searchParams.get("subscription_id");
    if (isSuccess && subId) {
      setIsVerifying(true);
      
      supabase.auth.getSession().then(({ data: sessionData }) => {
        const token = sessionData?.session?.access_token;
        if (!token) {
          setVerifyErrorMsg("No hay sesión activa para procesar el pago.");
          setVerifyStatus("error");
          setIsVerifying(false);
          return;
        }

        fetch("/api/checkout/verify", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ subscription_id: subId })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setVerifyStatus("success");
            // Disparar evento para que el Sidebar se entere inmediatamente del cambio de plan
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event('planUpdated'));
            }
          } else {
            console.error("Verification failed:", data.error);
            setVerifyErrorMsg(data.error || "Error desconocido");
            setVerifyStatus("error");
          }
        })
        .catch((err) => {
          setVerifyErrorMsg(err.message || "Error de red");
          setVerifyStatus("error");
        })
        .finally(() => setIsVerifying(false));
      });
    }
  }, [isSuccess, searchParams]);

  const handleCheckout = async (planId: string) => {
    try {
      setErrorLog(null);
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
      if (!res.ok) {
        // Guardamos todo el objeto de error para que el Odontólogo vea el Dev Log
        setErrorLog(data);
        throw new Error(data.error || "Fallo en Checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      if (!errorLog) setErrorLog({ error: err.message });
    } finally {
      setIsLoadingPlan(null);
    }
  };

  // ======== PANTALLA DE ÉXITO ========
  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center animate-in fade-in zoom-in-95 duration-700">
        
        {isVerifying || verifyStatus === "pending" ? (
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <Loader2 className="w-16 h-16 animate-spin text-accent" />
            <p className="text-xl text-gray-600 font-medium">Validando pago seguro con el banco...</p>
          </div>
        ) : verifyStatus === "success" ? (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">¡Pago Validado y Actualizado!</h1>
            <p className="text-xl text-gray-600 font-medium mb-8">
              Tu cuenta ahora posee todos los beneficios del nuevo plan.
            </p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-amber-50">
              <AlertCircle className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">¡Pago Recibido!</h1>
            <p className="text-xl text-gray-600 font-medium mb-4">
              Hemos recibido tu pago, pero la verificación instantánea está en proceso.
            </p>
            {verifyErrorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-8 max-w-lg mx-auto">
                <p className="font-bold mb-1">Detalle del estado:</p>
                <code>{verifyErrorMsg}</code>
              </div>
            )}
            <p className="text-gray-500 font-medium mb-8 max-w-lg mx-auto">
              Tus beneficios se activarán automáticamente vía Webhook o contacta a soporte si persiste el estado Free.
            </p>
          </>
        )}

        <a 
          href="/cuenta" 
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all hover:-translate-y-1 hover:shadow-xl mt-4"
        >
          {isVerifying ? 'Cargando...' : 'Ir a Mi Cuenta'}
        </a>
      </div>
    );
  }

  // ======== PLANES NORMALES ========
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
      
      {errorLog && (
        <div className="mb-8 bg-black border border-gray-800 text-green-400 p-4 rounded-2xl flex flex-col gap-3 shadow-lg animate-in slide-in-from-top text-left font-mono text-xs overflow-x-auto w-full">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-white">Console Log / Debug Dodo Payments</h3>
            <button onClick={() => setErrorLog(null)} className="text-gray-400 hover:text-white">Cerrar</button>
          </div>
          <p className="text-red-400 font-bold">{errorLog.error}</p>
          <pre>{JSON.stringify(errorLog.devLog || errorLog, null, 2)}</pre>
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
          features={["Hasta 50 pacientes", "100 MB de almacenamiento", "Análisis IA Básico (Imágenes planas)"]}
          isPopular={false} color="gray"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "free"}
        />

        {/* BASICO */}
        <PricingCard 
          plan="Básico" id="basico"
          storage="1 GB" price="4" 
          features={["Pacientes ilimitados", "1 GB de almacenamiento rápido", "Análisis IA Extendido (Textos largos)", "Soporte prioritario asegurado"]}
          isPopular={false} color="blue"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "basico"}
        />

        {/* ESTANDAR */}
        <PricingCard 
          plan="Estándar" id="estandar"
          storage="5 GB" price="10" 
          features={["Pacientes ilimitados", "5 GB de almacenamiento DICOM", "Análisis IA Profundo y detallado", "Soporte prioritario asegurado"]}
          isPopular={true} color="accent"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "estandar"}
        />

        {/* AVANZADO */}
        <PricingCard 
          plan="Avanzado" id="avanzado"
          storage="20 GB" price="20" 
          features={["Pacientes ilimitados", "20 GB de almacenamiento masivo", "Análisis IA Médico sin límites", "Soporte prioritario 24/7"]}
          isPopular={false} color="purple"
          onCheckout={handleCheckout} isLoading={isLoadingPlan === "avanzado"}
        />

        {/* PREMIUM */}
        <PricingCard 
          plan="Premium" id="premium"
          storage="40 GB" price="30" 
          features={["Pacientes ilimitados", "40 GB de almacenamiento expansible", "IA Dedicada de Máximo Rendimiento", "Soporte VIP Exclusivo 24/7"]}
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
