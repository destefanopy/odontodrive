import CalendarioMaestro from "@/ui/components/agenda/CalendarioMaestro";
import { getCitas, getUltimosPacientes } from "@/core/api";
import Sidebar from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header";

export default async function AgendaPage() {
  const citas = await getCitas();
  const pacientes = await getUltimosPacientes();

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6 flex flex-col">
          <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agenda Maestra</h1>
                <p className="text-sm text-gray-500 font-medium">
                  Atención diaria, semanal y administración de turnos de la clínica.
                </p>
              </div>
            </div>
            
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-300 relative z-10 min-h-[750px]">
              <CalendarioMaestro initialCitas={citas} pacientes={pacientes} />
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
