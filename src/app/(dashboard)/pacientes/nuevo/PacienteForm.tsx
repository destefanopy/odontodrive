"use client";

import { createPaciente } from "@/core/api";
import { useState } from "react";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Card } from "@/ui/components/Card";
import { useRouter } from "next/navigation";

export default function PacienteForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const nombres_apellidos = formData.get("nombres_apellidos")?.toString() || "";
    const telefono_celular = formData.get("telefono_celular")?.toString() || null;

    if (!nombres_apellidos.trim()) {
      setError("El nombre y apellido son obligatorios.");
      setPending(false);
      return;
    }

    try {
      await createPaciente({ nombres_apellidos, telefono_celular });
      router.push("/pacientes");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "No se pudo crear el paciente.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 md:p-8 space-y-6 bg-white border-none shadow-sm rounded-3xl">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nombres_apellidos" className="text-sm font-bold text-gray-700">
              Nombres y Apellidos *
            </label>
            <input
              type="text"
              id="nombres_apellidos"
              name="nombres_apellidos"
              required
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="telefono_celular" className="text-sm font-bold text-gray-700">
              Teléfono Celular
            </label>
            <input
              type="tel"
              id="telefono_celular"
              name="telefono_celular"
              placeholder="Ej. +56 9 1234 5678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm outline-none"
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 mt-8">
        <Link 
          href="/pacientes"
          className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-full text-sm font-bold transition-colors w-full md:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
        >
          <Save className="w-4 h-4" />
          {pending ? "Guardando..." : "Guardar Paciente"}
        </button>
      </div>
    </form>
  );
}
