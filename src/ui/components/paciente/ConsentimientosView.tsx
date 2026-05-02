"use client";

import { useState, useEffect } from "react";
import { FileSignature, FileText, Loader2, Trash2 } from "lucide-react";
import { DocumentoPaciente, getPacienteFiles, deletePacienteFile } from "@/core/api";
import { cn } from "@/lib/utils";
import { ConsentimientoModal } from "./ConsentimientoModal";

interface ConsentimientosViewProps {
  paciente: any;
}

export default function ConsentimientosView({ paciente }: ConsentimientosViewProps) {
  const pacienteId = paciente.id;
  const [archivos, setArchivos] = useState<DocumentoPaciente[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarArchivos();
  }, [pacienteId]);

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      const data = await getPacienteFiles(pacienteId);
      // Solo mostrar los consentimientos informados
      const consentimientos = data.filter(d => d.tipo_archivo === 'consentimiento_informado');
      setArchivos(consentimientos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("¿Seguro que deseas eliminar este documento legal? Esta acción no se puede deshacer.")) return;
    try {
      await deletePacienteFile(id, path);
      await cargarArchivos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-accent" /> Documentos Legales
            </h2>
            <button 
              onClick={() => setShowConsentModal(true)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Nuevo Consentimiento
            </button>
          </div>
          <p className="text-sm text-gray-600 font-medium mt-2">
            Gestiona los consentimientos informados firmados por el paciente. Todos los documentos están asegurados de forma inmutable en la nube.
          </p>
        </div>
      </div>
      
      {/* Lista de Documentos */}
      {archivos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
             <FileSignature className="w-8 h-8 text-gray-400" />
           </div>
           <div>
             <h3 className="font-bold text-gray-900">No hay consentimientos registrados</h3>
             <p className="text-sm text-gray-500 mt-1 max-w-sm">Genera un nuevo consentimiento informado para que el paciente lo firme digitalmente.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {archivos.map(doc => (
            <div key={doc.id} className="group relative flex flex-col gap-3 p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
               <div 
                 onClick={() => window.open(doc.signedUrl, '_blank')}
                 className="aspect-[3/4] rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
               >
                 <FileText className="w-12 h-12 text-red-500 mb-2" />
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PDF Firmado</span>
               </div>
               
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-900 line-clamp-2" title={doc.url_archivo.split('/').pop()}>
                   {doc.url_archivo.split('/').pop()?.replace(/_/g, ' ')}
                 </p>
                 <p className="text-[10px] text-gray-500 font-medium mt-1">
                   {new Date(doc.fecha_subida).toLocaleDateString()} • {new Date(doc.fecha_subida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
               </div>

               <button 
                 onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.url_archivo); }}
                 className="absolute top-6 right-6 p-2 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm border border-red-100"
                 title="Eliminar Documento"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          ))}
        </div>
      )}

      <ConsentimientoModal 
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        paciente={paciente}
        onSuccess={() => {
          cargarArchivos();
        }}
      />
    </div>
  );
}
