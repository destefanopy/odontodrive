"use client";

import { useState, useEffect } from "react";
import { FileSignature, FileText, Loader2, Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { DocumentoPaciente, getPacienteFiles, deletePacienteFile, uploadPacienteFile } from "@/core/api";
import { supabase } from "@/infrastructure/supabase";
import { cn } from "@/lib/utils";
import StorageProgressBar from "@/ui/components/StorageProgressBar";
import { ConsentimientoModal } from "./ConsentimientoModal";
import { useRouter } from "next/navigation";

interface ConsentimientosViewProps {
  paciente: any;
}

export default function ConsentimientosView({ paciente }: ConsentimientosViewProps) {
  const pacienteId = paciente.id;
  const [archivos, setArchivos] = useState<DocumentoPaciente[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Storage State
  const [userPlan, setUserPlan] = useState<string>("free");
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [consentimientosCount, setConsentimientosCount] = useState<number>(0);
  const router = useRouter();
  const planLimits: Record<string, number> = {
    free: 100 * 1024 * 1024,
    basico: 1024 * 1024 * 1024,
    estandar: 5120 * 1024 * 1024,
    avanzado: 20480 * 1024 * 1024,
    premium: 40960 * 1024 * 1024,
  };

  // Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    cargarArchivos();
    cargarStorage();
  }, [pacienteId]);

  const cargarStorage = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: perfil } = await supabase.from('perfiles').select('plan, storage_usado_bytes').eq('id', data.user.id).single();
      if (perfil) {
        setUserPlan(perfil.plan || 'free');
        setStorageUsed(perfil.storage_usado_bytes || 0);
      }
      
      const { count } = await supabase.from('documentos_paciente')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
        .eq('tipo_archivo', 'consentimiento_informado');
        
      if (count !== null) setConsentimientosCount(count);
    }
  };

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const limitBytes = planLimits[userPlan] || planLimits.free;

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (userPlan === 'free' && consentimientosCount >= 15) {
      alert("Has alcanzado el límite de 15 consentimientos gratuitos. Por favor, actualiza tu plan para subir más documentos.");
      router.push('/cuenta');
      return;
    }

    if (storageUsed + selectedFile.size > limitBytes) {
      alert(`No puedes subir este archivo. Excede tu límite de ${userPlan.toUpperCase()}. Por favor, mejora tu plan.`);
      return;
    }

    setIsUploading(true);
    try {
      await uploadPacienteFile(pacienteId, selectedFile, "consentimiento_informado", "ninguna");
      // Actualizar uso de storage local y remoto
      const nuevoUsado = storageUsed + selectedFile.size;
      setStorageUsed(nuevoUsado);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await supabase.from('perfiles').update({ storage_usado_bytes: nuevoUsado }).eq('id', data.user.id);
      }

      setSelectedFile(null);
      await cargarArchivos();
      await cargarStorage(); // Asegurar que el contador de la UI se actualice
    } catch (err: any) {
      alert("Error subiendo archivo: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("¿Seguro que deseas eliminar este documento legal? Esta acción no se puede deshacer.")) return;
    try {
      await deletePacienteFile(id, path);
      await cargarArchivos();
      await cargarStorage();
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
              onClick={() => {
                if (userPlan === 'free' && consentimientosCount >= 15) {
                  alert("Has alcanzado el límite de 15 consentimientos gratuitos. Por favor, actualiza tu plan a Básico o Pro.");
                  router.push('/cuenta');
                  return;
                }
                setShowConsentModal(true);
              }}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Nuevo Consentimiento
            </button>
          </div>
          <p className="text-sm text-gray-600 font-medium mt-2">
            Gestiona los consentimientos informados firmados por el paciente. Todos los documentos están asegurados de forma inmutable en la nube.
          </p>
          {userPlan === 'free' && (
            <div className="mt-3 flex items-center gap-2 text-sm font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
              <span>Consentimientos Gratuitos: {consentimientosCount} / 15</span>
              {consentimientosCount >= 15 && <span className="text-red-600 ml-1">(Límite alcanzado)</span>}
            </div>
          )}
        </div>
        <div>
          <StorageProgressBar planName={userPlan} planLimitBytes={limitBytes} usedBytes={storageUsed} />
        </div>
      </div>
      
      {/* Upload Zone */}
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-200 overflow-hidden",
          dragActive ? "border-accent bg-accent/5 scale-[1.01]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="upload-consent"
          onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
          className="hidden" 
          accept="image/*,application/pdf"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Arrastra consentimientos antiguos aquí</p>
              <p className="text-xs text-gray-700 mt-1">Soporta JPG, PNG, y PDF hasta 50MB.</p>
            </div>
            <button 
              onClick={() => document.getElementById('upload-consent')?.click()}
              className="px-5 py-2 bg-gray-900 text-white rounded-full text-xs font-bold shadow-md hover:bg-gray-800 transition-all"
            >
              Explorar Archivos
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                {selectedFile.type.startsWith("image/") ? <ImageIcon className="w-5 h-5 text-accent" /> : <FileText className="w-5 h-5 text-gray-700" />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedFile(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-md shadow-accent/20 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? "Guardando..." : "Guardar Documento"}
              </button>
            </div>
          </div>
        )}
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
                 {doc.url_archivo.toLowerCase().endsWith('.pdf') ? <FileText className="w-12 h-12 text-red-500 mb-2" /> : <ImageIcon className="w-12 h-12 text-blue-500 mb-2" />}
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{doc.url_archivo.toLowerCase().endsWith('.pdf') ? 'PDF Firmado' : 'Imagen'}</span>
               </div>
               
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-900 line-clamp-2" title={doc.url_archivo.split('/').pop()}>
                   {doc.url_archivo.split('/').pop()?.replace(/^\d+_/, '')?.replace(/_/g, ' ')}
                 </p>
                 <p className="text-[10px] text-gray-500 font-medium mt-1">
                   {new Date(doc.fecha_subida).toLocaleDateString()} • {new Date(doc.fecha_subida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
               </div>

               <button 
                 onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.url_archivo); }}
                 className="absolute top-6 right-6 p-2 bg-white text-red-500 rounded-lg transition-opacity hover:bg-red-50 shadow-sm border border-red-100"
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
          cargarStorage(); // Para actualizar el contador
        }}
      />
    </div>
  );
}
