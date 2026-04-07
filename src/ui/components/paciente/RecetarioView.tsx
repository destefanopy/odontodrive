"use client";

import { useState, useEffect, useRef } from "react";
import { Paciente, RecetaDB, getRecetas, createReceta, updateReceta } from "@/core/api";
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

  // Historial
  const [historial, setHistorial] = useState<RecetaDB[]>([]);
  const [recetaId, setRecetaId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    getRecetas(paciente.id).then(setHistorial);
  }, [paciente.id]);

  const handleSelectHistorial = (receta: RecetaDB) => {
    setMedicamentos(receta.medicamentos || []);
    setRecetaId(receta.id);
  };

  const handleNueva = () => {
    setMedicamentos([]);
    setRecetaId(null);
  };

  const handleGuardar = async () => {
    if (medicamentos.length === 0) return;
    setIsSaving(true);
    try {
      if (recetaId) {
        await updateReceta(recetaId, { medicamentos });
      } else {
        const saved = await createReceta({ paciente_id: paciente.id, medicamentos });
        setRecetaId(saved.id);
      }
      const data = await getRecetas(paciente.id);
      setHistorial(data);
    } catch (err: any) {
      alert("Error al guardar receta: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleDelete = async (id: string) => {
    // A placeholder if we want to delete later. Currently didn't import deleteReceta so just reload.
    // If we want it to work: require `deleteReceta`
    if (!confirm("¿Borrar esta receta permanentemente?")) return;
    try {
      const { deleteReceta } = await import("@/core/api");
      await deleteReceta(id);
      if (recetaId === id) handleNueva();
      getRecetas(paciente.id).then(setHistorial);
    } catch (err: any) {
      alert("Error al borrar la receta: " + err.message);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-300">
      
      {/* Columna Izquierda: Historial */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm h-full max-h-[700px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />
              Historial
            </h3>
            <button 
              onClick={handleNueva} 
              className="text-accent bg-accent/10 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-accent/20 transition-colors shadow-sm"
            >
              + Nueva
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {loadingConfig ? (
              <p className="text-sm font-medium text-gray-500 text-center mt-6 animate-pulse">Cargando...</p>
            ) : historial.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mt-4">
                 <p className="text-sm font-medium text-gray-500">No hay recetas previas guardadas.</p>
              </div>
            ) : (
              historial.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => handleSelectHistorial(r)} 
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${recetaId === r.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-gray-100 bg-white hover:border-accent/30 hover:shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${recetaId === r.id ? 'bg-accent/20 text-accent' : 'bg-gray-100 text-gray-600'}`}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={`text-sm font-bold truncate ${recetaId === r.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {Array.isArray(r.medicamentos) && r.medicamentos.length > 0 ? r.medicamentos.map((m: any) => m.nombre).join(', ') : 'Sin medicamentos'}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${recetaId === r.id ? 'text-accent' : 'text-gray-500'}`}>
                    {Array.isArray(r.medicamentos) ? r.medicamentos.length : 0} medicamento(s)
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Editor/Vista Principal */}
      <div className="w-full xl:w-2/3 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">{recetaId ? "Receta Guardada" : "Nueva Receta"}</h2>
            <p className="text-sm font-medium text-gray-600 mt-1">
              Añade los medicamentos e indicaciones aquí.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await handleGuardar();
                handlePrint();
              }}
              disabled={medicamentos.length === 0 || isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Guardar e Imprimir
            </button>
          </div>
        </div>

        {/* Formularios */}
        <div className={`bg-gray-50 border rounded-3xl p-6 overflow-hidden transition-all ${recetaId ? 'border-gray-200' : 'border-gray-100 shadow-sm'}`}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Medicamento o Tratamiento</label>
              <input
                type="text"
                value={currentNombre}
                onChange={(e) => setCurrentNombre(e.target.value)}
                placeholder="Ej. Amoxicilina 875mg / Ác. Clavulánico 125mg"
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Indicaciones</label>
              <textarea
                value={currentIndicaciones}
                onChange={(e) => setCurrentIndicaciones(e.target.value)}
                placeholder="Ej. Tomar 1 comprimido cada 12 hs por 7 días"
                rows={3}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!currentNombre.trim() || !currentIndicaciones.trim()}
              className="flex justify-center items-center gap-2 px-4 py-2 mt-2 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
            >
              <Plus className="w-4 h-4" />
              Añadir a Receta
            </button>
          </form>

          {/* Lista de Edición */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <h4 className="font-bold text-gray-900 border-gray-200 pb-2">Elementos Agregados ({medicamentos.length})</h4>
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
