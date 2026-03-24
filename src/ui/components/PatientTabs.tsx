"use client";

import { useState } from "react";
import { User, Activity, CreditCard, FolderOpen, Video, FileText, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import FichaClinicaForm from "./paciente/FichaClinicaForm";
import OdontogramaVisual from "./paciente/OdontogramaVisual";
import DatosPersonalesForm from "./paciente/DatosPersonalesForm";
import PresupuestosView from "./paciente/PresupuestosView";
import ArchivosIA from "./paciente/ArchivosIA";
import PagosView from "./paciente/PagosView";
import { AntecedentesMedicos, Paciente } from "@/core/api";

type TabValue = "datos" | "ficha" | "odontograma" | "presupuestos" | "archivos" | "pagos";

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
    { id: "presupuestos", label: "Cotizador", icon: CreditCard },
    { id: "pagos", label: "Abonos y Deudas", icon: Wallet },
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

        {activeTab === "presupuestos" && <PresupuestosView paciente={paciente} />}

        {activeTab === "pagos" && <PagosView paciente={paciente} />}

        {activeTab === "archivos" && (
          <ArchivosIA pacienteId={paciente.id} />
        )}

      </div>
    </div>
  );
}
