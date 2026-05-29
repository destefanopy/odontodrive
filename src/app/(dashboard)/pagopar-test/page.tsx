"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/infrastructure/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/Card";

export default function PagoparTestPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email === 'destefanopy@gmail.com') {
        setIsAdmin(true);
      } else {
        router.push("/agenda"); // Redirigir si no es admin
      }
      setLoading(false);
    });
  }, [router]);

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logStr = data ? `${message}\n${JSON.stringify(data, null, 2)}` : message;
    setLogs(prev => [`[${timestamp}] ${logStr}`, ...prev]);
  };

  const handleAgregarCliente = async () => {
    addLog("Iniciando 'Agregar Cliente'...");
    try {
      const res = await fetch("/api/pagopar/suscripcion/agregar-cliente", { method: "POST" });
      const data = await res.json();
      addLog("Respuesta Agregar Cliente:", data);
    } catch (err: any) {
      addLog("Error en Agregar Cliente:", err.message);
    }
  };

  const handleAgregarTarjeta = async () => {
    addLog("Iniciando 'Agregar Tarjeta'...");
    try {
      const res = await fetch("/api/pagopar/suscripcion/agregar-tarjeta", { method: "POST" });
      const data = await res.json();
      addLog("Respuesta Agregar Tarjeta:", data);
      
      // Si la respuesta incluye HTML (iframe) podríamos renderizarlo o simplemente redirigir a la URL que nos de Pagopar
      if (data.iframeUrl) {
         addLog(`Redirigiendo a URL del iframe: ${data.iframeUrl}`);
         // En un flujo real usaríamos un iframe embebido, aquí podríamos abrirlo en otra pestaña para probar
         window.open(data.iframeUrl, "_blank");
      }
    } catch (err: any) {
      addLog("Error en Agregar Tarjeta:", err.message);
    }
  };

  const handleSimularCron = async () => {
    addLog("Iniciando 'Simular Cron' (Cobro)...");
    try {
      const res = await fetch("/api/pagopar/suscripcion/cobrar-prueba", { method: "POST" });
      const data = await res.json();
      addLog("Respuesta Simular Cron:", data);
    } catch (err: any) {
      addLog("Error en Simular Cron:", err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sandbox Pagopar</h1>
        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-200">
          Modo Pruebas (Admin)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Catastro</CardTitle>
            <p className="text-sm text-gray-500">
              Registra al usuario actual en Pagopar y solicita guardar una tarjeta.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <button onClick={handleAgregarCliente} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              1. Agregar Cliente en Pagopar
            </button>
            <button onClick={handleAgregarTarjeta} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">
              2. Catastrar Tarjeta (Iframe)
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Cobro Automático</CardTitle>
            <p className="text-sm text-gray-500">
              Simula el CRON que debita automáticamente de las tarjetas guardadas.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <button onClick={handleSimularCron} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
              3. Simular CRON (Pagar)
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consola de Respuesta (Logs)</CardTitle>
          <p className="text-sm text-gray-500">Aquí verás los JSON que responde Pagopar</p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs h-[400px] overflow-y-auto whitespace-pre-wrap shadow-inner border border-gray-700">
            {logs.length === 0 ? (
              <span className="text-gray-500">Esperando acciones...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-3 border-b border-gray-800 pb-2">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
