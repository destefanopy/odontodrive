"use client";
import CalendarioMaestro from "@/ui/components/agenda/CalendarioMaestro";
import { useEffect, useState } from "react";
import { getCitas, getTodosLosPacientes, Cita, Paciente } from "@/core/api";
import { Loader2 } from "lucide-react";
import RecordatoriosMananaBoton from "@/ui/components/agenda/RecordatoriosMananaBoton";

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCitas(), getTodosLosPacientes()])
      .then(([c, p]) => {
        setCitas(c);
        setPacientes(p);
      })
      .catch((err) => {
        console.error("Error catastrofico cargando agenda:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-gray-700 font-medium animate-pulse">Sincronizando agenda clínica...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agenda Maestra</h1>
          <p className="text-sm text-gray-700 font-medium">
            Atención diaria, semanal y administración de turnos de la clínica.
          </p>
        </div>
        <div>
          <RecordatoriosMananaBoton citas={citas} pacientes={pacientes} />
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-300 relative z-10 h-[calc(100vh-140px)] min-h-0 mb-4 overflow-hidden">
        <CalendarioMaestro initialCitas={citas} pacientes={pacientes} />
      </div>
    </div>
  );
}
