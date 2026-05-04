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
