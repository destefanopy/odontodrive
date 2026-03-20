"use client";

import { useState, useTransition } from "react";
import { X, Calendar, Clock, User, FileText } from "lucide-react";
import { Paciente } from "@/core/api";
import { crearCitaAction } from "@/app/pacientes/actions";

interface NuevaCitaModalProps {
  pacientes: Paciente[];
  initialDate: Date | null;
  onClose: () => void;
}

export default function NuevaCitaModal({ pacientes, initialDate, onClose }: NuevaCitaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const formatTimeForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toTimeString().slice(0, 5);
  };

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await crearCitaAction(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Agendar Nueva Cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
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
                defaultValue={formatDateForInput(initialDate)}
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
                defaultValue={formatTimeForInput(initialDate) || "09:00"}
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
                defaultValue={
                  initialDate
                    ? formatTimeForInput(new Date(initialDate.getTime() + 60 * 60000))
                    : "10:00"
                }
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
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#31b8b3] focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
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
              {isPending ? "Agendando..." : "Confirmar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
