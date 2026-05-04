import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { supabase } from "@/infrastructure/supabase";

export const revalidate = 60; // Revalidar cada 60 segundos (ISR)

async function getPublishedNoticias() {
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export const metadata = {
  title: "Blog & Noticias | Odontodrive",
  description: "Descubre las últimas novedades, consejos y artículos sobre gestión dental moderna con Odontodrive.",
  openGraph: {
    title: "Blog & Noticias | Odontodrive",
    description: "Descubre las últimas novedades, consejos y artículos sobre gestión dental moderna con Odontodrive.",
    type: "website",
  }
};

export default async function BlogIndexPage() {
  const noticias = await getPublishedNoticias();

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Noticias y <span className="text-accent">Novedades</span>
          </h1>
          <p className="text-lg text-gray-600">
            Mantente al día con los últimos avances en gestión clínica, consejos y actualizaciones de Odontodrive.
          </p>
        </div>

        {noticias.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Próximamente...</h3>
            <p className="text-gray-500">Estamos preparando artículos increíbles para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {noticias.map((n: any) => (
              <Link key={n.id} href={`/blog/${n.slug}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-accent/20 transition-all duration-300 flex flex-col">
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  {n.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={n.image_url} 
                      alt={n.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/5">
                      <span className="text-accent font-black text-3xl opacity-20">ODONTODRIVE</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-gray-900 text-xs font-black rounded-full shadow-sm">
                      Blog
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                    {n.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {n.summary}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-accent font-bold text-sm group-hover:gap-2 transition-all">
                    Leer artículo <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
