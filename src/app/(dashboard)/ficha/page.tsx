import { Card } from "@/ui/components/Card";
import { FileText } from "lucide-react";

export default function FichaClinica() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Fichas Clínicas</h1>
        <p className="text-sm text-gray-700">Historiales médicos y antecedentes detallados.</p>
      </div>
      <Card className="flex-1 border-none shadow-xl bg-white flex flex-col items-center justify-center">
         <div className="p-4 bg-accent/20 rounded-full mb-4">
           <FileText className="w-12 h-12 text-sidebar" />
         </div>
         <h2 className="text-xl font-bold text-gray-800">Directorio de Pacientes</h2>
         <p className="text-gray-700 text-sm mt-2">Gestión de antecedentes y evolución</p>
      </Card>
    </div>
  );
}
