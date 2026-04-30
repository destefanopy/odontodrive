import React, { forwardRef } from "react";
import { Paciente, AntecedentesMedicos } from "@/core/api";
import OdontogramaVisual from "./OdontogramaVisual";

interface FichaImprimibleProps {
  paciente: Paciente;
  antecedentes?: AntecedentesMedicos | null;
  initialOdontograma: Record<number, any>;
  finalOdontograma: Record<number, any>;
}

const FichaImprimible = forwardRef<HTMLDivElement, FichaImprimibleProps>(({
  paciente,
  antecedentes,
  initialOdontograma,
  finalOdontograma
}, ref) => {
  const edad = new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear();
  const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={ref} className="p-10 bg-white text-black min-h-screen font-sans" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      
      {/* Cabecera Clínica */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ODONTODRIVE</h1>
          <p className="text-sm font-medium text-gray-600 mt-1">Ficha Clínica Odontológica</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">Fecha de Emisión:</p>
          <p className="text-sm">{fechaActual}</p>
        </div>
      </div>

      {/* Datos Personales */}
      <section className="mb-10">
        <h2 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4 uppercase tracking-wider">1. Datos Personales</h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div><span className="font-bold">Nombres y Apellidos:</span> {paciente.nombres_apellidos}</div>
          <div><span className="font-bold">Documento (DNI/CI):</span> {paciente.documento_identidad || 'No registrado'}</div>
          <div><span className="font-bold">Fecha de Nacimiento:</span> {new Date(paciente.fecha_nacimiento).toLocaleDateString()} ({edad} años)</div>
          <div><span className="font-bold">Teléfono Celular:</span> {paciente.telefono_celular || 'No registrado'}</div>
          <div className="col-span-2"><span className="font-bold">Correo Electrónico:</span> {paciente.email || 'No registrado'}</div>
          <div className="col-span-2"><span className="font-bold">Dirección:</span> {paciente.direccion || 'No registrado'}</div>
          <div className="col-span-2"><span className="font-bold">Ocupación / Motivo Consulta:</span> {paciente.ocupacion || 'No registrado'}</div>
        </div>
      </section>

      {/* Historia Médica (Antecedentes) */}
      <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
        <h2 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4 uppercase tracking-wider">2. Historia Médica (Anamnesis)</h2>
        <div className="grid grid-cols-2 gap-4 text-sm border border-gray-200 rounded-lg p-4">
          <div><span className="font-bold block text-gray-700">Alergias Conocidas:</span> {antecedentes?.alergias || 'Ninguna reportada'}</div>
          <div><span className="font-bold block text-gray-700">Problemas de Coagulación:</span> {antecedentes?.problemas_coagulacion || 'No'}</div>
          <div><span className="font-bold block text-gray-700">Enfermedades Sistémicas:</span> {antecedentes?.enfermedades_sistemicas || 'Ninguna'}</div>
          <div><span className="font-bold block text-gray-700">Medicación Actual:</span> {antecedentes?.medicacion_actual || 'Ninguna'}</div>
          <div><span className="font-bold block text-gray-700">Internaciones Previas:</span> {antecedentes?.internaciones_previas || 'No'}</div>
          <div><span className="font-bold block text-gray-700">Antecedentes Familiares:</span> {antecedentes?.antecedentes_familiares || 'No relevantes'}</div>
          <div><span className="font-bold block text-gray-700">Hábitos Viciosos:</span> {antecedentes?.habitos_viciosos || 'No reportados'}</div>
          <div><span className="font-bold block text-gray-700">Complicaciones/Hemorragias:</span> {antecedentes?.complicaciones_hemorragias || 'No'}</div>
          <div className="col-span-2"><span className="font-bold block text-gray-700">Observaciones Adicionales:</span> {antecedentes?.observaciones || 'Sin observaciones'}</div>
        </div>
      </section>

      {/* Odontograma Inicial */}
      <section className="mb-10" style={{ pageBreakInside: 'avoid', pageBreakBefore: 'auto' }}>
        <h2 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4 uppercase tracking-wider">3. Odontograma Inicial (Estado al Ingreso)</h2>
        <div className="border border-gray-200 rounded-2xl bg-white scale-90 origin-top-left -ml-4">
          <OdontogramaVisual 
            pacienteId={paciente.id} 
            initialOdontograma={initialOdontograma} 
            tipo="inicial" 
            readOnly={true} 
          />
        </div>
      </section>

      {/* Odontograma Final */}
      <section style={{ pageBreakInside: 'avoid', pageBreakBefore: 'auto' }}>
        <h2 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4 uppercase tracking-wider">4. Odontograma Final / Evolución</h2>
        <div className="border border-gray-200 rounded-2xl bg-white scale-90 origin-top-left -ml-4">
          <OdontogramaVisual 
            pacienteId={paciente.id} 
            initialOdontograma={finalOdontograma} 
            tipo="final" 
            readOnly={true} 
          />
        </div>
      </section>

      {/* Firmas */}
      <div className="mt-24 flex justify-between px-10" style={{ pageBreakInside: 'avoid' }}>
        <div className="text-center w-64">
          <div className="border-t border-black pt-2 font-bold text-sm">Firma del Profesional</div>
        </div>
        <div className="text-center w-64">
          <div className="border-t border-black pt-2 font-bold text-sm">Firma del Paciente</div>
        </div>
      </div>

    </div>
  );
});

FichaImprimible.displayName = "FichaImprimible";

export default FichaImprimible;
