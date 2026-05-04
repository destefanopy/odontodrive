import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/infrastructure/supabase";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

async function getNoticia(slug: string) {
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const noticia = await getNoticia(params.slug);

  if (!noticia) {
    return {
      title: "Noticia no encontrada | Odontodrive",
    };
  }

  return {
    title: `${noticia.title} | Odontodrive Blog`,
    description: noticia.summary || "Lee este artículo en el blog de Odontodrive.",
    openGraph: {
      title: noticia.title,
      description: noticia.summary || "Lee este artículo en el blog de Odontodrive.",
      type: "article",
      publishedTime: noticia.created_at,
      images: noticia.image_url ? [{ url: noticia.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.title,
      description: noticia.summary || "",
      images: noticia.image_url ? [noticia.image_url] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const noticia = await getNoticia(params.slug);

  if (!noticia) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-cyan-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white shadow-sm md:w-10 md:h-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <path d="M15.5 3c-1.3 0-2.5.6-3.5 1.6-1-1-2.2-1.6-3.5-1.6C5.5 3 3 5.5 3 8.5c0 4 3 6 3.5 10 .3 1.5 1.5 2.5 3 2.5 1.5 0 2.5-.8 3-2l1-2.5 1 2.5c.5 1.2 1.5 2 3 2 1.5 0 2.7-1 3-2.5.5-4 3.5-6 3.5-10C24 5.5 21.5 3 18.5 3Z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Odonto<span className="text-cyan-600">Drive</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">
              Volver a Inicio
            </Link>
            <Link href="/login" className="text-sm font-bold text-white bg-cyan-500 px-4 py-2 rounded-full hover:bg-cyan-400 transition-colors hidden md:block">
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-accent transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al blog
        </Link>

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-500 mb-6">
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <Calendar className="w-4 h-4" />
              {new Date(noticia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            {noticia.title}
          </h1>
          {noticia.summary && (
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {noticia.summary}
            </p>
          )}
        </header>

        {noticia.image_url && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 aspect-video relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={noticia.image_url} 
              alt={noticia.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg md:prose-xl prose-gray max-w-none prose-headings:font-black prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {noticia.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center gap-6">
          <p className="font-bold text-gray-900">¿Te resultó útil este artículo?</p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
