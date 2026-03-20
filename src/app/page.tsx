import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/Card";
import { Activity, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Vista General Clínica
        </h1>
        <p className="text-sm text-gray-500">
          Toma el control de tu clínica hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 row-span-2 flex flex-col min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Turnos del Día</CardTitle>
            <button className="p-2 bg-accent/20 rounded-full text-sidebar hover:bg-accent/40 transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
             {/* Mock visualization similar to "Energy Used" in design */}
             <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute w-44 h-44 bg-accent rounded-full mix-blend-multiply opacity-80 flex items-center justify-center shadow-lg -translate-x-10 translate-y-4">
                  <div className="text-center">
                    <span className="text-4xl font-black text-sidebar">12</span>
                    <p className="text-[10px] font-bold text-sidebar/70 uppercase tracking-widest mt-1">Atendidos</p>
                  </div>
                </div>
                <div className="absolute w-40 h-40 bg-sidebar rounded-full mix-blend-normal flex items-center justify-center shadow-2xl translate-x-12 -translate-y-4 z-10">
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">4</span>
                    <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest mt-1">En Sala</p>
                  </div>
                </div>
                <div className="absolute w-28 h-28 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] -translate-y-16 -translate-x-4 z-20">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">3</span>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">Espera</p>
                  </div>
                </div>
             </div>
             
             <div className="w-full mt-12 space-y-5 px-4">
               <div className="flex items-center justify-between w-full">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-sidebar"></div>
                   <span className="text-sm font-semibold text-gray-600">Tratamientos</span>
                 </div>
                 <span className="text-sm font-bold">45%</span>
               </div>
               <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                 <div className="h-full bg-sidebar rounded-full transition-all duration-1000 ease-out" style={{ width: '45%' }}></div>
               </div>
               
               <div className="flex items-center justify-between w-full">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   <span className="text-sm font-semibold text-gray-600">Consultas Med.</span>
                 </div>
                 <span className="text-sm font-bold">30%</span>
               </div>
               <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                 <div className="h-full bg-accent rounded-full transition-all duration-1000 ease-out delay-150" style={{ width: '30%' }}></div>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 tracking-wide uppercase">Pacientes Activos</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">4.2k</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shadow-sm">+12%</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Promedio Mensual 3.8k</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 tracking-wide uppercase">Índice de Salud</CardTitle>
            <Activity className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">85<span className="text-2xl font-bold">%</span></span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shadow-sm">+5%</span>
            </div>
            {/* Minimalist chart visualization */}
            <div className="flex items-end gap-2 h-16 mt-4 opacity-90">
               {[40, 60, 45, 80, 55, 90, 85].map((h, i) => (
                 <div key={i} className={cn("w-full rounded-[4px] transition-all hover:opacity-80", i === 6 ? "bg-sidebar shadow-md" : "bg-gray-200")} style={{ height: `${h}%` }}></div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-sidebar text-white border-0 shadow-xl overflow-hidden relative min-h-[220px]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
             <div className="flex items-center gap-2">
               <span className="text-xl font-black flex items-center justify-center">Odontólogo<span className="text-accent font-black tracking-widest">IA</span></span>
             </div>
            <button className="px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-xs font-semibold backdrop-blur-sm">
              Mensual
            </button>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-l-4 border-accent pl-5 mt-2">
              <div className="space-y-1">
                <p className="text-3xl font-black flex items-baseline gap-1">85<span className="text-lg text-gray-400">%</span></p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Término Diagnóstico</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-3xl font-black flex items-baseline gap-2 justify-end">7<span className="text-lg text-gray-400">h</span> 15<span className="text-lg text-gray-400">m</span></p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Tiempo Ahorrado</p>
              </div>
            </div>
            
            <div className="flex gap-3 h-16 items-end justify-between mt-6 px-2">
               {[30, 45, 25, 60, 85, 40, 100].map((h, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 group w-full cursor-pointer">
                   <div 
                     className={cn(
                       "w-2.5 rounded-full transition-all duration-500 ease-out", 
                       i === 6 ? "bg-accent shadow-[0_0_10px_rgba(212,243,74,0.5)]" : "bg-gray-600 group-hover:bg-gray-400",
                       "h-full"
                     )} 
                     style={{ height: `${h}%` }}
                   ></div>
                   <span className={cn("text-[10px] font-bold", i === 6 ? "text-accent" : "text-gray-500")}>
                     {['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]}
                   </span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
