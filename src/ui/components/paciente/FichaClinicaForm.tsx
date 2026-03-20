"use client";

import { Activity, Pill, Stethoscope, FileText, Save } from "lucide-react";
import { useState } from "react";

export default function FichaClinicaForm() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simula guardado (por ahora Vibe Atómico Local)
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Ficha Médica Base</h2>
          <p className="text-sm text-gray-500">
            Registra los antecedentes de salud generales antes de proceder al tratamiento dental.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Motivo de Consulta
          </label>
          <textarea
            placeholder="Ej. Dolor agudo en la zona molar inferior derecha..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Pill className="w-4 h-4 text-rose-500" />
            Alergias Conocidas
          </label>
          <textarea
            placeholder="Ej. Penicilina, Látex, Ibuprofeno..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-500" />
            Enfermedades Sistémicas / Crónicas
          </label>
          <textarea
            placeholder="Ej. Hipertensión controlada, Diabetes tipo 2..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Observaciones Clínicas Adicionales
          </label>
          <textarea
            placeholder="Notas adicionales o comentarios del odontólogo tratante..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all text-sm outline-none resize-none"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Guardando..." : "Actualizar Ficha Médica"}
        </button>
      </div>
    </form>
  );
}
