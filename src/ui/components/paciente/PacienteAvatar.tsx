"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadProfilePicture } from "@/core/api";
import { cn } from "@/lib/utils";

interface PacienteAvatarProps {
  pacienteId: string;
  nombres: string;
  initialFotoUrl?: string | null;
  onUploadSuccess?: () => void;
}

export default function PacienteAvatar({ pacienteId, nombres, initialFotoUrl, onUploadSuccess }: PacienteAvatarProps) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(initialFotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const newUrl = await uploadProfilePicture(pacienteId, file);
      setFotoUrl(newUrl);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error: any) {
      alert("Error al subir la foto: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative group w-12 h-12 md:w-20 md:h-20 rounded-full shadow-md bg-teal-50 border-2 md:border-4 border-white flex-shrink-0">
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={fotoUrl} 
          alt={`Foto de ${nombres}`} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-teal-700 font-extrabold text-2xl md:text-3xl">
          {nombres.charAt(0).toUpperCase()}
        </div>
      )}
      
      {/* Botón flotante para editar foto */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Cambiar foto de perfil"
        className={cn(
          "absolute inset-0 w-full h-full rounded-full flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]",
          isUploading && "opacity-100 bg-black/60 cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        ) : (
          <Camera className="w-6 h-6" />
        )}
      </button>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
}
