"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/core/auth";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authService.signIn(email, password);
      if (error) throw error;
      
      router.push("/agenda");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sidebar to-accent">
          Bienvenido de nuevo
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Ingresa tus credenciales para acceder a tu clínica.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
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

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Contraseña</label>
            <Link href="#" className="text-xs font-semibold text-accent hover:text-sidebar transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 hover:shadow-lg hover:shadow-sidebar/20 transition-all focus:outline-none focus:ring-2 focus:ring-sidebar/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 font-medium">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-sidebar hover:text-accent font-bold transition-colors">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
