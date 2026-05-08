import React from 'react';
import { CheckCircle2, Star, Target, Shield, Heart, MonitorSmartphone, ArrowRight, Activity, Smile, Search, HardDrive } from 'lucide-react';
import Link from 'next/link';

export interface PricingPlan {
  name: string;
  price: string;
  storage: string;
  features: string[];
  isPopular?: boolean;
  max_patients?: number;
}

interface LandingProps {
  countryName?: string;
  currencySymbol: string;
  priceSuffix?: string;
  plans: PricingPlan[];
  seoTitle: string;
  seoDescription: string;
}

export default function LandingTemplate({ 
  countryName, 
  currencySymbol, 
  priceSuffix = "/mes",
  plans,
  seoTitle, 
  seoDescription 
}: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-200 selection:text-cyan-900">
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-cyan-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white shadow-sm md:w-10 md:h-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <path d="M15.5 3c-1.3 0-2.5.6-3.5 1.6-1-1-2.2-1.6-3.5-1.6C5.5 3 3 5.5 3 8.5c0 4 3 6 3.5 10 .3 1.5 1.5 2.5 3 2.5 1.5 0 2.5-.8 3-2l1-2.5 1 2.5c.5 1.2 1.5 2 3 2 1.5 0 2.7-1 3-2.5.5-4 3.5-6 3.5-10C24 5.5 21.5 3 18.5 3Z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Odonto<span className="text-cyan-600">Drive</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors hidden md:block">
              Blog / Noticias
            </Link>
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="https://odontodrive.com/register" className="text-sm font-bold bg-cyan-500 text-white px-5 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(6,182,212,0.4)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.25)] hover:bg-cyan-400 transition-all transform hover:-translate-y-0.5">
              Regístrate
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-cyan-100 text-cyan-700 text-sm font-bold mb-8 shadow-sm">
          <Star className="w-4 h-4 text-cyan-500 fill-cyan-500" />
          <span>El Software Clínico #1 para Odontólogos {countryName ? `en ${countryName}` : 'de vanguardia'}</span>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Gestiona tu clínica con <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 drop-shadow-sm">Inteligencia Artificial</span>
          </h1>
        </div>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Odontogramas inteligentes, presupuestos automáticos, historias clínicas en la nube y recordatorios de pago. Lleva tu práctica al siguiente nivel sin complicaciones técnicas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="https://odontodrive.com/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group text-lg">
            Empieza ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#precios" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all text-lg">
            Ver Planes
          </a>
        </div>
        
        {/* Hero Mockup Preview */}
        <div className="mt-20 block w-full aspect-video rounded-3xl bg-slate-900 shadow-2xl overflow-hidden border-8 border-slate-800 relative group">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href="https://odontodrive.com/register" className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-full shadow-[0_4px_14px_0_rgba(6,182,212,0.4)] hover:scale-105 transition-transform">Probar Demo Real</Link>
          </div>
          
          {/* Custom Promotional Image */}
          <div className="w-full h-full bg-[url('/imagen_landing.jpg')] bg-cover bg-center"></div>
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
              { title: "Odontograma Iterativo", icon: <Target className="w-8 h-8 text-cyan-600" />, desc: "Registra caries, resinas, extracciones y más con una interfaz visual. Marca piezas ausentes y deciduas con un clic." },
              { title: "Manejo Financiero SaaS", icon: <Activity className="w-8 h-8 text-cyan-600" />, desc: "Módulo de cotizador interactivo. Genera presupuestos en PDF con estética corporativa (tu logo y tus colores) al instante." },
              { title: "HCE y Analítica IA", icon: <Search className="w-8 h-8 text-cyan-600" />, desc: "Comparador de radiografías con Inteligencia Artificial. Almacenamiento seguro en la nube para el historial de tus pacientes." },
              { title: "Recetario Profesional", icon: <Shield className="w-8 h-8 text-cyan-600" />, desc: "Prescribe medicamentos rápido y envía a impresión en formato A4 con tu registro profesional y logo precargados." },
              { title: "Agenda Dinámica", icon: <MonitorSmartphone className="w-8 h-8 text-cyan-600" />, desc: "Visualiza todas tus citas del día, la semana o el mes en una vista responsive para móviles, tablets o PCs." },
              { title: "Experiencia Premium", icon: <Smile className="w-8 h-8 text-cyan-600" />, desc: "Diseño minimalista que asombra visualmente y transmite paz, ayudándote a ser extremadamente eficiente cada día." }
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-emerald-50 hover:border-cyan-200 transition-all group">
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
      <section className="py-20 bg-cyan-900 text-white text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-cyan-800 shadow-2xl shrink-0 hover:scale-105 transition-transform duration-500">
             <img src="/robot_1.jpg" alt="IA Assistant" className="w-full h-full object-cover" />
          </div>
          <div className="text-left max-w-2xl">
            <Heart className="w-12 h-12 text-cyan-400 mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">"OdontoDrive cambió por completo la forma en la que gestiono mis pacientes."</h2>
            <p className="text-cyan-200 text-lg uppercase tracking-widest font-bold">Dra. María Laura - Ortodoncista</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Inversión Inteligente</h2>
          <p className="text-slate-600 text-lg mb-12">Escala a medida que tu clínica crece. Sin contratos obligatorios.</p>
          
          <div className="flex flex-wrap justify-center gap-6 w-full max-w-[1400px]">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`w-full md:w-[calc(50%-12px)] ${plans.length === 5 ? 'lg:w-[calc(33.333%-16px)] xl:w-[calc(20%-19.2px)]' : 'lg:w-[calc(25%-18px)]'} bg-white rounded-3xl p-8 relative flex flex-col items-center text-center transition-all duration-300 ${plan.isPopular ? 'border-2 border-cyan-400 shadow-[0_8px_30px_rgb(6,182,212,0.2)] lg:scale-105 z-10' : 'border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-200'}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-teal-400 text-white px-6 py-1.5 rounded-full text-xs font-black shadow-lg shadow-cyan-500/30 tracking-wider border border-cyan-300/50">
                    RECOMENDADO
                  </div>
                )}
                
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-6 bg-slate-50 px-4 py-1.5 rounded-full text-sm font-semibold text-slate-600">
                  <HardDrive className="w-4 h-4 text-cyan-500" />
                  {plan.storage}
                </div>
                
                <div className="flex items-end justify-center gap-1 mb-8">
                  <span className="text-xl font-bold text-slate-400 mb-1">{currencySymbol}</span>
                  <span className="text-5xl font-black text-slate-900 leading-none">{plan.price}</span>
                  <span className="text-slate-500 font-medium mb-1">{priceSuffix}</span>
                </div>
                
                <ul className="space-y-4 mb-8 text-left w-full mx-auto flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium text-sm leading-snug">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="https://odontodrive.com/register" className={`block w-full py-4 font-bold rounded-2xl transition-all text-sm ${plan.isPopular ? 'bg-cyan-500 text-white shadow-[0_4px_14px_0_rgba(6,182,212,0.4)] hover:bg-cyan-400 hover:shadow-[0_6px_20px_rgba(6,182,212,0.25)]' : 'bg-slate-900 text-white hover:bg-black shadow-sm'}`}>
                  Seleccionar {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M15.5 3c-1.3 0-2.5.6-3.5 1.6-1-1-2.2-1.6-3.5-1.6C5.5 3 3 5.5 3 8.5c0 4 3 6 3.5 10 .3 1.5 1.5 2.5 3 2.5 1.5 0 2.5-.8 3-2l1-2.5 1 2.5c.5 1.2 1.5 2 3 2 1.5 0 2.7-1 3-2.5.5-4 3.5-6 3.5-10C24 5.5 21.5 3 18.5 3Z" />
               </svg>
             </div>
             <span className="text-lg font-bold text-white tracking-tight">Odonto<span className="text-cyan-500">Drive</span></span>
             <Link href="/blog" className="text-sm font-medium text-slate-400 hover:text-cyan-400 ml-4 transition-colors">Blog</Link>
          </div>
          <p className="font-medium text-sm">© 2026 OdontoDrive. Todos los derechos reservados. Diseñado para optimizar tu tiempo.</p>
        </div>
      </footer>
    </div>
  );
}
