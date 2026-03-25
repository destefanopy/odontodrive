import { Card } from "@/ui/components/Card";
import { Bot } from "lucide-react";

export default function OdontologoIA() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          Odontólogo<span className="text-accent bg-sidebar px-2 py-0.5 rounded-md tracking-wider">IA</span>
        </h1>
        <p className="text-sm text-gray-700">Asistente clínico inteligente contextual.</p>
      </div>
      <Card className="flex-1 border-none shadow-xl bg-sidebar text-white flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="p-4 bg-white/10 rounded-full mb-4 relative z-10 backdrop-blur-md border border-white/20">
           <Bot className="w-12 h-12 text-accent animate-pulse" />
         </div>
         <h2 className="text-2xl font-bold text-white relative z-10">Chat Contextual y Visión</h2>
         <p className="text-gray-800 text-sm mt-2 relative z-10">&quot;Súbeme una radiografía o pregúntame por el historial del paciente&quot;</p>
      </Card>
    </div>
  );
}
