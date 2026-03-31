"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, Phone, Mail, HelpCircle, AlertCircle, CheckCircle2, Crown, Image as ImageIcon, UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/infrastructure/supabase";

export default function MiCuentaPage() {
  const [userPlan, setUserPlan] = useState<string>("Cargando...");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicLogoUrl, setClinicLogoUrl] = useState("");
  const [clinicColor, setClinicColor] = useState("#e8701a");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const PRESET_COLORS = [
    { name: 'Naranja', value: '#e8701a' },
    { name: 'Esmeralda', value: '#059669' },
    { name: 'Azul', value: '#0284c7' },
    { name: 'Rosa', value: '#e11d48' },
    { name: 'Morado', value: '#9333ea' },
    { name: 'Gris oscuro', value: '#334155' },
  ];
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelText, setCancelText] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
        setTelefono(user.user_metadata?.phone || "");
        setClinicName(user.user_metadata?.clinic_name || "");
        setClinicAddress(user.user_metadata?.clinic_address || "");
        setClinicPhone(user.user_metadata?.clinic_phone || "");
        setClinicLogoUrl(user.user_metadata?.clinic_logo_url || "");
        setClinicColor(user.user_metadata?.clinic_color || "#e8701a");
        
        supabase.from('perfiles').select('plan, created_at')
          .eq('id', user.id).single()
          .then(({ data }) => {
            if (data) {
              setUserPlan(data.plan || "free");
              if (data.created_at) {
                const date = new Date(data.created_at);
                setCreatedAt(date.toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' }));
              }
            }
          });
      }
    });
  }, []);

  const handleCancelPlan = async () => {
    if (cancelText.toLowerCase() !== "cancelar") return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No autenticado");
      
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Error al procesar la cancelación remota.");
      
      // La API nos baja a 'free' sólo si no encuentra el ID de Dodo (suscripciones antiguas)
      // Si existía Dodo, la API lo cancela en remoto y mantiene tus privilegios hasta fin de mes.
      const { data: pData } = await supabase.from('perfiles').select('plan').eq('id', session.user.id).single();
      if (pData) setUserPlan(pData.plan || "free");

      setShowCancelConfirm(false);
      setCancelText("");
      setMessage({ text: result.message || result.warning || "Suscripción cancelada", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al cancelar", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const fileExt = file.name.split('.').pop();
      const filePath = `logos/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pacientes_archivos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error("Error subiendo el logo: " + uploadError.message);

      const { data, error: signError } = await supabase.storage
        .from('pacientes_archivos')
        .createSignedUrl(filePath, 315360000); // 10 años de validez

      if (signError || !data?.signedUrl) throw new Error("No se pudo firmar la URL del logo.");

      const newLogoUrl = data.signedUrl;
      setClinicLogoUrl(newLogoUrl);

      // Guardar automáticamente en el perfil para no perderlo si el usuario olvida darle a "Guardar Cambios"
      const currentMetadata = user.user_metadata || {};
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          clinic_logo_url: newLogoUrl
        }
      });
      if (updateError) throw new Error("Se subió la imagen pero falló al guardar en tu perfil.");

      setMessage({ text: "Logo subido y guardado correctamente.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Hubo un error al subir el logo", type: "error" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updates: any = {};
      
      if (newPassword.trim() !== "") {
        if (newPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
        updates.password = newPassword;
      }

      updates.data = { 
        phone: telefono,
        clinic_name: clinicName,
        clinic_address: clinicAddress,
        clinic_phone: clinicPhone,
        clinic_logo_url: clinicLogoUrl,
        clinic_color: clinicColor,
      };

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setMessage({ text: "¡Tus datos han sido actualizados exitosamente!", type: "success" });
      setNewPassword(""); 
    } catch (error: any) {
      setMessage({ text: error.message || "Hubo un error al actualizar los datos", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mi Cuenta</h1>
        <p className="text-gray-500 mt-1">Gestiona tu plan, seguridad y datos de contacto.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Plan  */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(6,81,237,0.1)] border border-gray-100 p-6 flex flex-col items-center text-center transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-accent">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Plan Actual</h2>
            <p className="text-2xl font-black text-gray-900 capitalize mb-1">{userPlan}</p>
            {createdAt && <p className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">Miembro desde: {createdAt}</p>}
            
            {userPlan !== 'free' && (
              <div className="mt-6 w-full pt-4 border-t border-gray-100">
                {!showCancelConfirm ? (
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm font-bold text-red-500 hover:text-red-700 w-full text-center transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Cancelar Suscripción
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <div className="space-y-1">
                      <p className="text-xs text-red-600 font-bold leading-tight">¿Estás seguro?</p>
                      <p className="text-[10px] text-gray-600 leading-tight">Escribe <span className="font-black text-red-600">cancelar</span> para confirmar.<br/><span className="italic mt-1 block">También debes cancelar desde el link en el correo de Dodo Payments.</span></p>
                    </div>
                    <input 
                      type="text" 
                      value={cancelText}
                      onChange={(e) => setCancelText(e.target.value)}
                      placeholder="escribe cancelar"
                      className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-center font-bold text-red-600 uppercase"
                    />
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setShowCancelConfirm(false); setCancelText(""); }}
                         className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                       >
                         Atrás
                       </button>
                       <button 
                         onClick={handleCancelPlan}
                         disabled={cancelText.toLowerCase() !== "cancelar" || isLoading}
                         className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                       >
                         Confirmar
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg border border-gray-800 p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <HelpCircle className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                Soporte Técnico
              </h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Ante cualquier inconveniente con facturación o acceso, no dudes en escribirnos directamente.
              </p>
              
              <div className="space-y-4">
                <a href="https://wa.me/595962122644" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors bg-white/10 p-3 rounded-xl">
                  <Phone className="w-5 h-5 text-accent" />
                  +595 962 122644
                </a>
                <a href="mailto:destefanopy@gmail.com" className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors bg-white/10 p-3 rounded-xl overflow-hidden">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="truncate">destefanopy@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Seguridad y Perfil</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 sm:text-sm font-medium focus:outline-none"
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">El correo de acceso no puede ser modificado desde este panel.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Número de Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                    placeholder="+595 900 000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Déjalo en blanco si no deseas cambiar tu contraseña actual.</p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-md font-bold text-gray-900 mb-4">Datos de la Clínica (Recetas e Informes)</h4>
                
                <div className="space-y-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Logo de la Clínica</label>
                    <div className="flex items-center gap-6">
                      {clinicLogoUrl ? (
                        <div className="relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={clinicLogoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-xl border-2 border-gray-100 bg-white shadow-sm" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-center text-gray-400 font-medium px-2">
                          Sin logo
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all shadow-sm">
                          <UploadCloud className="w-4 h-4" />
                          {isUploadingLogo ? 'Subiendo...' : 'Subir Logo (PNG/JPG)'}
                          <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                        </label>
                        <p className="text-xs text-gray-500">Mínimo 300x300px con fondo transparente recomendado. Se guarda al instante.</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-3">
                    <label className="text-sm font-bold text-gray-700">Color del Recetario</label>
                    <div className="flex flex-wrap gap-4">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setClinicColor(color.value)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${clinicColor === color.value ? 'border-gray-900 scale-110 ring-4 ring-gray-100' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {clinicColor === color.value && <span className="text-white drop-shadow-md">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Clínica</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                      placeholder="Ej. Clínica Dental Sonrisas"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono de la Clínica</label>
                    <input
                      type="text"
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                      placeholder="+595 999 888777"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dirección de la Clínica</label>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                      placeholder="Av. Principal 123"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
