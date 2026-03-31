import React from 'react';
import { CheckCircle2, Star, Target, Shield, Heart, MonitorSmartphone, ArrowRight, Activity, Smile, Search } from 'lucide-react';
import Link from 'next/link';

interface LandingProps {
  countryName?: string;
  currencySymbol: string;
  price: string;
  priceSuffix?: string;
  seoTitle: string;
  seoDescription: string;
}

export default function LandingTemplate({ 
  countryName, 
  currencySymbol, 
  price, 
  priceSuffix = "/mes",
  seoTitle, 
  seoDescription 
}: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm md:w-10 md:h-10 md:text-base">
              OD
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Odonto<span className="text-emerald-600">Drive</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="text-sm font-bold bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold mb-8 shadow-sm">
          <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          <span>El Software Clínico #1 para Odontólogos {countryName ? `en ${countryName}` : 'de vanguardia'}</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          Gestiona tu clínica con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">Inteligencia Artificial</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Odontogramas inteligentes, presupuestos automáticos, historias clínicas en la nube y recordatorios de pago. Lleva tu práctica al siguiente nivel sin complicaciones técnicas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group text-lg">
            Empieza ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#precios" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all text-lg">
            Ver Planes
          </a>
        </div>
        
        {/* Hero Mockup Preview */}
        <div className="mt-20 block w-full aspect-video rounded-3xl bg-slate-900 shadow-2xl overflow-hidden border-8 border-slate-800 relative group">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href="/login" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">Probar Demo Real</Link>
          </div>
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          {/* Falso Dashboard UI overlay para darle pinta de software */}
          <div className="absolute top-4 left-4 right-4 bottom-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex gap-4">
             <div className="w-64 bg-white/90 rounded-xl h-full hidden md:block"></div>
             <div className="flex-1 bg-white/95 rounded-xl h-full shadow-inner flex flex-col p-6 space-y-4">
               <div className="w-full h-12 bg-slate-100 rounded-lg animate-pulse"></div>
               <div className="flex gap-4">
                 <div className="w-1/3 h-32 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                 <div className="w-1/3 h-32 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                 <div className="w-1/3 h-32 bg-emerald-50 rounded-lg border border-emerald-100"></div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Todo lo que necesitas, en un solo lugar</h2>
            <p className="text-slate-600 text-lg">Herramientas diseñadas exclusivamente por y para Odontólogos.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Odontograma Iterativo", icon: <Target className="w-8 h-8 text-emerald-600" />, desc: "Registra caries, resinas, extracciones y más con una interfaz visual. Marca piezas ausentes y deciduas con un clic." },
              { title: "Manejo Financiero SaaS", icon: <Activity className="w-8 h-8 text-emerald-600" />, desc: "Módulo de cotizador interactivo. Genera presupuestos en PDF con estética corporativa (tu logo y tus colores) al instante." },
              { title: "HCE y Analítica IA", icon: <Search className="w-8 h-8 text-emerald-600" />, desc: "Comparador de radiografías con Inteligencia Artificial. Almacenamiento seguro en la nube para el historial de tus pacientes." },
              { title: "Recetario Profesional", icon: <Shield className="w-8 h-8 text-emerald-600" />, desc: "Prescribe medicamentos rápido y envía a impresión en formato A4 con tu registro profesional y logo precargados." },
              { title: "Agenda Dinámica", icon: <MonitorSmartphone className="w-8 h-8 text-emerald-600" />, desc: "Visualiza todas tus citas del día, la semana o el mes en una vista responsive para móviles, tablets o PCs." },
              { title: "Experiencia Premium", icon: <Smile className="w-8 h-8 text-emerald-600" />, desc: "Diseño minimalista que asombra visualmente y transmite paz, ayudándote a ser extremadamente eficiente cada día." }
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-20 bg-emerald-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Heart className="w-12 h-12 text-emerald-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-black mb-6 leading-tight">"OdontoDrive cambió por completo la forma en la que gestiono mis pacientes."</h2>
          <p className="text-emerald-200 text-lg uppercase tracking-widest font-bold">Dra. María Laura - Ortodoncista</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Inversión Inteligente</h2>
          <p className="text-slate-600 text-lg mb-12">Cancela en cualquier momento. Sin contratos a largo plazo.</p>
          
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 w-full max-w-lg border-2 border-emerald-500 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
              MÁS POPULAR
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2">Plan Pro</h3>
            <p className="text-slate-500 mb-6">Acceso total a todas las funciones vitalicias.</p>
            
            <div className="flex items-end justify-center gap-1 mb-8">
              <span className="text-3xl font-bold text-slate-400">{currencySymbol}</span>
              <span className="text-6xl font-black text-slate-900 leading-none">{price}</span>
              <span className="text-slate-500 font-medium mb-2">{priceSuffix}</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-left max-w-sm mx-auto">
              {[
                "Atención de pacientes ilimitada.",
                "Almacenamiento en la nube (2GB).",
                "Odontogramas Interactivos Múltiples.",
                "Personalización del Layout de Clínica.",
                "Comparador Fotográfico con IA.",
                "Soporte Directo."
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-md text-lg">
              Crear Cuenta y Probar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 font-bold text-xs">OD</div>
             <span className="text-lg font-bold text-white tracking-tight">Odonto<span className="text-emerald-500">Drive</span></span>
          </div>
          <p className="font-medium text-sm">© 2026 OdontoDrive. Todos los derechos reservados. Diseñado para optimizar tu tiempo.</p>
        </div>
      </footer>
    </div>
  );
}
