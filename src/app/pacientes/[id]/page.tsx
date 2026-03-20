import { getPacienteById } from "@/core/api";
import PatientTabs from "@/ui/components/PatientTabs";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Calendar } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PacientePerfilPage({ params }: PageProps) {
  const paciente = await getPacienteById(params.id);

  if (!paciente) {
    notFound();
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
      </div>

      {/* Contenido Funcional (Pestañas Sub-componentizadas) */}
      <PatientTabs pacienteId={paciente.id} />
    </div>
  );
}
