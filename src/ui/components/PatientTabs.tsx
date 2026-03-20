"use client";

import { useState } from "react";
import { User, Activity, CreditCard, FolderOpen, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import FichaClinicaForm from "./paciente/FichaClinicaForm";
import OdontogramaVisual from "./paciente/OdontogramaVisual";
import DatosPersonalesForm from "./paciente/DatosPersonalesForm";
import { AntecedentesMedicos, Paciente } from "@/core/api";

type TabValue = "datos" | "ficha" | "odontograma" | "presupuestos" | "archivos";

interface PatientTabsProps {
  paciente: Paciente;
  initialOdontograma: Record<number, string>;
  initialAntecedentes?: AntecedentesMedicos | null;
}

export default function PatientTabs({ paciente, initialOdontograma, initialAntecedentes }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("datos");

  const tabs = [
    { id: "datos", label: "Datos Personales", icon: User },
    { id: "ficha", label: "Historia Médica", icon: FileText },
    { id: "odontograma", label: "Odontograma", icon: Activity },
    { id: "presupuestos", label: "Presupuestos", icon: CreditCard },
    { id: "archivos", label: "Archivos e IA", icon: FolderOpen },
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Selector de Pestañas (Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-gray-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido Dinámico de la Pestaña */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10 min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
        
        {activeTab === "datos" && <DatosPersonalesForm paciente={paciente} />}
        
        {activeTab === "ficha" && <FichaClinicaForm pacienteId={paciente.id} initialData={initialAntecedentes} />}

        {activeTab === "odontograma" && <OdontogramaVisual pacienteId={paciente.id} initialOdontograma={initialOdontograma} />}

        {activeTab === "presupuestos" && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900">Planes de Tratamiento</h2>
            <p className="text-sm text-gray-500">Lista de presupuestos aprobados y caja de pagos del paciente.</p>
            {/* Próximamente: Componente <PresupuestosList /> */}
          </div>
        )}

        {activeTab === "archivos" && (
          <div className="space-y-4 text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Video className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">OdontólogoIA y Radiografías</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Sube una radiografía para que la IA la analice y detecte anomalías automáticamente.</p>
            <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-gray-800">
              Subir Archivo
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
