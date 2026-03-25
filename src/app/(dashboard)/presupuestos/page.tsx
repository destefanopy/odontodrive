import { Card } from "@/ui/components/Card";
import { CreditCard } from "lucide-react";

export default function Presupuestos() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Presupuestos y Caja</h1>
        <p className="text-sm text-gray-700">Gestión financiera y facturación clínica.</p>
      </div>
      <Card className="flex-1 border-none shadow-xl bg-white flex flex-col items-center justify-center">
         <div className="p-4 bg-accent/20 rounded-full mb-4">
           <CreditCard className="w-12 h-12 text-sidebar" />
         </div>
         <h2 className="text-xl font-bold text-gray-800">Control de Ingresos</h2>
         <p className="text-gray-700 text-sm mt-2">Planes de tratamiento valorizados</p>
      </Card>
    </div>
  );
}
