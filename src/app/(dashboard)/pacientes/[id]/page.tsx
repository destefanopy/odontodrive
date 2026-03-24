"use client";
import { useEffect, useState } from "react";
import { getPacienteById, getOdontograma, getAntecedentes, Paciente, AntecedentesMedicos } from "@/core/api";
import PatientTabs from "@/ui/components/PatientTabs";
import { ArrowLeft, Phone, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import AgendarCitaBoton from "@/ui/components/paciente/AgendarCitaBoton";
import EliminarPacienteBoton from "@/ui/components/paciente/EliminarPacienteBoton";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PacientePerfilPage({ params }: PageProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [initialOdontograma, setOdontograma] = useState<any>(null);
  const [initialAntecedentes, setAntecedentes] = useState<AntecedentesMedicos | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      getPacienteById(params.id),
      getOdontograma(params.id),
      getAntecedentes(params.id)
    ]).then(([p, o, a]) => {
      if (!p) {
        router.push("/pacientes");
        return;
      }
      setPaciente(p);
      setOdontograma(o);
      setAntecedentes(a);
      setLoading(false);
    });
  }, [params.id, router]);

  if (loading || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-gray-500 font-medium animate-pulse">Cargando expediente médico...</p>
      </div>
    );
  }

  const fechaAlta = new Date(paciente.fecha_ingreso).toLocaleDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0 max-w-5xl mx-auto">
      {/* Botón Volver */}
      <Link 
        href="/pacientes" 
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Pacientes
      </Link>

      {/* Header del Paciente */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-extrabold text-3xl shadow-inner border border-teal-100">
            {paciente.nombres_apellidos.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {paciente.nombres_apellidos}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                <Phone className="w-3.5 h-3.5" />
                {paciente.telefono_celular || "Sin teléfono"}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                Alta: {fechaAlta}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <EliminarPacienteBoton pacienteId={paciente.id} nombrePaciente={paciente.nombres_apellidos} />
          <AgendarCitaBoton paciente={paciente} />
        </div>
      </div>

      {/* Contenido Funcional (Pestañas Sub-componentizadas) */}
      <PatientTabs 
        paciente={paciente} 
        initialOdontograma={initialOdontograma} 
        initialAntecedentes={initialAntecedentes}
      />
    </div>
  );
}
