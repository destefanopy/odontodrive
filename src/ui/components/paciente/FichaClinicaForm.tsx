"use client";

import { Activity, Pill, Stethoscope, FileText, Save, AlertCircle, HeartCrack, Syringe, ClipboardList, Calendar, Coffee, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { saveAntecedentes, AntecedentesMedicos } from "@/core/api";
import { useRouter } from "next/navigation";

interface FichaProps {
  pacienteId: string;
  initialData?: AntecedentesMedicos | null;
  onUpdate?: () => void;
}

export default function FichaClinicaForm({ pacienteId, initialData, onUpdate }: FichaProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const datos = {
        alergias: formData.get("alergias")?.toString() || null,
        problemas_coagulacion: formData.get("problemas_coagulacion")?.toString() || null,
        enfermedades_sistemicas: formData.get("enfermedades_sistemicas")?.toString() || null,
        internaciones_previas: formData.get("internaciones_previas")?.toString() || null,
        antecedentes_familiares: formData.get("antecedentes_familiares")?.toString() || null,
        medicacion_actual: formData.get("medicacion_actual")?.toString() || null,
        observaciones: formData.get("observaciones")?.toString() || null,
        ultima_consulta_odontologica: formData.get("ultima_consulta_odontologica")?.toString() || null,
        ultima_consulta_medica: formData.get("ultima_consulta_medica")?.toString() || null,
        complicaciones_hemorragias: formData.get("complicaciones_hemorragias")?.toString() || null,
        habitos_viciosos: formData.get("habitos_viciosos")?.toString() || null,
      };
      await saveAntecedentes(pacienteId, datos);
      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Error guardando la ficha clínica.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Ficha Médica Base</h2>
          <p className="text-sm text-gray-700">
            Registra los antecedentes de salud generales antes de proceder al tratamiento dental.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Pill className="w-4 h-4 text-rose-500" />
            Alergias Conocidas
          </label>
          <textarea
            name="alergias"
            defaultValue={initialData?.alergias || ""}
            placeholder="Ej. Penicilina, Látex, Ibuprofeno..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <HeartCrack className="w-4 h-4 text-red-500" />
            Problemas de Coagulación
          </label>
          <textarea
            name="problemas_coagulacion"
            defaultValue={initialData?.problemas_coagulacion || ""}
            placeholder="Ej. Hemofilia, Toma anticoagulantes..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-500" />
            Enfermedades Sistémicas
          </label>
          <textarea
            name="enfermedades_sistemicas"
            defaultValue={initialData?.enfermedades_sistemicas || ""}
            placeholder="Ej. Hipertensión controlada, Diabetes tipo 2..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Internaciones Previas
          </label>
          <textarea
            name="internaciones_previas"
            defaultValue={initialData?.internaciones_previas || ""}
            placeholder="Ej. Cirugía de apéndice en 2015..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            Antecedentes Familiares
          </label>
          <textarea
            name="antecedentes_familiares"
            defaultValue={initialData?.antecedentes_familiares || ""}
            placeholder="Ej. Cáncer de colon en padre..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-emerald-500" />
            Medicación Actual
          </label>
          <textarea
            name="medicacion_actual"
            defaultValue={initialData?.medicacion_actual || ""}
            placeholder="Ej. Losartán 50mg, Levotiroxina..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Última Consulta Odontológica
          </label>
          <textarea
            name="ultima_consulta_odontologica"
            defaultValue={initialData?.ultima_consulta_odontologica || ""}
            placeholder="Ej. Hace 6 meses por limpieza..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            Última Consulta Médica
          </label>
          <textarea
            name="ultima_consulta_medica"
            defaultValue={initialData?.ultima_consulta_medica || ""}
            placeholder="Ej. Chequeo general en 2024..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Complicaciones o Hemorragias
          </label>
          <textarea
            name="complicaciones_hemorragias"
            defaultValue={initialData?.complicaciones_hemorragias || ""}
            placeholder="Ej. Sangrado excesivo en extracción..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-700" />
            Hábitos (Fumar, Alcohol, etc.)
          </label>
          <textarea
            name="habitos_viciosos"
            defaultValue={initialData?.habitos_viciosos || ""}
            placeholder="Ej. Fuma 5 cigarrillos/día, alcohol ocasional..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-700" />
            Observaciones Adicionales
          </label>
          <textarea
            name="observaciones"
            defaultValue={initialData?.observaciones || ""}
            placeholder="Notas u observaciones del doctor..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Actualizar Ficha Médica"}
        </button>
      </div>
    </form>
  );
}
