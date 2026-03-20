import { getPacienteById } from "@/core/api";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import PatientTabs from "@/ui/components/PatientTabs";

export default async function PacienteProfilePage({ params }: { params: { id: string } }) {
  const paciente = await getPacienteById(params.id);

  if (!paciente) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0">
      
      {/* Botón de retroceso al listado */}
      <Link href="/pacientes" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a Pacientes
      </Link>

      {/* Header / Tarjeta Principal del Perfil */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-white shadow-md flex items-center justify-center text-teal-700 font-extrabold text-3xl shrink-0">
            {paciente.nombres_apellidos.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {paciente.nombres_apellidos}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {paciente.telefono_celular || 'Teléfono no registrado'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                Dato Demográfico Pendiente
              </span>
            </div>
            <div className="mt-4">
               <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-widest shadow-sm">
                 Activo
               </span>
               <span className="ml-3 text-xs text-gray-400 font-bold uppercase tracking-widest">
                 Ingreso: {new Date(paciente.fecha_ingreso).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-200 transition-colors w-full md:w-auto">
          <Edit className="w-4 h-4" />
          Editar Datos
        </button>
      </div>

      {/* Gestor Interactivo de Pestañas (Componente Cliente) */}
      <PatientTabs pacienteId={paciente.id} />
      
    </div>
  );
}
