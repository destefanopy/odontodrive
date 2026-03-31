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
  const [clinicTitle, setClinicTitle] = useState("Odontólogo/a");
  const [clinicRegProf, setClinicRegProf] = useState("");
  const [clinicColor, setClinicColor] = useState("#e8701a");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setClinicName(user.user_metadata?.clinic_name || "Clínica Dental");
        setClinicAddress(user.user_metadata?.clinic_address || "Dirección no especificada");
        setClinicPhone(user.user_metadata?.clinic_phone || user.user_metadata?.phone || "");
        setClinicLogoUrl(user.user_metadata?.clinic_logo_url || "");
        setClinicTitle(user.user_metadata?.clinic_title || "Odontólogo/a");
        setClinicRegProf(user.user_metadata?.clinic_reg_prof || "");
        setClinicColor(user.user_metadata?.clinic_color || "#e8701a");
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
    pageStyle: `
      @page { size: A4 landscape; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `
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

  const calcularEdad = (fechaNacimiento?: string | null) => {
    if (!fechaNacimiento) return "___";
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const doctorName = clinicName; // En el formato parece ser el nombre del doctor en grande
  const edad = calcularEdad(paciente.fecha_nacimiento);

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

      {/* Hidden Component for PDF generation (Dual Pane Landscape) */}
      <div className="hidden">
        <div 
          ref={printRef} 
          className="bg-white text-black flex flex-row overflow-hidden relative"
          style={{ width: '297mm', minHeight: '210mm' }} /* Formato A4 Landscape */
        >
          {/* === MITAD IZQUIERDA: RP/ (RECETA) === */}
          <div className="w-1/2 h-full flex flex-col p-10 px-12 relative border-r border-dashed border-gray-400/30">
            
            {/* Logo de Agua de Fondo */}
            {clinicLogoUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clinicLogoUrl} alt="Watermark" className="w-[300px] object-contain grayscale" />
              </div>
            )}

            <div className="flex flex-col h-full relative z-10">
              {/* Membrete Derecha Abajo del Logo */}
              <div 
                className="flex items-start justify-end gap-4 pb-4 border-b-2 mb-6"
                style={{ borderBottomColor: clinicColor }}
              >
                <div className="text-right mt-2">
                  <h1 className="text-xl font-serif italic text-gray-900 leading-tight">{doctorName}</h1>
                  <p className="text-sm font-medium text-gray-600">{clinicTitle}</p>
                  {clinicRegProf && <p className="text-xs text-gray-500 mt-0.5">Reg. Prof. {clinicRegProf}</p>}
                </div>
                {clinicLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clinicLogoUrl} alt="Logo" className="h-20 w-auto object-contain bg-white" />
                )}
              </div>

              {/* Datos Paciente */}
              <div className="mb-6 space-y-2 pb-4 border-b border-gray-200">
                <div className="flex gap-2 items-center">
                  <p className="text-xs font-bold text-gray-600 uppercase w-20">Paciente:</p>
                  <p className="text-sm font-black flex-1 border-b border-dotted border-gray-400">{paciente.nombres_apellidos}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex gap-2 items-center flex-1">
                    <p className="text-xs font-bold text-gray-600 uppercase w-20">C.I. Nº:</p>
                    <p className="text-sm font-bold flex-1 border-b border-dotted border-gray-400">{paciente.documento_identidad || "________________"}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-1">
                    <p className="text-xs font-bold text-gray-600 uppercase w-12">Edad:</p>
                    <p className="text-sm font-bold flex-1 border-b border-dotted border-gray-400 text-center">{edad || "___"}</p>
                  </div>
                </div>
              </div>

              {/* Etiqueta Rp */}
              <div>
                <span 
                  className="text-white font-bold px-3 py-1 rounded shadow-sm text-sm inline-block"
                  style={{ backgroundColor: clinicColor }}
                >
                  Rp.)
                </span>
              </div>

              {/* Cuerpo RP/ */}
              <div className="flex-1 mt-6">
                <div className="space-y-4 pl-2">
                  {medicamentos.length === 0 ? (
                    <p className="text-gray-300 italic text-sm">El recetario está vacío...</p>
                  ) : (
                    medicamentos.map((med, index) => (
                      <div key={med.id}>
                        <p className="text-[14px] font-bold text-gray-900 leading-tight">
                          {index + 1}. {med.nombre}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Firma */}
              <div className="mt-8 flex justify-end">
                <div className="text-center w-48">
                  <div className="border-b border-gray-900 h-10 w-full"></div>
                  <p className="text-[10px] mt-1 font-bold text-gray-500">Firma y Sello</p>
                </div>
              </div>

              {/* Pie de página con teléfono y dirección */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center gap-6 text-[10px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">📍 {clinicAddress}</span>
                <span className="flex items-center gap-1">📞 {clinicPhone}</span>
              </div>
            </div>
          </div>


          {/* === MITAD DERECHA: INDICACIONES === */}
          <div className="w-1/2 h-full flex flex-col p-10 px-12 relative">
            
            {/* Logo de Agua de Fondo */}
            {clinicLogoUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clinicLogoUrl} alt="Watermark" className="w-[300px] object-contain grayscale" />
              </div>
            )}

            <div className="flex flex-col h-full relative z-10">
              {/* Membrete Derecha Abajo del Logo */}
              <div 
                className="flex items-start justify-end gap-4 pb-4 border-b-2 mb-6"
                style={{ borderBottomColor: clinicColor }}
              >
                <div className="text-right mt-2">
                  <h1 className="text-xl font-serif italic text-gray-900 leading-tight">{doctorName}</h1>
                  <p className="text-sm font-medium text-gray-600">{clinicTitle}</p>
                  {clinicRegProf && <p className="text-xs text-gray-500 mt-0.5">Reg. Prof. {clinicRegProf}</p>}
                </div>
                {clinicLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clinicLogoUrl} alt="Logo" className="h-20 w-auto object-contain bg-white" />
                )}
              </div>

              {/* Espacio para alinear visualmente o poner Fecha */}
              <div className="mb-6 pb-4 border-b border-transparent h-[84px] flex items-end justify-end">
                  <p className="text-xs font-bold text-gray-500">Fecha: {fechaImpresion}</p>
              </div>

              {/* Etiqueta Indicaciones */}
              <div>
                <span 
                  className="text-white font-bold px-3 py-1 rounded shadow-sm text-sm inline-block"
                  style={{ backgroundColor: clinicColor }}
                >
                  Indicaciones
                </span>
              </div>

              {/* Cuerpo Indicaciones */}
              <div className="flex-1 mt-6">
                <div className="space-y-6 pl-2">
                  {medicamentos.length === 0 ? (
                    <p className="text-gray-300 italic text-sm">El recetario está vacío...</p>
                  ) : (
                    medicamentos.map((med, index) => (
                      <div key={med.id}>
                        <p className="text-[13px] font-bold text-gray-800 leading-tight">
                          {med.nombre}
                        </p>
                        <p 
                          className="text-[13px] text-gray-900 mt-1 whitespace-pre-line leading-relaxed italic ml-2 border-l-2 pl-3"
                          style={{ borderLeftColor: clinicColor }}
                        >
                          {med.indicaciones}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Firma */}
              <div className="mt-8 flex justify-end">
                <div className="text-center w-48">
                  <div className="border-b border-gray-900 h-10 w-full"></div>
                  <p className="text-[10px] mt-1 font-bold text-gray-500">Firma y Sello</p>
                </div>
              </div>

              {/* Pie de página con teléfono y dirección */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center gap-6 text-[10px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">📍 {clinicAddress}</span>
                <span className="flex items-center gap-1">📞 {clinicPhone}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
