"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, Image as ImageIcon, FileText, Sparkles, Loader2, Trash2, X, MoveRight, BrainCircuit, HardDrive } from "lucide-react";
import { DocumentoPaciente, uploadPacienteFile, getPacienteFiles, deletePacienteFile, updatePacienteFileFase, analyzeImagesWithAI } from "@/core/api";
import { supabase } from "@/infrastructure/supabase";
import { cn } from "@/lib/utils";
import StorageProgressBar from "@/ui/components/StorageProgressBar";
import Link from "next/link";

interface ArchivosIAProps {
  paciente: any;
}

export default function ArchivosIA({ paciente }: ArchivosIAProps) {
  const pacienteId = paciente.id;
  const [archivos, setArchivos] = useState<DocumentoPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Storage State
  const [userPlan, setUserPlan] = useState<string>("free");
  const [storageUsed, setStorageUsed] = useState<number>(0);
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
  const [faseClinica, setFaseClinica] = useState<"antes" | "evolucion" | "final" | "ninguna">("antes");
  const [isUploading, setIsUploading] = useState(false);
  
  // Fullscreen Viewer State
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // IA State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const cargarArchivos = async () => {
    try {
      const data = await getPacienteFiles(pacienteId);
      // Filtrar consentimientos para que solo aparezcan en su propia pestaña
      const archivosFiltrados = data.filter(d => d.tipo_archivo !== 'consentimiento_informado');
      setArchivos(archivosFiltrados);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const limitBytes = planLimits[userPlan] || planLimits.free;
  const isLimitReached = storageUsed >= limitBytes;

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (storageUsed + selectedFile.size > limitBytes) {
      alert(`No puedes subir este archivo. Excede tu límite de ${userPlan.toUpperCase()}. Por favor, mejora tu plan.`);
      return;
    }

    setIsUploading(true);
    try {
      const isImg = selectedFile.type.startsWith("image/");
      const tipoStr = isImg ? "fotografia" : "documento";

      await uploadPacienteFile(pacienteId, selectedFile, tipoStr, faseClinica);
      // Actualizar uso de storage local y remoto
      const nuevoUsado = storageUsed + selectedFile.size;
      setStorageUsed(nuevoUsado);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await supabase.from('perfiles').update({ storage_usado_bytes: nuevoUsado }).eq('id', data.user.id);
      }

      setSelectedFile(null);
      await cargarArchivos();
    } catch (err: any) {
      alert("Error subiendo archivo: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta imagen clínicamente?")) return;
    try {
      await deletePacienteFile(id, path);
      // Aquí se debería idealmente restar el tamaño, pero dejaremos que el contador se ajuste periódicamente o asumiremos una resta fija
      await cargarArchivos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateFase = async (id: string, nuevaFase: string) => {
    try {
      await updatePacienteFileFase(id, nuevaFase);
      await cargarArchivos();
    } catch (err: any) {
      alert("Error moviendo foto: " + err.message);
    }
  };

  const handleIAAnalysis = async (docs: DocumentoPaciente[], contextMsg: string) => {
    const urls = docs.map(d => d.signedUrl).filter(Boolean) as string[];
    if (urls.length === 0) return;

    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const resp = await analyzeImagesWithAI(urls, contextMsg);
      setAiAnalysisResult(resp);
    } catch (err: any) {
      alert("OdontólogoIA Error: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const agrupados = {
    antes: archivos.filter((a) => a.fase_clinica === "antes"),
    evolucion: archivos.filter((a) => a.fase_clinica === "evolucion"),
    final: archivos.filter((a) => a.fase_clinica === "final"),
    ninguna: archivos.filter((a) => a.fase_clinica === "ninguna" || !a.fase_clinica),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Storage Alert */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-accent" /> Gabinete de Archivos
            </h2>
          </div>
          <p className="text-sm text-gray-600 font-medium mt-2">Sube todas las historias clínicas y radiografías bajo una infraestructura en la nube segura. Tus herramientas analíticas funcionarán a la perfección gracias a OdontólogoIA.</p>
        </div>
        <div>
          <StorageProgressBar planName={userPlan} planLimitBytes={limitBytes} usedBytes={storageUsed} />
        </div>
      </div>
      
      {/* Upload Zone */}
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 overflow-hidden",
          dragActive ? "border-accent bg-accent/5 scale-[1.01]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Arrastra radiografías o fotos clínicas aquí</p>
              <p className="text-xs text-gray-700 mt-1">Soporta JPG, PNG, y PDF hasta 50MB.</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all"
            >
              Explorar Archivos
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                {selectedFile.type.startsWith("image/") ? <ImageIcon className="w-6 h-6 text-accent" /> : <FileText className="w-6 h-6 text-gray-700" />}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-700">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-2 text-gray-800 hover:text-red-500">
                 <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest text-left block">
                Etiquetar Fase Clínica
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["antes", "evolucion", "final"].map((fase) => (
                  <button
                    key={fase}
                    onClick={() => setFaseClinica(fase as any)}
                    className={cn(
                      "py-2 px-1 text-xs font-bold rounded-lg border transition-all capitalize",
                      faseClinica === fase 
                        ? "bg-accent/10 border-accent text-accent" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {fase}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full max-w-sm flex items-center justify-center gap-2 px-6 py-3 bg-sidebar text-white rounded-xl text-sm font-bold shadow-lg hover:bg-sidebar/90 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {isUploading ? "Subiendo..." : "Guardar Archivo Seguro"}
            </button>
          </div>
        )}
      </div>

      {/* Galería Visual por Fases */}
      {archivos.length > 0 && (
        <div className="space-y-10 mt-10 border-t border-gray-100 mt-10 pt-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Evolución Clínica
              </h3>
              <p className="text-sm text-gray-700 font-medium">Historial gráfico de transformación dental.</p>
            </div>
            
            <button 
              onClick={() => {
                if (agrupados.antes.length > 0 && agrupados.evolucion.length > 0) {
                  // Agarra la foto más reciente de "antes" (que es la última de la DB si es order by Date pero están revertidos)
                  // Como la query es `order('fecha_subida', { ascending: false })`, el índice 0 es el MÁS RECIENTE.
                  // Así que agrupados.antes[0] es la última foto inicial subida. Para el "antes" queremos la más antigua idealmente, o la que elija.
                  // Para simplificar, aggarremos 1 de antes y 1 de evolución
                  handleIAAnalysis(
                    [agrupados.antes[agrupados.antes.length - 1], agrupados.evolucion[0]], 
                    "Por favor compara el estado de la primera foto (Antes) con el de la segunda (Evolución actual). Detecta mejorías o puntos de alerta."
                  );
                } else {
                  alert("Necesitas al menos 1 foto en 'Antes' y 1 en 'Evolución' para hacer la comparación automática.");
                }
              }}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-gradient-to-r from-[#24a09c] to-[#31b8b3] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              {isAnalyzing ? "Analizando..." : "Comparar Antes/Evolución con IA"}
            </button>
          </div>

          {/* AI Output Window */}
          {aiAnalysisResult && (
            <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl relative animate-in slide-in-from-top-4 duration-500">
               <button onClick={() => setAiAnalysisResult(null)} className="absolute top-4 right-4 text-gray-800 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
               <h4 className="flex items-center gap-2 font-bold text-accent mb-4">
                 <Sparkles className="w-5 h-5" /> Análisis Diagnóstico de OdontólogoIA
               </h4>
               <p className="text-sm leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">
                 {aiAnalysisResult}
               </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Antes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <h4 className="font-bold text-gray-700">1. Estado Inicial</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {agrupados.antes.map(a => <GaleriaThumbnail key={a.id} doc={a} onViewer={setViewerUrl} onDelete={handleDelete} onMove={handleUpdateFase} onAI={(d) => handleIAAnalysis([d], "Analiza esta radiografía/imagen dental. Destaca hallazgos relevantes (anomalías, caries, hueso alveolar).")} />)}
                {agrupados.antes.length === 0 && <p className="text-xs text-gray-800 col-span-2 py-4 italic">No hay fotos iniciales.</p>}
              </div>
            </div>

            {/* Evolucion */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <h4 className="font-bold text-gray-700">2. Evoluciones</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {agrupados.evolucion.map(a => <GaleriaThumbnail key={a.id} doc={a} onViewer={setViewerUrl} onDelete={handleDelete} onMove={handleUpdateFase} onAI={(d) => handleIAAnalysis([d], "Analiza esta imagen radiográfica o fotográfica en etapa de evolución ortodóntica/clínica.")} />)}
                {agrupados.evolucion.length === 0 && <p className="text-xs text-gray-800 col-span-2 py-4 italic">No hay progreso registrado.</p>}
              </div>
            </div>

            {/* Final */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h4 className="font-bold text-gray-900">3. Tratamiento Final</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {agrupados.final.map(a => <GaleriaThumbnail key={a.id} doc={a} onViewer={setViewerUrl} onDelete={handleDelete} onMove={handleUpdateFase} onAI={(d) => handleIAAnalysis([d], "Analiza este resultado clínico final.")} />)}
                {agrupados.final.length === 0 && <p className="text-xs text-gray-800 col-span-2 py-4 italic">El tratamiento sigue en curso.</p>}
              </div>
            </div>
          </div>
          
          {/* Docs Sin Categoría */}
          {agrupados.ninguna.length > 0 && (
            <div className="space-y-4 mt-8">
              <h4 className="font-bold text-gray-700 text-sm">Otros Documentos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                 {agrupados.ninguna.map(a => <GaleriaThumbnail key={a.id} doc={a} onViewer={setViewerUrl} onDelete={handleDelete} onMove={handleUpdateFase} onAI={(d) => handleIAAnalysis([d], "Dime qué observas en esta imagen.")} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {viewerUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <button onClick={() => setViewerUrl(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/30 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewerUrl} alt="Visor Clínico" className="max-w-full max-h-screen object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
}

function GaleriaThumbnail({ doc, onViewer, onDelete, onMove, onAI }: { doc: DocumentoPaciente; onViewer: (url: string) => void; onDelete: (id: string, path: string) => void; onMove: (id: string, fase: string) => void; onAI?: (doc: DocumentoPaciente) => void }) {
  const isImage = doc.tipo_archivo === 'fotografia' || (doc.signedUrl && doc.signedUrl.match(/\.(jpeg|jpg|gif|png|webp)/i));
  const phases = ["antes", "evolucion", "final"];
  const currentPhaseIndex = phases.indexOf(doc.fase_clinica) >= 0 ? phases.indexOf(doc.fase_clinica) : 0;
  const nextPhase = phases[(currentPhaseIndex + 1) % phases.length];

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative aspect-square rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
         {isImage && doc.signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={doc.signedUrl} 
              alt={doc.url_archivo.split('/').pop() || "Imagen clínica"}
              className="w-full h-full object-cover mix-blend-multiply hover:mix-blend-normal transition-all duration-300 group-hover:scale-110"
              onClick={() => onViewer(doc.signedUrl!)}
            />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50" onClick={() => window.open(doc.signedUrl, '_blank')}>
              <FileText className="w-8 h-8 text-gray-800" />
            </div>
         )}
         
         <button 
           onClick={(e) => { e.stopPropagation(); onDelete(doc.id, doc.url_archivo); }}
           className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
           title="Eliminar"
         >
           <Trash2 className="w-3.5 h-3.5" />
         </button>

         <button 
           onClick={(e) => { e.stopPropagation(); onMove(doc.id, nextPhase); }}
           className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-md text-gray-900 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm font-bold text-[10px] flex items-center gap-1"
           title={`Mover a ${nextPhase}`}
         >
           Mover <MoveRight className="w-3 h-3 text-accent" />
         </button>
         
         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <p className="text-[10px] text-white font-bold truncate">{doc.url_archivo.split('/').pop()}</p>
           <p className="text-[9px] text-white/80">{new Date(doc.fecha_subida).toLocaleDateString()}</p>
         </div>
      </div>
      
      {isImage && onAI && (
         <button 
           onClick={(e) => { e.stopPropagation(); onAI(doc); }}
           className="w-full py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-colors border border-teal-100 shadow-sm"
           title="Analizar Imagen con IA"
         >
           <BrainCircuit className="w-4 h-4" /> Analizar con IA
         </button>
      )}
    </div>
  );
}
