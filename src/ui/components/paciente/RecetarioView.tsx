"use client";

import { useState, useEffect, useRef } from "react";
import { Paciente } from "@/core/api";
import { supabase } from "@/infrastructure/supabase";
import { Plus, Trash2, Printer, ClipboardList, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";

interface RecetarioViewProps {
  paciente: Paciente;
}

interface Medicamento {
  id: string;
  nombre: string;
  indicaciones: string;
}

export default function RecetarioView({ paciente }: RecetarioViewProps) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [currentNombre, setCurrentNombre] = useState("");
  const [currentIndicaciones, setCurrentIndicaciones] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Clinic profile
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicLogoUrl, setClinicLogoUrl] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setClinicName(user.user_metadata?.clinic_name || "Clínica Dental");
        setClinicAddress(user.user_metadata?.clinic_address || "Dirección no especificada");
        setClinicPhone(user.user_metadata?.clinic_phone || user.user_metadata?.phone || "");
        setClinicLogoUrl(user.user_metadata?.clinic_logo_url || "");
      }
      setLoadingConfig(false);
    });
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNombre.trim() || !currentIndicaciones.trim()) return;

    setMedicamentos([
      ...medicamentos,
      {
        id: Math.random().toString(36).substr(2, 9),
        nombre: currentNombre,
        indicaciones: currentIndicaciones,
      },
    ]);
    setCurrentNombre("");
    setCurrentIndicaciones("");
  };

  const handleRemove = (id: string) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receta_${paciente.nombres_apellidos.replace(/\s+/g, '_')}`,
  });

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const fechaImpresion = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Título de la sección */}
      <div className="flex flex-col md:flex-row gap-6 justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-accent" /> Recetario Interactivo
          </h2>
          <p className="text-sm text-gray-600 font-medium max-w-lg">
            Añade los medicamentos e indicaciones aquí. Los datos de la clínica se obtienen automáticamente de tu Perfil de Cuenta.
          </p>
        </div>
        <div>
          <button
            onClick={handlePrint}
            disabled={medicamentos.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            Imprimir Receta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario Izquierda */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Medicamento o Tratamiento</label>
              <input
                type="text"
                value={currentNombre}
                onChange={(e) => setCurrentNombre(e.target.value)}
                placeholder="Ej. Amoxicilina 875mg / Ác. Clavulánico 125mg"
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Indicaciones</label>
              <textarea
                value={currentIndicaciones}
                onChange={(e) => setCurrentIndicaciones(e.target.value)}
                placeholder="Ej. Tomar 1 comprimido cada 12 hs por 7 días"
                rows={3}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!currentNombre.trim() || !currentIndicaciones.trim()}
              className="w-full flex justify-center items-center gap-2 py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Añadir a Receta
            </button>
          </form>

          {/* Lista de Edición */}
          <div className="space-y-3 flex-1">
            <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Elementos Agregados</h4>
            {medicamentos.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay medicamentos en la receta.</p>
            ) : (
              medicamentos.map((med) => (
                <div key={med.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-3 group">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{med.nombre}</p>
                    <p className="text-xs text-gray-600 mt-1">{med.indicaciones}</p>
                  </div>
                  <button onClick={() => handleRemove(med.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Previsualización Derecha (visible solo en pantalla) */}
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden hidden lg:flex">
          <span className="absolute top-2 right-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Previsualización (Solo referencia)</span>
          <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-sm rounded-xl text-black flex flex-col opacity-50 select-none pointer-events-none grayscale">
            {/* Membrete Clínica */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-gray-900 mb-6">
              {clinicLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clinicLogoUrl} alt="Logo Clínica" className="h-16 w-auto object-contain" />
              ) : (
                <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 text-xs text-center font-bold">
                  Sin Logo
                </div>
              )}
              <div className="text-right">
                <h1 className="text-lg font-black tracking-tight">{clinicName}</h1>
                <p className="text-xs font-semibold text-gray-600 mt-1">{clinicAddress}</p>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">{clinicPhone}</p>
              </div>
            </div>

            {/* Datos Paciente */}
            <div className="mb-8 space-y-2 flex justify-between items-end border-b border-gray-200 pb-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Paciente</p>
                <p className="text-base font-black">{paciente.nombres_apellidos}</p>
              </div>
            </div>

            {/* Cuerpo de la Receta */}
            <div className="flex-1 min-h-[150px]">
              <h2 className="text-2xl font-black mb-6 italic font-serif">Rp/</h2>
              <div className="space-y-6 pl-4">
                {medicamentos.length === 0 ? (
                  <p className="text-gray-300 italic text-sm">El recetario está vacío...</p>
                ) : (
                  <p className="text-gray-500 text-sm font-bold">{medicamentos.length} medicamento(s) agregado(s)...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Component for PDF generation */}
      <div className="hidden">
        <div 
          ref={printRef} 
          className="w-full bg-white text-black flex flex-col p-12"
          style={{ width: '210mm', minHeight: '297mm' }} /* Formato A4 */
        >
          {/* Membrete Clínica */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-gray-900 mb-6">
            {clinicLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clinicLogoUrl} alt="Logo Clínica" className="h-20 w-auto object-contain max-w-[200px]" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 text-xs text-center font-bold">
                Sin Logo
              </div>
            )}
            <div className="text-right">
              <h1 className="text-2xl font-black tracking-tight">{clinicName}</h1>
              <p className="text-sm font-semibold text-gray-600 mt-1">{clinicAddress}</p>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">{clinicPhone}</p>
            </div>
          </div>

          {/* Datos Paciente */}
          <div className="mb-8 space-y-2 flex justify-between items-end border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Paciente</p>
              <p className="text-lg font-black">{paciente.nombres_apellidos}</p>
              {paciente.documento_identidad && <p className="text-sm text-gray-700 mt-1">C.I.: {paciente.documento_identidad}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Fecha: {fechaImpresion}</p>
            </div>
          </div>

          {/* Cuerpo de la Receta */}
          <div className="flex-1 min-h-[300px]">
            <h2 className="text-3xl font-black mb-8 italic font-serif">Rp/</h2>
            <div className="space-y-8 pl-4">
              {medicamentos.length === 0 ? (
                <p className="text-gray-300 italic text-sm">El recetario está vacío...</p>
              ) : (
                medicamentos.map((med, index) => (
                  <div key={med.id}>
                    <p className="text-[17px] font-bold leading-tight flex gap-2">
                      <span>{index + 1}.</span> {med.nombre}
                    </p>
                    <p className="text-[15px] font-medium text-gray-700 mt-2 pl-4 whitespace-pre-line leading-relaxed">
                      {med.indicaciones}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Firma (Espacio) */}
          <div className="mt-20 pt-8 border-t border-dashed border-gray-300 flex justify-center w-full">
            <div className="text-center w-64">
              <div className="border-b border-gray-900 mb-2 h-16 w-full relative">
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Firma y Sello del Profesional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
