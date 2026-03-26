import React, { forwardRef } from "react";
import { Paciente } from "@/core/api";

interface PresupuestoItem {
  id: string;
  descripcion: string;
  costo: number;
}

interface PDFProps {
  paciente: Paciente;
  items: PresupuestoItem[];
  subtotal: number;
  descuento: number;
  total: number;
  doctorName?: string;
}

const PresupuestoPDFTemplate = forwardRef<HTMLDivElement, PDFProps>(
  ({ paciente, items, subtotal, descuento, total, doctorName = "Odontólogo(a)" }, ref) => {
    
    const formatGs = (num: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(num);
    const dateStr = new Date().toLocaleDateString("es-PY", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div ref={ref} className="bg-white p-12 text-gray-900" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}>
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl">
              OD
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">OdontoDrive</h1>
              <p className="text-emerald-700 font-medium">{doctorName}</p>
              <p className="text-gray-700 text-sm mt-1">Reg. Prof. 123456</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">Presupuesto</h2>
            <p className="text-gray-700 font-medium">Fecha: {dateStr}</p>
          </div>
        </div>

        {/* Info Paciente */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8 flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="font-bold w-24 text-gray-700">Paciente:</span>
            <span className="font-extrabold text-gray-900">{paciente.nombres_apellidos}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold w-24 text-gray-700">Documento:</span>
            <span className="font-semibold text-gray-700">{paciente.documento_identidad || "No especificado"}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold w-24 text-gray-700">Teléfono:</span>
            <span className="font-semibold text-gray-700">{paciente.telefono_celular || "No especificado"}</span>
          </div>
        </div>

        {/* Tabla de Tratamientos */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Tratamiento / Descripción</th>
                <th className="py-3 px-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-right w-40">Costo Estimado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-4 px-4 font-medium text-gray-800">{item.descripcion || "Elemento sin descripción"}</td>
                  <td className="py-4 px-4 font-bold text-gray-900 text-right">{formatGs(item.costo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-16">
          <div className="w-80 bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex justify-between mb-2 text-gray-800">
              <span className="font-medium">Subtotal</span>
              <span>{formatGs(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between mb-4 text-emerald-600">
                <span className="font-medium">Descuento</span>
                <span>-{formatGs(descuento)}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t-2 border-emerald-200 text-xl text-emerald-900">
              <span className="font-black">Total</span>
              <span className="font-black">{formatGs(total)}</span>
            </div>
          </div>
        </div>

        {/* Firmas y Disclaimer */}
        <div className="mt-auto border-t border-gray-200 pt-8 flex justify-between items-end">
          <div className="text-gray-800 text-xs max-w-sm space-y-1">
            <p>* Este presupuesto tiene una validez de 30 días calendario contados a partir de su fecha de emisión.</p>
            <p>* Los costos pueden variar si durante el tratamiento se descubren complicaciones adicionales no detectables clínica o radiográficamente en la primera visita.</p>
          </div>
          
          <div className="flex flex-col items-center mt-12 w-64 border-t border-gray-400 pt-2">
            <span className="font-bold text-gray-800">{doctorName}</span>
            <span className="text-gray-700 text-sm">Odontología Integral</span>
          </div>
        </div>

      </div>
    );
  }
);

PresupuestoPDFTemplate.displayName = "PresupuestoPDFTemplate";
export default PresupuestoPDFTemplate;
