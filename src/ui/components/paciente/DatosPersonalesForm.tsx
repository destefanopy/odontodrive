"use client";

import { Save, AlertCircle, User, Phone, MapPin, Briefcase, Heart, Droplet, Hash, Calendar } from "lucide-react";
import { useState } from "react";
import { updatePacienteData, Paciente } from "@/core/api";
import { useRouter } from "next/navigation";

interface DatosProps {
  paciente: Paciente;
}

export default function DatosPersonalesForm({ paciente }: DatosProps) {
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
        nombres_apellidos: formData.get("nombres_apellidos")?.toString() || "",
        telefono_celular: formData.get("telefono_celular")?.toString() || null,
        documento_identidad: formData.get("documento_identidad")?.toString() || null,
        fecha_nacimiento: formData.get("fecha_nacimiento")?.toString() || null,
        sexo: formData.get("sexo")?.toString() || null,
        grupo_sanguineo: formData.get("grupo_sanguineo")?.toString() || null,
        estado_civil: formData.get("estado_civil")?.toString() || null,
        lugar_residencia: formData.get("lugar_residencia")?.toString() || null,
        profesion: formData.get("profesion")?.toString() || null,
        contacto_urgencia: formData.get("contacto_urgencia")?.toString() || null,
      };
      
      if (!datos.fecha_nacimiento) datos.fecha_nacimiento = null;

      if (!datos.nombres_apellidos.trim()) {
         setErrorMsg("El Nombre y Apellido no pueden estar vacíos.");
         setIsPending(false);
         return;
      }

      await updatePacienteData(paciente.id, datos);
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Error guardando los datos personales.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Datos Personales</h2>
          <p className="text-sm text-gray-500">
            Información sociodemográfica básica del paciente.
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
            <User className="w-4 h-4 text-blue-500" />
            Nombres y Apellidos *
          </label>
          <input
            type="text"
            name="nombres_apellidos"
            defaultValue={paciente.nombres_apellidos || ""}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-500" />
            Documento de Identidad
          </label>
          <input
            type="text"
            name="documento_identidad"
            defaultValue={paciente.documento_identidad || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            defaultValue={paciente.fecha_nacimiento || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            Sexo
          </label>
          <select
            name="sexo"
            defaultValue={paciente.sexo || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm outline-none appearance-none"
          >
            <option value="">Seleccionar...</option>
            <option value="f">Femenino</option>
            <option value="m">Masculino</option>
            <option value="o">Otro</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-red-500" />
            Grupo Sanguíneo
          </label>
          <select
            name="grupo_sanguineo"
            defaultValue={paciente.grupo_sanguineo || ""}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm outline-none appearance-none"
          >
            <option value="">Seleccionar...</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            Estado Civil
          </label>
          <input
            type="text"
            name="estado_civil"
            defaultValue={paciente.estado_civil || ""}
            placeholder="Ej. Soltero, Casado..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-500" />
            Profesión
          </label>
          <input
            type="text"
            name="profesion"
            defaultValue={paciente.profesion || ""}
            placeholder="Ej. Psicóloga, Ingeniero..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            Lugar de Residencia
          </label>
          <input
            type="text"
            name="lugar_residencia"
            defaultValue={paciente.lugar_residencia || ""}
            placeholder="Ej. San Lorenzo, Asunción..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-500" />
            Teléfono Celular
          </label>
          <input
            type="text"
            name="telefono_celular"
            defaultValue={paciente.telefono_celular || ""}
            placeholder="Ej. 0976..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-500" />
            Contacto de Urgencia
          </label>
          <input
            type="text"
            name="contacto_urgencia"
            defaultValue={paciente.contacto_urgencia || ""}
            placeholder="Nombre y relación (Ej. Lucas Santander)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Actualizar Datos"}
        </button>
      </div>
    </form>
  );
}
