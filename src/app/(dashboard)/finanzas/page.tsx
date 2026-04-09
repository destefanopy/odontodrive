"use client";

import { useEffect, useState } from "react";
import { getPagos, getDeudas, Pago, Deuda } from "@/core/api";
import { Wallet, TrendingUp, Calendar, CreditCard, Loader2, ArrowUpCircle, ArrowDownCircle, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanzasPage() {

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("Gs.");

  useEffect(() => {
    cargarFinanzas();
    import("@/infrastructure/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.currency_symbol) {
          setCurrencySymbol(user.user_metadata.currency_symbol);
        }
      });
    });
  }, []);

  const cargarFinanzas = async () => {
    try {
      const [pData, dData] = await Promise.all([
        getPagos(),
        getDeudas()
      ]);
      setPagos(pData);
      setDeudas(dData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return `${currencySymbol} ${num.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`;
  };

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
  const deudasTotal = deudas.reduce((acc, d) => acc + Number(d.monto), 0);
  
  const totalPorCobrar = Math.max(0, deudasTotal - ingresosTotal);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" /> Cierre de Caja
        </h1>
        <p className="text-gray-700 font-medium mt-1">
          Monitor de ingresos clínicos, abonos y rentabilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative">
            <h3 className="text-emerald-700 font-bold text-xs tracking-wide uppercase">Ingresos Hoy</h3>
            <p className="text-3xl font-black text-emerald-900 mt-2">{formatCurrency(ingresosHoy)}</p>
            <p className="text-[10px] text-emerald-600 mt-2 font-black uppercase tracking-widest">
              CAJA DEL DÍA
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-24 h-24 text-gray-900" />
          </div>
          <div className="relative">
            <h3 className="text-gray-700 font-bold text-xs tracking-wide uppercase">Ingresos Mes</h3>
            <p className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(ingresosMes)}</p>
            <p className="text-[10px] text-gray-800 mt-2 font-black uppercase tracking-widest">
              PERIODO ACTUAL
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative">
            <h3 className="text-blue-700 font-bold text-xs tracking-wide uppercase">Caja Histórica</h3>
            <p className="text-3xl font-black text-blue-900 mt-2">{formatCurrency(ingresosTotal)}</p>
            <p className="text-[10px] text-blue-400 mt-2 font-black uppercase tracking-widest">
              ACUMULADO GLOBAL
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-24 h-24 text-red-600" />
          </div>
          <div className="relative">
            <h3 className="text-red-700 font-bold text-xs tracking-wide uppercase">Por Cobrar</h3>
            <p className="text-3xl font-black text-red-900 mt-2">{formatCurrency(totalPorCobrar)}</p>
            <p className="text-[10px] text-red-500 mt-2 font-black uppercase tracking-widest">
              DEUDA GLOBAL PACIENTES
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-extrabold text-gray-900">Últimos Movimientos</h2>
        </div>
        
        {deudas.length === 0 && pagos.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Wallet className="w-12 h-12 text-gray-200 mb-3" />
            <h3 className="text-gray-800 font-bold">Sin transacciones</h3>
            <p className="text-sm text-gray-800 mt-1">Aún no has registrado pagos ni deudas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-800 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ...pagos.map(p => ({ ...p, _tipo: "Abono" as const, _fecha: new Date(p.fecha_pago) })),
                  ...deudas.map(d => ({ ...d, _tipo: "Deuda" as const, _fecha: new Date(d.fecha) }))
                ].sort((a, b) => b._fecha.getTime() - a._fecha.getTime())
                .map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {tx._fecha.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-800">
                        {tx._fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {tx.pacientes?.nombres_apellidos || "Desconocido"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {tx.concepto} {tx._tipo === 'Abono' && <span className="text-gray-800 text-[10px] ml-1">({(tx as any).metodo_pago})</span>}
                    </td>
                    <td className="px-6 py-4">
                      {tx._tipo === 'Abono' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 w-fit">
                          <ArrowDownCircle className="w-3.5 h-3.5" /> Ingreso
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 w-fit">
                          <ArrowUpCircle className="w-3.5 h-3.5" /> Cargo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-base font-black ${tx._tipo === 'Abono' ? 'text-blue-700' : 'text-red-700'}`}>
                        {tx._tipo === 'Abono' ? '+' : '-'}{formatCurrency(tx.monto)}
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
