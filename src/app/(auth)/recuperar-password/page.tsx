"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/core/auth";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al intentar enviar el correo de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center animate-in fade-in">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sidebar to-accent">
          Correo enviado
        </h2>
        <p className="mt-2 text-sm text-gray-700 font-medium">
          Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada o la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 transition-all focus:outline-none focus:ring-2 focus:ring-sidebar/50 focus:ring-offset-2 mt-6"
        >
          Volver al Inicio de Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sidebar to-accent">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-700 font-medium">
          Ingresa tu correo para recibir un enlace de recuperación.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRecover}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800 group-focus-within:text-accent transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-gray-50/50 hover:bg-white"
              placeholder="doctor@odontodrive.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 shadow hover:shadow-lg hover:shadow-sidebar/20 transition-all focus:outline-none focus:ring-2 focus:ring-sidebar/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Enviar Enlace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-800 font-medium mt-6">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-gray-700 hover:text-sidebar font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
