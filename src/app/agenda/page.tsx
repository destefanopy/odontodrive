import CalendarioMaestro from "@/ui/components/agenda/CalendarioMaestro";
import { getCitas, getUltimosPacientes } from "@/core/api";

export default async function AgendaPage() {
  const citas = await getCitas();
  const pacientes = await getUltimosPacientes();

  return (
    <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agenda Maestra</h1>
          <p className="text-sm text-gray-500 font-medium">
            Atención diaria, semanal y administración de turnos de la clínica.
          </p>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-300 relative z-10 h-[calc(100vh-140px)] min-h-0 mb-4 overflow-hidden">
        <CalendarioMaestro initialCitas={citas} pacientes={pacientes} />
      </div>
    </div>
  );
}
