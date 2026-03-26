"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authService } from "@/core/auth";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await authService.signUp(email, password, name);
      if (error) throw error;
      
      // Transición SPA para no interrumpir el flujo del token de Supabase en LocalStorage
      if (data?.session) {
        router.push("/agenda");
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al registrar la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Registro Exitoso!</h2>
          <p className="mt-2 text-sm text-gray-700 font-medium">
            Hemos enviado un correo a <span className="font-bold text-gray-900">{email}</span>. 
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
          </p>
        </div>
        <Link 
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 transition-all font-medium"
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
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-sm text-gray-700 font-medium">
          Empieza a gestionar tu clínica de forma inteligente.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800 group-focus-within:text-accent transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-gray-50/50 hover:bg-white"
              placeholder="Dra. Ana Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

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

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Contraseña</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-800 group-focus-within:text-accent transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              required
              minLength={6}
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
              minLength={6}
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
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar/90 hover:shadow-lg hover:shadow-sidebar/20 transition-all focus:outline-none focus:ring-2 focus:ring-sidebar/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Crear Cuenta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-800 font-medium">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-sidebar hover:text-accent font-bold transition-colors">
          Inicia Sesión
        </Link>
      </p>
    </div>
  );
}
