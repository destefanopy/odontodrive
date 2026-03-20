import { Card } from "@/ui/components/Card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function Agenda() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Agenda Modular</h1>
        <p className="text-sm text-gray-500">Administra los tiempos de la clínica de forma ágil.</p>
      </div>
      <Card className="flex-1 border-none shadow-xl bg-white flex flex-col items-center justify-center">
         <div className="p-4 bg-accent/20 rounded-full mb-4">
           <CalendarIcon className="w-12 h-12 text-sidebar" />
         </div>
         <h2 className="text-xl font-bold text-gray-800">Calendario de Turnos</h2>
         <p className="text-gray-500 text-sm mt-2">Próximamente: Integración con Dr. Agenda</p>
      </Card>
    </div>
  );
}
