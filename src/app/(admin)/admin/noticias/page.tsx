"use client";

import React, { useEffect, useState, useRef } from "react";
import { noticiasService, Noticia } from "@/core/noticias";
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, CheckCircle, Ban, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoticia, setCurrentNoticia] = useState<Partial<Noticia>>({});
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNoticias = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await noticiasService.adminGetAllNoticias();
      if (error) throw error;
      setNoticias(data || []);
    } catch (err: any) {
      alert("Error cargando noticias: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleCreateNew = () => {
    setCurrentNoticia({
      title: "",
      slug: "",
      summary: "",
      content: "",
      image_url: "",
      is_published: false
    });
    setIsEditing(true);
  };

  const handleEdit = (n: Noticia) => {
    setCurrentNoticia(n);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta noticia de forma permanente?")) return;
    try {
      const { error } = await noticiasService.adminDeleteNoticia(id);
      if (error) throw error;
      fetchNoticias();
    } catch (err: any) {
      alert("Error eliminando: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentNoticia.id) {
        const { error } = await noticiasService.adminUpdateNoticia(currentNoticia.id, currentNoticia);
        if (error) throw error;
      } else {
        if (!currentNoticia.title || !currentNoticia.slug || !currentNoticia.content) {
          return alert("Título, slug y contenido son obligatorios.");
        }
        const { error } = await noticiasService.adminCreateNoticia(currentNoticia as Partial<Noticia>);
        if (error) throw error;
      }
      setIsEditing(false);
      fetchNoticias();
    } catch (err: any) {
      alert("Error guardando: " + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await noticiasService.uploadNoticiaImage(file);
      setCurrentNoticia({ ...currentNoticia, image_url: url });
    } catch (err: any) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{currentNoticia.id ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título (H1)</label>
                <input 
                  type="text" 
                  value={currentNoticia.title || ""} 
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    if (!currentNoticia.id) {
                      setCurrentNoticia({ ...currentNoticia, title: newTitle, slug: generateSlug(newTitle) });
                    } else {
                      setCurrentNoticia({ ...currentNoticia, title: newTitle });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slug (URL SEO)</label>
                <input 
                  type="text" 
                  value={currentNoticia.slug || ""} 
                  onChange={(e) => setCurrentNoticia({ ...currentNoticia, slug: generateSlug(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">odontodrive.com/blog/{currentNoticia.slug || '...'}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Resumen (Meta Descripción SEO)</label>
                <textarea 
                  value={currentNoticia.summary || ""} 
                  onChange={(e) => setCurrentNoticia({ ...currentNoticia, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="is_published"
                  checked={currentNoticia.is_published || false}
                  onChange={(e) => setCurrentNoticia({ ...currentNoticia, is_published: e.target.checked })}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <label htmlFor="is_published" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                  Publicar Artículo (Visible públicamente)
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagen Destacada (Open Graph)</label>
                <div className="flex flex-col items-center gap-4">
                  {currentNoticia.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentNoticia.image_url} alt="Cover" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                  ) : (
                    <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Subiendo..." : "Subir Imagen"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contenido (Markdown)</label>
            <textarea 
              value={currentNoticia.content || ""} 
              onChange={(e) => setCurrentNoticia({ ...currentNoticia, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm font-mono h-96"
              required
              placeholder="# Título Principal&#10;&#10;Párrafo de texto. Puedes usar **negritas** y *cursivas*.&#10;&#10;- Lista 1&#10;- Lista 2"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Noticia
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Blog / Noticias</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona el contenido SEO público de Odontodrive.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/blog" target="_blank" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Ver Blog
          </Link>
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Noticia
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Artículo</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : noticias.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay noticias registradas.</td></tr>
            ) : (
              noticias.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {n.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.image_url} alt="" className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                        <p className="text-xs text-gray-500 font-mono">/{n.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {n.is_published ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        <Ban className="w-3 h-3" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {new Date(n.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(n)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
