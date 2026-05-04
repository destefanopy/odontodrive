import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Printer, PenTool, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase';
import { getConsentTemplates, ConsentTemplateDB } from '@/core/api';
import { LienzoFirma } from './LienzoFirma';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PacienteData {
  id: string;
  nombres_apellidos: string;
  documento_identidad?: string | null;
  lugar_residencia?: string | null;
}

interface ConsentimientoModalProps {
  paciente: PacienteData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Triggered when a signed document is saved
}

export function ConsentimientoModal({ paciente, isOpen, onClose, onSuccess }: ConsentimientoModalProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'sign' | 'processing'>('select');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('general');
  const [previewText, setPreviewText] = useState('');
  const [doctorData, setDoctorData] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [dbTemplates, setDbTemplates] = useState<ConsentTemplateDB[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setErrorMsg(null);
      // Fetch doctor data from auth session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && user.user_metadata) {
          const fullName = user.user_metadata.full_name || user.user_metadata.name || '';
          setDoctorData({
            clinica: user.user_metadata.clinic_name || fullName,
            nombre: fullName,
            titulo: user.user_metadata.clinic_title || '',
            registro: user.user_metadata.clinic_reg_prof || '',
            ciudad: user.user_metadata.clinic_city || '',
            pais: user.user_metadata.clinic_country || 'Paraguay',
            logo: user.user_metadata.clinic_logo_url || null,
          });
        }
      });
      
      // Fetch templates
      setIsLoadingTemplates(true);
      getConsentTemplates().then(data => {
        setDbTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateKey(data[0].clave);
        }
        setIsLoadingTemplates(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplateKey && step === 'preview') {
      generatePreview();
    }
  }, [selectedTemplateKey, step, doctorData]);

  if (!isOpen) return null;

  const getMonthName = (month: number) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month];
  };

  const generatePreview = () => {
    const template = dbTemplates.find(t => t.clave === selectedTemplateKey);
    if (!template) return;

    const today = new Date();
    
    let text = template.content;
    text = text.replace(/{{paciente_nombre}}/g, paciente.nombres_apellidos || '___________________');
    text = text.replace(/{{paciente_documento}}/g, paciente.documento_identidad || '___________________');
    text = text.replace(/{{paciente_direccion}}/g, paciente.lugar_residencia || '___________________');
    
    text = text.replace(/{{doctor_nombre}}/g, doctorData.nombre || '___________________');
    text = text.replace(/{{doctor_registro}}/g, doctorData.registro || '___________________');
    text = text.replace(/{{ciudad}}/g, doctorData.ciudad || '___________________');
    text = text.replace(/{{pais}}/g, doctorData.pais || '___________________');
    
    text = text.replace(/{{fecha_dia}}/g, today.getDate().toString());
    text = text.replace(/{{fecha_mes}}/g, getMonthName(today.getMonth()));
    text = text.replace(/{{fecha_anio}}/g, today.getFullYear().toString());

    setPreviewText(text);

    // Validate critical data
    if (!doctorData.registro || !doctorData.ciudad) {
      setErrorMsg("Faltan datos en tu perfil (Registro Profesional o Ciudad) para que el documento tenga validez legal. Puedes imprimirlos y llenarlos a mano, pero te recomendamos configurar tu perfil.");
    } else {
      setErrorMsg(null);
    }
  };

  const generatePDF = async (signatureDataUrl?: string) => {
    addLog("Generando PDF... Buscando referencia del contenedor");
    if (!documentRef.current) {
      addLog("ERROR: Contenedor documentRef no encontrado");
      return null;
    }
    
    try {
      setStep('processing');
      addLog("Cambiando estilos temporales para html2canvas");
      // Temporarily ensure the element is visible and properly styled for rendering
      const originalWidth = documentRef.current.style.width;
      const originalPadding = documentRef.current.style.padding;
      const originalBg = documentRef.current.style.backgroundColor;
      const originalColor = documentRef.current.style.color;
      const originalDisplay = documentRef.current.style.display;

      documentRef.current.style.width = '800px';
      documentRef.current.style.padding = '40px';
      documentRef.current.style.backgroundColor = 'white';
      documentRef.current.style.color = 'black';
      documentRef.current.style.display = 'block';

      // If signature is provided, append an image to the document temporarily
      let signatureImg: HTMLImageElement | null = null;
      if (signatureDataUrl) {
         addLog("Insertando imagen de firma base64");
         signatureImg = document.createElement('img');
         signatureImg.style.maxHeight = '100px';
         signatureImg.style.marginTop = '20px';
         
         const loadPromise = new Promise((resolve) => {
           signatureImg!.onload = resolve;
           signatureImg!.onerror = resolve;
         });
         
         signatureImg.src = signatureDataUrl;
         document.getElementById('signature-container')?.appendChild(signatureImg);
         
         if (!signatureImg.complete) {
           addLog("Esperando carga de la imagen de firma...");
           await loadPromise;
         }
         addLog("Imagen de firma cargada.");
      }
      
      addLog("Esperando timeout (150ms) para render de UI...");
      // Permitir que React renderice el estado 'processing' antes de bloquear el hilo
      await new Promise(r => setTimeout(r, 150));

      addLog("Ejecutando html2canvas...");
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      addLog("html2canvas finalizado.");

      // Restore safely to avoid React hydration/unmount errors
      documentRef.current.style.width = originalWidth;
      documentRef.current.style.padding = originalPadding;
      documentRef.current.style.backgroundColor = originalBg;
      documentRef.current.style.color = originalColor;
      documentRef.current.style.display = originalDisplay;
      
      if (signatureImg && signatureImg.parentNode) {
        signatureImg.parentNode.removeChild(signatureImg);
      }

      addLog("Convirtiendo canvas a JPEG...");
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      addLog("Instanciando jsPDF...");
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      addLog("PDF creado exitosamente.");
      return pdf;
    } catch (err: any) {
      addLog("Error en generatePDF: " + err.message);
      console.error("Error generating PDF:", err);
      setStep('preview');
      return null;
    }
  };

  const handlePrint = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Consentimiento_${paciente.nombres_apellidos.replace(/\s+/g, '_')}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStep('preview');
      // No cerramos el modal para que el usuario pueda seguir viendo la vista previa
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    addLog("--- INICIANDO GUARDADO ---");
    setDebugLogs(prev => prev.slice(-5)); // keep it short
    try {
      const pdf = await generatePDF(signatureDataUrl);
      if (!pdf) throw new Error("Fallo al generar el PDF. Verifica los logs anteriores.");

      addLog("Generando BLOB del PDF...");
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `Consentimiento_${paciente.nombres_apellidos.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

      addLog("Obteniendo usuario autenticado (Supabase)...");
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("No estás autenticado en Supabase.");

      addLog("Verificando límites del plan...");
      const { data: perfilLimit } = await supabase.from('perfiles').select('plan').eq('id', authData.user.id).single();
      if (!perfilLimit || perfilLimit.plan === 'free') {
        const { count } = await supabase.from('documentos_paciente')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authData.user.id)
          .eq('tipo_archivo', 'consentimiento_informado');
        if (count !== null && count >= 15) {
          throw new Error("Has alcanzado el límite de 15 consentimientos gratuitos. Por favor, actualiza tu plan en Configuración.");
        }
      }

      const filePath = `${paciente.id}/${Date.now()}-consentimiento.pdf`;
      
      addLog("Subiendo al bucket pacientes_archivos: " + filePath);
      const { error: uploadError } = await supabase.storage
        .from('pacientes_archivos')
        .upload(filePath, file);

      if (uploadError) {
        addLog("ERROR UPLOAD: " + uploadError.message);
        throw uploadError;
      }
      addLog("Subida exitosa.");

      addLog("Insertando registro en base de datos (documentos_paciente)...");
      const { error: dbError } = await supabase
        .from('documentos_paciente')
        .insert({
          paciente_id: paciente.id,
          url_archivo: filePath,
          tipo_archivo: 'consentimiento_informado',
          fase_clinica: 'antes',
          user_id: authData.user.id
        });

      if (dbError) {
        addLog("ERROR DB: " + dbError.message);
        throw dbError;
      }
      addLog("Registro insertado exitosamente.");

      addLog("Actualizando espacio de almacenamiento...");
      const fileSize = file.size;
      const { data: perfil } = await supabase.from('perfiles').select('storage_usado_bytes').eq('id', authData.user.id).single();
      const newStorage = (perfil?.storage_usado_bytes || 0) + fileSize;
      await supabase.from('perfiles').update({ storage_usado_bytes: newStorage }).eq('id', authData.user.id);
      
      addLog("Finalizado. Cerrando modal.");
      onSuccess();
      onClose();
    } catch (error: any) {
      addLog("EXCEPCIÓN ATRAPADA: " + error.message);
      console.error(error);
      alert("Error al guardar: " + error.message);
      setStep('sign');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Consentimiento Informado</h2>
              <p className="text-xs text-gray-500 font-medium">Paciente: {paciente.nombres_apellidos}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={step === 'processing'} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Hidden container used just for the PDF rendering to ensure it's clean and always mounted */}
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
             <div ref={documentRef} className="text-left font-serif" style={{ fontSize: '14px', lineHeight: '1.6' }}>
               
               {/* Cabecera / Membrete */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '30px' }}>
                 <div style={{ flex: 1 }}>
                   <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{doctorData.clinica}</h2>
                   <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                     {doctorData.titulo ? `${doctorData.titulo} ` : ''}{doctorData.nombre}
                   </p>
                   {doctorData.registro && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4b5563' }}>Registro Profesional: {doctorData.registro}</p>}
                   <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4b5563' }}>{doctorData.ciudad}, {doctorData.pais}</p>
                 </div>
                 {doctorData.logo && (
                   <div style={{ width: '80px', height: '80px', flexShrink: 0, marginLeft: '20px' }}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={doctorData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                   </div>
                 )}
               </div>

               <h1 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                 {dbTemplates.find(t => t.clave === selectedTemplateKey)?.title}
               </h1>
               {/* Render the replaced text properly, preserving line breaks */}
               {previewText.split('\n').map((paragraph, idx) => (
                 <p key={idx} style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ 
                   // Simple bold markdown replacement for preview
                   __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                 }} />
               ))}
               
               <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '50%', textAlign: 'center' }}>
                     <div style={{ borderBottom: '1px solid black', marginBottom: '5px', height: '50px' }} id="signature-container"></div>
                     <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Firma del Paciente</p>
                     <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>Aclaración: {paciente.nombres_apellidos}</p>
                     {paciente.documento_identidad && <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>Doc: {paciente.documento_identidad}</p>}
                  </div>
               </div>
             </div>
          </div>

          {step === 'select' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Seleccionar Plantilla</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isLoadingTemplates ? (
                  <div className="col-span-full py-10 text-center text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Cargando plantillas...
                  </div>
                ) : dbTemplates.map((template) => (
                  <button
                    key={template.clave}
                    onClick={() => setSelectedTemplateKey(template.clave)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${selectedTemplateKey === template.clave ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="font-bold text-gray-900">{template.title}</div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.content.substring(0, 100)}...</p>
                  </button>
                ))}
              </div>
              
              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => setStep('preview')}
                  className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {errorMsg && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium">{errorMsg}</p>
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  Vista Previa
                </div>
                
                {/* Visible preview */}
                <div className="prose prose-sm max-w-none text-gray-700 font-serif">
                  <h3 className="text-center font-bold text-gray-900 mb-4">
                    {dbTemplates.find(t => t.clave === selectedTemplateKey)?.title}
                  </h3>
                  {previewText.split('\n').map((paragraph, idx) => (
                    <p key={idx} dangerouslySetInnerHTML={{ 
                      __html: paragraph.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-gray-900">$1</strong>') 
                    }} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors order-3 sm:order-1"
                >
                  Atrás
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 order-2"
                >
                  <Printer className="w-5 h-5" />
                  Descargar / Imprimir
                </button>
                <button
                  onClick={() => setStep('sign')}
                  className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 order-1 sm:order-3"
                >
                  <PenTool className="w-5 h-5" />
                  Firmar en Pantalla
                </button>
              </div>
            </div>
          )}

          {step === 'sign' && (
            <LienzoFirma 
              onCancel={() => setStep('preview')} 
              onSignatureSave={handleSaveSignature} 
            />
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <h3 className="text-lg font-bold text-gray-900">Procesando Documento...</h3>
              <p className="text-gray-500 text-center max-w-sm mb-6">
                Estamos generando el PDF con la firma y guardándolo de forma segura en la nube.
              </p>
              
              <div className="w-full max-w-md bg-gray-900 p-4 rounded-xl text-left font-mono text-[10px] text-green-400 overflow-y-auto max-h-32 border border-gray-700 shadow-inner">
                {debugLogs.length === 0 ? "Iniciando proceso..." : debugLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
