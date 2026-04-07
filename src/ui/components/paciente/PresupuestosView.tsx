"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Plus, Trash2, Printer, Save, FileText, CheckCircle2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PresupuestoPDFTemplate from "./PresupuestoPDFTemplate";
import { Paciente, createPresupuesto, getPresupuestos, deletePresupuesto, PresupuestoDB, updatePresupuesto } from "@/core/api";
import { authService } from "@/core/auth";

interface PresupuestoItem {
  id: string;
  descripcion: string;
  costo: number;
}

interface PresupuestosViewProps {
  paciente: Paciente;
}

export default function PresupuestosView({ paciente }: PresupuestosViewProps) {
  // Historial
  const [history, setHistory] = useState<PresupuestoDB[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Editor Activo
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<PresupuestoItem[]>([{ id: crypto.randomUUID(), descripcion: "", costo: 0 }]);
  const [descuento, setDescuento] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  // Metadata clínica
  const [doctorName, setDoctorName] = useState("Doctor/a");
  const [clinicColor, setClinicColor] = useState("#059669");
  const [clinicLogoUrl, setClinicLogoUrl] = useState("");
  const [clinicTitle, setClinicTitle] = useState("Odontólogo/a");
  const [clinicRegProf, setClinicRegProf] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  useEffect(() => {
    loadHistoryData();
    authService.getUser().then(({ data: { user } }) => {
      if (user) {
        setDoctorName(user.user_metadata?.full_name || "Doctor/a");
        setClinicColor(user.user_metadata?.clinic_color || "#059669");
        setClinicLogoUrl(user.user_metadata?.clinic_logo_url || "");
        setClinicTitle(user.user_metadata?.clinic_title || "Odontólogo/a");
        setClinicRegProf(user.user_metadata?.clinic_reg_prof || "");
        setClinicName(user.user_metadata?.clinic_name || "");
        setClinicPhone(user.user_metadata?.clinic_phone || user.user_metadata?.phone || "");
        setClinicAddress(user.user_metadata?.clinic_address || "");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente.id]);

  const loadHistoryData = async () => {
    setLoadingHistory(true);
    const data = await getPresupuestos(paciente.id);
    setHistory(data);
    setLoadingHistory(false);
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Presupuesto_${paciente.nombres_apellidos.replace(/\s+/g, '_')}`,
  });

  const handleCreateNew = () => {
    setActiveId(null);
    setItems([{ id: crypto.randomUUID(), descripcion: "", costo: 0 }]);
    setDescuento(0);
    setMessage("");
  };

  const handleSelectPast = (p: PresupuestoDB) => {
    setActiveId(p.id);
    setItems(p.items);
    setDescuento(Number(p.descuento));
    setMessage("");
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), descripcion: "", costo: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PresupuestoItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.costo) || 0), 0);
  const total = Math.max(0, subtotal - (Number(descuento) || 0));

  const formatGs = (num: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(num);

  const commonTreatments = [
    "Limpieza de sarro completa",
    "Restauración Pieza () oclusal",
    "Resina Estética Pieza () mesial",
    "Incrustación Pieza ()",
    "Extracción simple Pieza ()",
    "Tratamiento de conducto",
    "Ortodoncia (Cuota inicial)",
    "Implante protésico",
    "Ortodoncia Metálico Completo"
  ];

  const handleSave = () => {
    if (items.every(i => !i.descripcion || i.costo === 0)) {
      setMessage("Agrega al menos un ítem válido para guardar.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    startTransition(async () => {
      try {
        if (activeId) {
          await updatePresupuesto(activeId, {
            items,
            descuento,
            subtotal,
            total
          });
          await loadHistoryData();
          setMessage("Presupuesto actualizado exitosamente.");
        } else {
          const np = await createPresupuesto({
            paciente_id: paciente.id,
            items,
            descuento,
            subtotal,
            total
          });
          setActiveId(np.id);
          await loadHistoryData();
          setMessage("Presupuesto guardado exitosamente en el historial.");
        }
        setTimeout(() => setMessage(""), 4000);
      } catch (e: any) {
        console.error("Presupuesto Save Error:", e);
        setMessage(`Error al guardar: ${e.message || 'Desconocido'}`);
        setTimeout(() => setMessage(""), 5000);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar este presupuesto permanentemente?")) return;
    try {
      await deletePresupuesto(id);
      if (activeId === id) handleCreateNew();
      await loadHistoryData();
    } catch (e) {
      console.error(e);
      alert("Error al borrar el presupuesto.");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-300">
      
      {/* Columna Izquierda: Historial */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm h-full max-h-[700px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Historial
            </h3>
            <button 
              onClick={handleCreateNew} 
              className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              + Nuevo
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {loadingHistory ? (
              <p className="text-sm font-medium text-gray-500 text-center mt-6 animate-pulse">Cargando...</p>
            ) : history.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mt-4">
                 <p className="text-sm font-medium text-gray-500">No hay presupuestos previos guardados.</p>
              </div>
            ) : (
              history.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectPast(p)} 
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${activeId === p.id ? 'border-emerald-500 bg-emerald-50/80 shadow-sm' : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${activeId === p.id ? 'bg-emerald-200/50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className={`text-lg font-black truncate ${activeId === p.id ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {formatGs(p.total)}
                  </h4>
                  <p className={`text-xs font-medium mt-1 ${activeId === p.id ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {Array.isArray(p.items) ? p.items.length : 0} ítems / {Number(p.descuento) > 0 ? 'Con descuento' : 'Tarifa base'}
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
            <h2 className="text-2xl font-extrabold text-gray-900">{activeId ? "Presupuesto Archivado" : "Nuevo Presupuesto"}</h2>
            <p className="text-sm font-medium text-gray-600 mt-1">
              {activeId ? "Revisa o imprime este presupuesto guardado." : "Arma el cotizador, aplica descuentos y guarda en el historial."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-100 transition-all disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Guardando..." : activeId ? "Actualizar Presupuesto" : "Guardar Presupuesto"}
            </button>
            
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all"
            >
              <Printer className="w-4 h-4" />
              {activeId ? "Reimprimir PDF" : "Imprimir / Exportar PDF"}
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        {/* Creador Interactivo */}
        <div className={`bg-white border rounded-3xl p-6 overflow-hidden transition-all ${activeId ? 'border-gray-200 opacity-95' : 'border-gray-100 shadow-sm'}`}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 uppercase tracking-wider">
              <div className="col-span-8 md:col-span-9">Tratamiento / Descripción</div>
              <div className="col-span-3 md:col-span-2 text-right">Costo (Gs)</div>
              <div className="col-span-1 text-center"></div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-8 md:col-span-9 relative group">
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => updateItem(item.id, "descripcion", e.target.value)}
                    placeholder="Ej. Limpieza completa..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-medium text-gray-800"
                    list={`treatments-${index}`}
                  />
                  <datalist id={`treatments-${index}`}>
                    {commonTreatments.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
                <div className="col-span-3 md:col-span-2">
                  <input
                    type="number"
                    value={item.costo === 0 && !item.descripcion ? "" : item.costo}
                    onChange={(e) => updateItem(item.id, "costo", Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 text-right"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              className="flex items-center gap-2 self-start mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-dashed border-emerald-300"
            >
              <Plus className="w-4 h-4" />
              + Añadir Fila
            </button>
          </div>

          {/* Totales */}
          <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-sm font-bold text-gray-700">Descuento Global en Dinero</label>
              <input
                type="number"
                value={descuento || ""}
                onChange={(e) => setDescuento(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-gray-900"
              />
            </div>

            <div className={`w-full md:w-1/3 bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${activeId ? 'border-gray-200' : 'border-emerald-100'}`}>
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>Subtotal:</span>
                <span>{formatGs(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium text-sm">
                <span>Descuento:</span>
                <span>- {formatGs(descuento)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-100">
                <span>Total a Pagar:</span>
                <span>{formatGs(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Component for PDF */}
      <div className="hidden">
        <PresupuestoPDFTemplate
          ref={printRef}
          paciente={paciente}
          items={items}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          doctorName={doctorName}
          clinicColor={clinicColor}
          clinicLogoUrl={clinicLogoUrl}
          clinicTitle={clinicTitle}
          clinicRegProf={clinicRegProf}
          clinicName={clinicName}
          clinicPhone={clinicPhone}
          clinicAddress={clinicAddress}
        />
      </div>
    </div>
  );
}
