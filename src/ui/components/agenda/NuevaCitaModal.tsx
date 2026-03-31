"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, FileText } from "lucide-react";
import { Paciente, Cita, createCita, updateCita } from "@/core/api";
import { useRouter } from "next/navigation";

interface NuevaCitaModalProps {
  pacientes: Paciente[];
  initialDate: Date | null;
  existingCita?: Cita | null;
  onClose: () => void;
}

export default function NuevaCitaModal({ pacientes, initialDate, existingCita, onClose }: NuevaCitaModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const formatTimeForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toTimeString().slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const pacienteId = formData.get("paciente_id")?.toString();
      const nombrePaciente = formData.get("nombre_paciente")?.toString();
      const motivo = formData.get("motivo")?.toString() || "Consulta Métrica";
      const fecha = formData.get("fecha")?.toString();
      const horaInicio = formData.get("hora_inicio")?.toString();
      const horaFin = formData.get("hora_fin")?.toString();

      if (!pacienteId || !fecha || !horaInicio || !horaFin) {
        throw new Error("Faltan datos obligatorios para agendar la cita.");
      }

      const fechaInicioStr = `${fecha}T${horaInicio}:00-03:00`;
      const fechaFinStr = `${fecha}T${horaFin}:00-03:00`;

      if (existingCita) {
        await updateCita(existingCita.id!, {
          paciente_id: pacienteId,
          nombre_paciente: nombrePaciente || existingCita.nombre_paciente,
          motivo,
          fecha_inicio: new Date(fechaInicioStr).toISOString(),
          fecha_fin: new Date(fechaFinStr).toISOString(),
        });
      } else {
        await createCita({
          paciente_id: pacienteId,
          nombre_paciente: nombrePaciente || "Paciente",
          motivo,
          fecha_inicio: new Date(fechaInicioStr).toISOString(),
          fecha_fin: new Date(fechaFinStr).toISOString(),
        });
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la cita.");
    } finally {
      setIsPending(false);
    }
  };

  const initDate = existingCita ? new Date(existingCita.fecha_inicio) : initialDate;
  const initEndDate = existingCita ? new Date(existingCita.fecha_fin) : (initialDate ? new Date(initialDate.getTime() + 60 * 60000) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{existingCita ? "Editar Cita" : "Agendar Nueva Cita"}</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 bg-white shadow-sm p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#31b8b3]" />
              Paciente
            </label>
            <select
              name="paciente_id"
              required
              defaultValue={existingCita?.paciente_id || ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
            >
              <option value="">Seleccione un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombres_apellidos}
                </option>
              ))}
            </select>
            <input type="hidden" name="nombre_paciente" id="nombre_paciente_hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                defaultValue={formatDateForInput(initDate)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Hora Inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                defaultValue={formatTimeForInput(initDate) || "09:00"}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
             {/* Offset to second column for visual balance */}
            <div className="space-y-2 col-start-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Hora Fin
              </label>
              <input
                type="time"
                name="hora_fin"
                defaultValue={formatTimeForInput(initEndDate) || "10:00"}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#31b8b3]" />
              Motivo de Consulta
            </label>
            <input
              type="text"
              name="motivo"
              placeholder="Ej. Diagnóstico, Limpieza..."
              defaultValue={existingCita?.motivo || ""}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#31b8b3] text-white shadow-md hover:bg-[#279490] disabled:opacity-70 transition-all"
              onClick={(e) => {
                const select = e.currentTarget.form?.querySelector('select[name="paciente_id"]') as HTMLSelectElement;
                const hiddenInput = e.currentTarget.form?.querySelector('#nombre_paciente_hidden') as HTMLInputElement;
                if (select && hiddenInput) {
                  const selectedOption = select.options[select.selectedIndex];
                  hiddenInput.value = selectedOption.text;
                }
              }}
            >
              {isPending ? "Procesando..." : existingCita ? "Guardar Cambios" : "Confirmar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
