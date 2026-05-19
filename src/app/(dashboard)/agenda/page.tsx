"use client";
import CalendarioMaestro from "@/ui/components/agenda/CalendarioMaestro";
import { useEffect, useState } from "react";
import { getTodosLosPacientes, getCitasPorRango, Cita, Paciente, getDoctoresAsociados } from "@/core/api";
import { Loader2 } from "lucide-react";
import RecordatoriosMananaBoton from "@/ui/components/agenda/RecordatoriosMananaBoton";
import { supabase } from "@/infrastructure/supabase";

export default function AgendaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [initialCitas, setInitialCitas] = useState<Cita[]>([]);
  const [userRole, setUserRole] = useState<string>("doctor");
  const [doctores, setDoctores] = useState<{id: string, nombre: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendaData = async () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), -15).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString();

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', authData.user.id).single();
          const rol = perfil?.rol || 'doctor';
          setUserRole(rol);

          if (rol === 'secretaria') {
            const docs = await getDoctoresAsociados();
            setDoctores(docs);
          }
        }

        const [p, c] = await Promise.all([getTodosLosPacientes(), getCitasPorRango(start, end)]);
        setPacientes(p);
        setInitialCitas(c);
      } catch (err) {
        console.error("Error catastrofico cargando agenda:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendaData();
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
          <RecordatoriosMananaBoton pacientes={pacientes} />
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-300 relative z-10 h-[calc(100vh-140px)] min-h-0 mb-4 overflow-hidden">
        <CalendarioMaestro initialCitas={initialCitas} pacientes={pacientes} userRole={userRole} doctoresAsociados={doctores} />
      </div>
    </div>
  );
}
