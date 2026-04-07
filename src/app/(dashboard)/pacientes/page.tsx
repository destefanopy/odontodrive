"use client";
import { useEffect, useState } from "react";
import { getTodosLosPacientes, Paciente } from "@/core/api";
import { Users, Plus, ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodosLosPacientes()
      .then(data => {
        setPacientes(data);
      })
      .catch(err => {
        console.error("Error catastrofico cargando pacientes:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-gray-700 font-medium animate-pulse">Cargando pacientes de la nube...</p>
      </div>
    );
  }

  const filteredPacientes = pacientes.filter(p => 
    p.nombres_apellidos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 lg:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Pacientes
          </h1>
          <p className="text-sm text-gray-700">
            Listado general y registro de nuevos ingresos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..."
              className="pl-11 pr-4 py-2.5 w-full rounded-full border-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/pacientes/nuevo" className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            Nuevo Paciente
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {pacientes.length === 0 ? (
          <div className="p-12 text-center text-gray-700">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-bold text-gray-900">No hay pacientes aún</p>
            <p className="text-sm mt-1">Has clic en &quot;Nuevo Paciente&quot; para crear su ficha.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredPacientes.map((p) => (
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
                      <p className="text-xs text-gray-700 mt-1">
                        Ingresado: {new Date(p.fecha_ingreso).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-xs font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-50 px-3 py-1.5 rounded-full">
                      Abrir Ficha
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
