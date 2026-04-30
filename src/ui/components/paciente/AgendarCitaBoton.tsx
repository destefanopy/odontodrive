"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import NuevaCitaModal from "../agenda/NuevaCitaModal";
import { Paciente } from "@/core/api";

export default function AgendarCitaBoton({ paciente }: { paciente: Paciente }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Agendar Próxima Cita
      </button>

      {open && (
        <NuevaCitaModal 
          pacientes={[paciente]} 
          initialDate={new Date()} 
          onClose={() => setOpen(false)} 
        />
      )}
    </>
  );
}
