"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePaciente } from "@/core/api";

export default function EliminarPacienteBoton({ pacienteId, nombrePaciente }: { pacienteId: string; nombrePaciente: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const word = window.prompt(
      `⚠️ ADVERTENCIA: Estás a punto de ELIMINAR PERMANENTEMENTE a ${nombrePaciente} de tu clínica.\n\nSe borrará todo: ficha médica, odontogramas, documentos, citas y finanzas. Esta acción es IRREVERSIBLE.\n\nEscribe la palabra 'eliminar' para confirmar y proceder:`
    );

    if (word !== "eliminar") {
      if (word !== null) alert("Operación cancelada: La palabra de confirmación fue incorrecta.");
      return;
    }

    setIsDeleting(true);
    try {
      await deletePaciente(pacienteId);
      alert("Paciente eliminado con éxito.");
      router.push("/pacientes");
    } catch (err: any) {
      alert("Error al eliminar el paciente: " + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-red-200 hover:bg-red-100 transition-all disabled:opacity-70 w-full whitespace-nowrap"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Borrando..." : "Eliminar Paciente"}
    </button>
  );
}
