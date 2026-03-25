"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/core/auth";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se podría agregar validación para chequear si el ususario está autenticado (con sesión de recuperación)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await authService.getUser();
      // Si no hay sesión, eventualmente redirect al login, pero a veces la sesión tarda
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authService.updatePassword(password);
      if (error) throw error;
      
      // Contraseña actualizada
      router.push("/agenda");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sidebar to-accent">
          Actualizar Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-700 font-medium">
          Ingresa tu nueva contraseña para acceder a tu clínica.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleUpdate}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Nueva Contraseña</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800 group-focus-within:text-accent transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-gray-50/50 hover:bg-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Confirmar Contraseña</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800 group-focus-within:text-accent transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-gray-50/50 hover:bg-white"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 shadow hover:shadow-lg hover:shadow-sidebar/20 transition-all focus:outline-none focus:ring-2 focus:ring-sidebar/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Actualizar Contraseña
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
