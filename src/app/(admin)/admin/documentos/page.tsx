"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, Edit, Trash2, Check, X, ShieldAlert, FileSignature } from "lucide-react";
import { getConsentTemplates, adminCreateConsentTemplate, adminUpdateConsentTemplate, adminDeleteConsentTemplate, ConsentTemplateDB } from "@/core/api";
import { supabase } from "@/infrastructure/supabase";

export default function AdminDocumentosPage() {
  const [templates, setTemplates] = useState<ConsentTemplateDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ clave: string; title: string; content: string }>({ clave: '', title: '', content: '' });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getConsentTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar plantillas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    const newId = `new-${Date.now()}`;
    setTemplates([{ id: newId, clave: '', title: '', content: '', created_at: '', updated_at: '' }, ...templates]);
    setEditingId(newId);
    setEditData({ clave: '', title: '', content: '' });
  };

  const handleEdit = (t: ConsentTemplateDB) => {
    setEditingId(t.id);
    setEditData({ clave: t.clave, title: t.title, content: t.content });
  };

  const handleCancel = () => {
    if (editingId?.startsWith('new-')) {
      setTemplates(templates.filter(t => t.id !== editingId));
    }
    setEditingId(null);
  };

  const handleSave = async (id: string) => {
    if (!editData.clave || !editData.title || !editData.content) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (id.startsWith('new-')) {
        await adminCreateConsentTemplate(editData);
      } else {
        await adminUpdateConsentTemplate(id, editData);
      }
      setEditingId(null);
      await fetchTemplates();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta plantilla permanentemente?")) return;
    setIsLoading(true);
    try {
      await adminDeleteConsentTemplate(id);
      await fetchTemplates();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-accent" />
            Plantillas de Consentimiento
          </h1>
          <p className="text-sm text-gray-700 font-medium mt-1">
            Gestión global de documentos legales para todos los odontólogos.
          </p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={editingId !== null}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Nueva Plantilla
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && !editingId && templates.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium">Cargando plantillas...</div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {editingId === t.id ? (
                <div className="p-5 space-y-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Clave (Identificador único, sin espacios)</label>
                      <input 
                        type="text" 
                        value={editData.clave} 
                        onChange={e => setEditData({...editData, clave: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-sm font-medium"
                        placeholder="ej: ortodoncia"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Título Visible para el Doctor</label>
                      <input 
                        type="text" 
                        value={editData.title} 
                        onChange={e => setEditData({...editData, title: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-sm font-medium"
                        placeholder="ej: Consentimiento para Ortodoncia"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex justify-between">
                      <span>Cuerpo del Documento (Usa formato Markdown y variables)</span>
                      <span className="text-gray-400 font-normal">Variables: {'{{paciente_nombre}}'}, {'{{doctor_nombre}}'}, {'{{ciudad}}'}, etc.</span>
                    </label>
                    <textarea 
                      value={editData.content} 
                      onChange={e => setEditData({...editData, content: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-sm font-serif h-64 resize-y"
                      placeholder="Yo, **{{paciente_nombre}}**, autorizo..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition-colors text-sm">
                      Cancelar
                    </button>
                    <button onClick={() => handleSave(t.id)} className="px-4 py-2 rounded-lg bg-accent text-white font-bold hover:bg-accent/90 transition-colors text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{t.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {t.clave}
                      </span>
                      <span className="text-xs text-gray-400">
                        Actualizado: {new Date(t.updated_at || t.created_at || Date.now()).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEdit(t)}
                      className="p-2 text-gray-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors border border-transparent hover:border-accent/20"
                      title="Editar Plantilla"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Eliminar Permanente"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
