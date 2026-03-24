import { getUltimosPacientes } from "@/core/api";
import { Users, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function PacientesPage() {
  const pacientes = await getUltimosPacientes();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Pacientes
          </h1>
          <p className="text-sm text-gray-500">
            Listado general y registro de nuevos ingresos.
          </p>
        </div>
        <Link href="/pacientes/nuevo" className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-colors w-full md:w-auto">
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {pacientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-bold text-gray-900">No hay pacientes aún</p>
            <p className="text-sm mt-1">Has clic en &quot;Nuevo Paciente&quot; para crear su ficha.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pacientes.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pacientes/${p.id}`}
                  className="flex items-center justify-between p-5 lg:p-6 hover:bg-teal-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sidebar/20 flex items-center justify-center text-teal-700 font-bold text-lg shadow-sm">
                      {p.nombres_apellidos.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {p.nombres_apellidos}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresado: {new Date(p.fecha_ingreso).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
