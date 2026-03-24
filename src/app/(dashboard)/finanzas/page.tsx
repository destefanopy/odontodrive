"use client";

import { useEffect, useState } from "react";
import { getPagos, Pago } from "@/core/api";
import { Wallet, TrendingUp, Calendar, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanzasPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      const data = await getPagos();
      setPagos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatGs = (num: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(num);

  const hoy = new Date();
  
  // Métricas
  const pagosHoy = pagos.filter(p => new Date(p.fecha_pago).toDateString() === hoy.toDateString());
  const ingresosHoy = pagosHoy.reduce((acc, p) => acc + Number(p.monto), 0);

  const pagosMes = pagos.filter(p => {
    const d = new Date(p.fecha_pago);
    return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  });
  const ingresosMes = pagosMes.reduce((acc, p) => acc + Number(p.monto), 0);

  const ingresosTotal = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" /> Cierre de Caja
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Monitor de ingresos clínicos, abonos y rentabilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative">
            <h3 className="text-emerald-700 font-bold text-sm tracking-wide uppercase">Ingresos de Hoy</h3>
            <p className="text-4xl font-black text-emerald-900 mt-2">{formatGs(ingresosHoy)}</p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              {pagosHoy.length} transacciones registradas hoy
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-24 h-24 text-gray-900" />
          </div>
          <div className="relative">
            <h3 className="text-gray-500 font-bold text-sm tracking-wide uppercase">Acumulado del Mes</h3>
            <p className="text-3xl font-black text-gray-900 mt-2">{formatGs(ingresosMes)}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              Corresponde al mes actual
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative">
            <h3 className="text-gray-500 font-bold text-sm tracking-wide uppercase">Caja Histórica Total</h3>
            <p className="text-3xl font-black text-gray-900 mt-2">{formatGs(ingresosTotal)}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              Ingresos brutos globales
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-extrabold text-gray-900">Últimos Movimientos</h2>
        </div>
        
        {pagos.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Wallet className="w-12 h-12 text-gray-200 mb-3" />
            <h3 className="text-gray-400 font-bold">Sin transacciones</h3>
            <p className="text-sm text-gray-400 mt-1">Aún no has registrado pagos en las fichas clínicas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4">Método</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {new Date(pago.fecha_pago).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(pago.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {pago.pacientes?.nombres_apellidos || "Desconocido"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {pago.concepto}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full",
                        pago.metodo_pago === 'Efectivo' ? 'bg-emerald-100 text-emerald-700' :
                        pago.metodo_pago === 'Tarjeta' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      )}>
                        {pago.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-black text-gray-900">
                        {formatGs(pago.monto)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
