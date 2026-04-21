"use client";

import { useState, useRef } from "react";
import { User, Activity, CreditCard, FolderOpen, Video, FileText, Wallet, ClipboardList, BrainCircuit, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import FichaClinicaForm from "./paciente/FichaClinicaForm";
import OdontogramaVisual from "./paciente/OdontogramaVisual";
import DatosPersonalesForm from "./paciente/DatosPersonalesForm";
import PresupuestosView from "./paciente/PresupuestosView";
import ArchivosIA from "./paciente/ArchivosIA";
import OdontologoIA from "./paciente/OdontologoIA";
import PagosView from "./paciente/PagosView";
import RecetarioView from "./paciente/RecetarioView";
import { AntecedentesMedicos, Paciente } from "@/core/api";

type TabValue = "datos" | "ficha" | "odontograma" | "presupuestos" | "archivos" | "pagos" | "recetario" | "ia";

interface PatientTabsProps {
  paciente: Paciente;
  initialOdontograma: Record<number, string>;
  finalOdontograma: Record<number, string>;
  initialAntecedentes?: AntecedentesMedicos | null;
  onUpdate?: () => void;
}

export default function PatientTabs({ paciente, initialOdontograma, finalOdontograma, initialAntecedentes, onUpdate }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("datos");
  const [odontoTipo, setOdontoTipo] = useState<"inicial" | "final">("inicial");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "datos", label: "Datos Personales", icon: User },
    { id: "ficha", label: "Historia Médica", icon: FileText },
    { id: "odontograma", label: "Odontograma", icon: Activity },
    { id: "presupuestos", label: "Presupuestos", icon: CreditCard },
    { id: "pagos", label: "Abonos y Deudas", icon: Wallet },
    { id: "archivos", label: "Archivos", icon: FolderOpen },
    { id: "ia", label: "OdontólogoIA", icon: BrainCircuit },
    { id: "recetario", label: "Recetario", icon: ClipboardList },
  ];

  const scrollTabs = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-8 space-y-6">
      
      {/* Vista Móvil: Interfaz de Carrusel Deslizable con flechas físicas */}
      <div className="md:hidden flex items-center gap-1.5 w-full bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={() => scrollTabs(-150)}
          className="w-8 h-8 shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabValue)}
                className={cn(
                  "snap-center shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/20"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5", isActive ? "text-accent" : "text-gray-600")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => scrollTabs(150)}
          className="w-8 h-8 shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Vista Escritorio: Selector de Pestañas Hoziontal (Desktop) */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabValue)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-gray-900 text-white shadow-md shadow-gray-900/20"
                  : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-gray-800")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido Dinámico de la Pestaña */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10 min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
        
        {activeTab === "datos" && <DatosPersonalesForm paciente={paciente} onUpdate={onUpdate} />}
        
        {activeTab === "ficha" && <FichaClinicaForm pacienteId={paciente.id} initialData={initialAntecedentes} onUpdate={onUpdate} />}

        {activeTab === "odontograma" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex shadow-inner">
                <button 
                  onClick={() => setOdontoTipo("inicial")}
                  className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", odontoTipo === "inicial" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                >
                  Odontograma Inicial
                </button>
                <button 
                  onClick={() => setOdontoTipo("final")}
                  className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", odontoTipo === "final" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                >
                  Odontograma Final
                </button>
              </div>
            </div>
            
            {odontoTipo === "inicial" ? (
              <OdontogramaVisual key="inicial" pacienteId={paciente.id} initialOdontograma={initialOdontograma} tipo="inicial" onUpdate={onUpdate} />
            ) : (
              <OdontogramaVisual key="final" pacienteId={paciente.id} initialOdontograma={finalOdontograma} tipo="final" onUpdate={onUpdate} />
            )}
          </div>
        )}

        {activeTab === "presupuestos" && <PresupuestosView paciente={paciente} />}

        {activeTab === "pagos" && <PagosView paciente={paciente} />}

        {activeTab === "archivos" && (
          <ArchivosIA pacienteId={paciente.id} />
        )}

        {activeTab === "ia" && (
          <OdontologoIA pacienteId={paciente.id} />
        )}

        {activeTab === "recetario" && <RecetarioView paciente={paciente} />}

      </div>
    </div>
  );
}
