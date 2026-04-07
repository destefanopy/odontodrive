"use client";
import { useEffect, useState, useCallback } from "react";
import { getPacienteById, getOdontograma, getAntecedentes, Paciente, AntecedentesMedicos } from "@/core/api";
import PatientTabs from "@/ui/components/PatientTabs";
import { ArrowLeft, Phone, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import AgendarCitaBoton from "@/ui/components/paciente/AgendarCitaBoton";
import EliminarPacienteBoton from "@/ui/components/paciente/EliminarPacienteBoton";
import { useRouter } from "next/navigation";

import PacienteAvatar from "@/ui/components/paciente/PacienteAvatar";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PacientePerfilPage({ params }: PageProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [initialOdontograma, setOdontogramaInicial] = useState<any>(null);
  const [finalOdontograma, setOdontogramaFinal] = useState<any>(null);
  const [initialAntecedentes, setAntecedentes] = useState<AntecedentesMedicos | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = useCallback(() => {
    Promise.all([
      getPacienteById(params.id),
      getOdontograma(params.id, 'inicial'),
      getOdontograma(params.id, 'final'),
      getAntecedentes(params.id)
    ]).then(([p, od_i, od_f, a]) => {
      if (!p) {
        router.push("/pacientes");
        return;
      }
      setPaciente(p);
      setOdontogramaInicial(od_i);
      setOdontogramaFinal(od_f);
      setAntecedentes(a);
      setLoading(false);
    });
  }, [params.id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-gray-700 font-medium animate-pulse">Cargando expediente médico...</p>
      </div>
    );
  }

  const fechaAlta = new Date(paciente.fecha_ingreso).toLocaleDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0 max-w-5xl mx-auto">
      {/* Botón Volver */}
      <Link 
        href="/pacientes" 
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Pacientes
      </Link>

      {/* Header del Paciente */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PacienteAvatar 
            pacienteId={paciente.id} 
            nombres={paciente.nombres_apellidos} 
            initialFotoUrl={paciente.foto_url} 
            onUploadSuccess={loadData}
          />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              {paciente.nombres_apellidos}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs md:text-sm text-gray-700 font-medium">
              <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                <Phone className="w-3 h-3" />
                {paciente.telefono_celular || "Sin teléfono"}
              </span>
              <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                <Calendar className="w-3 h-3" />
                Alta: {fechaAlta}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <EliminarPacienteBoton pacienteId={paciente.id} nombrePaciente={paciente.nombres_apellidos} />
          <AgendarCitaBoton paciente={paciente} />
        </div>
      </div>

      {/* Contenido Funcional (Pestañas Sub-componentizadas) */}
      <PatientTabs 
        paciente={paciente} 
        initialOdontograma={initialOdontograma} 
        finalOdontograma={finalOdontograma}
        initialAntecedentes={initialAntecedentes}
        onUpdate={loadData}
      />
    </div>
  );
}
