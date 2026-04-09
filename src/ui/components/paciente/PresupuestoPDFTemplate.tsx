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
  clinicColor?: string;
  clinicLogoUrl?: string;
  clinicTitle?: string;
  clinicRegProf?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  currencySymbol?: string;
}

const PresupuestoPDFTemplate = forwardRef<HTMLDivElement, PDFProps>(
  ({ 
    paciente, 
    items, 
    subtotal, 
    descuento, 
    total, 
    doctorName = "Odontólogo(a)",
    clinicColor = "#059669",
    clinicLogoUrl = "",
    clinicTitle = "Odontólogo(a)",
    clinicRegProf = "",
    clinicName = "",
    clinicPhone = "",
    clinicAddress = "",
    currencySymbol = "Gs."
  }, ref) => {
    
    const formatCurrency = (num: number) => `${currencySymbol} ${num.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;
    const dateStr = new Date().toLocaleDateString("es-PY", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div ref={ref} className="bg-white p-12 text-gray-900" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}>
        
        {/* Header */}
        <div 
          className="flex justify-between items-start border-b-2 pb-8 mb-8"
          style={{ borderBottomColor: clinicColor }}
        >
          <div className="flex items-center gap-4">
            {clinicLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clinicLogoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            ) : (
              <div 
                className="w-16 h-16 text-white rounded-2xl flex items-center justify-center font-bold text-3xl"
                style={{ backgroundColor: clinicColor }}
              >
                OD
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{clinicName || "OdontoDrive"}</h1>
              <p className="font-medium" style={{ color: clinicColor }}>{doctorName}</p>
              <p className="text-gray-700 text-sm mt-1">
                {clinicTitle}
                {clinicRegProf && ` • Reg. Prof. ${clinicRegProf}`}
              </p>
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
                  <td className="py-4 px-4 font-bold text-gray-900 text-right">{formatCurrency(item.costo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-16">
          <div className="w-80 bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between mb-2 text-gray-800">
              <span className="font-medium">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div 
                className="flex justify-between mb-4 font-bold"
                style={{ color: clinicColor }}
              >
                <span className="font-medium">Descuento</span>
                <span>-{formatCurrency(descuento)}</span>
              </div>
            )}
            <div 
              className="flex justify-between pt-4 border-t-2 text-xl"
              style={{ borderTopColor: clinicColor, color: clinicColor }}
            >
              <span className="font-black">Total</span>
              <span className="font-black">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Firmas y Disclaimer */}
        <div className="mt-auto pt-8 flex justify-between items-end relative">
          <div className="absolute top-0 left-0 right-0 border-t-2 border-gray-100 opacity-60"></div>
          
          <div className="text-gray-800 text-xs max-w-sm space-y-1 mt-4">
            <p>* Este presupuesto tiene una validez de 30 días calendario contados a partir de su fecha de emisión.</p>
            <p>* Los costos pueden variar si durante el tratamiento se descubren complicaciones adicionales no detectables clínica o radiográficamente en la primera visita.</p>
          </div>
          
          <div className="flex flex-col items-center mt-12 w-80 pt-6 relative border-t-2 border-dashed border-gray-300">
            <span className="font-bold text-gray-800 text-lg">{doctorName}</span>
            <span className="text-gray-700 font-medium">{clinicTitle}</span>
            <span className="text-gray-600 text-[11px] mt-2 text-center max-w-[250px] leading-tight">
              {clinicName && <span className="font-bold block">{clinicName}</span>}
              {clinicAddress && <span>{clinicAddress}</span>}
              {clinicAddress && clinicPhone && <span> • </span>}
              {clinicPhone && <span>Tel: {clinicPhone}</span>}
            </span>
          </div>
        </div>

      </div>
    );
  }
);

PresupuestoPDFTemplate.displayName = "PresupuestoPDFTemplate";
export default PresupuestoPDFTemplate;
