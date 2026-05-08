"use client";

import React, { useEffect, useState } from "react";
import { authService } from "@/core/auth";
import { Globe, Plus, Save, Trash2, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminRegiones() {
  const [regiones, setRegiones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Default structure for a new plan
  const defaultPlan = {
    name: "Nuevo Plan",
    price: "0",
    storage: "1 GB",
    features: ["Característica 1", "Característica 2"],
    isPopular: false
  };

  const fetchRegiones = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.adminGetRegiones();
      if (error) throw error;
      setRegiones(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar regiones.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegiones();
  }, []);

  const handleAddRegion = () => {
    const newRegion = {
      slug: "nuevo-slug",
      country_name: "Nuevo País",
      currency_symbol: "$",
      price_suffix: "/mes",
      seo_title: "OdontoDrive País | Software Odontológico",
      seo_description: "Descripción de SEO para este país.",
      planes: [
        { ...defaultPlan, name: "Gratis" },
        { ...defaultPlan, name: "Básico", price: "100" }
      ]
    };
    setRegiones([newRegion, ...regiones]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...regiones];
    updated[index] = { ...updated[index], [field]: value };
    setRegiones(updated);
  };

  const handlePlanChange = (regionIndex: number, planIndex: number, field: string, value: any) => {
    const updated = [...regiones];
    const planes = [...(updated[regionIndex].planes || [])];
    planes[planIndex] = { ...planes[planIndex], [field]: value };
    updated[regionIndex] = { ...updated[regionIndex], planes };
    setRegiones(updated);
  };

  const handleAddPlan = (regionIndex: number) => {
    const updated = [...regiones];
    const planes = [...(updated[regionIndex].planes || [])];
    planes.push({ ...defaultPlan });
    updated[regionIndex] = { ...updated[regionIndex], planes };
    setRegiones(updated);
  };

  const handleRemovePlan = (regionIndex: number, planIndex: number) => {
    const updated = [...regiones];
    let planes = [...(updated[regionIndex].planes || [])];
    planes = planes.filter((_, i) => i !== planIndex);
    updated[regionIndex] = { ...updated[regionIndex], planes };
    setRegiones(updated);
  };

  const handleSave = async (region: any) => {
    setIsSaving(true);
    try {
      if (!region.slug || !region.country_name) throw new Error("El slug y el país son obligatorios.");
      const { error } = await authService.adminSaveRegion(region);
      if (error) throw error;
      alert(`Región ${region.country_name} guardada exitosamente.`);
      fetchRegiones();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (region: any) => {
    if (!region.id) {
      // It's a new unsaved region
      setRegiones(regiones.filter(r => r !== region));
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la región ${region.country_name}? Esta acción no se puede deshacer y la URL /${region.slug} dejará de funcionar.`)) return;

    try {
      const { error } = await authService.adminDeleteRegion(region.id);
      if (error) throw error;
      fetchRegiones();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-accent" />
            Regiones y Precios
          </h1>
          <p className="text-sm text-gray-700 font-medium mt-1">
            Crea páginas de destino (/br, /ec) dinámicamente con su propia moneda y SEO.
          </p>
        </div>
        <button 
          onClick={handleAddRegion}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Región
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando regiones...</div>
      ) : regiones.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
          No hay regiones creadas. Haz clic en "Nueva Región" para empezar.
        </div>
      ) : (
        <div className="space-y-8">
          {regiones.map((region, regionIndex) => (
            <div key={region.id || regionIndex} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-black text-gray-800 text-lg shadow-sm uppercase">
                    {region.slug ? region.slug.substring(0, 2) : '?'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">
                      {region.country_name || "Sin Nombre"}
                    </h2>
                    <Link href={`/${region.slug}`} target="_blank" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
                      odontodrive.com/{region.slug}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(region)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                    title="Eliminar región"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleSave(region)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-accent text-white font-bold text-sm rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={region.slug || ''} 
                      onChange={(e) => handleChange(regionIndex, 'slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                      placeholder="ej: mx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">País</label>
                    <input 
                      type="text" 
                      value={region.country_name || ''} 
                      onChange={(e) => handleChange(regionIndex, 'country_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                      placeholder="ej: México"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Símbolo Moneda</label>
                    <input 
                      type="text" 
                      value={region.currency_symbol || ''} 
                      onChange={(e) => handleChange(regionIndex, 'currency_symbol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                      placeholder="ej: $"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sufijo Precio</label>
                    <input 
                      type="text" 
                      value={region.price_suffix || ''} 
                      onChange={(e) => handleChange(regionIndex, 'price_suffix', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                      placeholder="ej: /mes"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">SEO Title</label>
                    <input 
                      type="text" 
                      value={region.seo_title || ''} 
                      onChange={(e) => handleChange(regionIndex, 'seo_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">SEO Description</label>
                    <input 
                      type="text" 
                      value={region.seo_description || ''} 
                      onChange={(e) => handleChange(regionIndex, 'seo_description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Planes de Suscripción</h3>
                    <button 
                      onClick={() => handleAddPlan(regionIndex)}
                      className="text-xs font-bold text-accent hover:text-cyan-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Añadir Plan
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {(region.planes || []).map((p: any, planIndex: number) => (
                      <div key={planIndex} className="min-w-[280px] flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 relative group">
                        <button 
                          onClick={() => handleRemovePlan(regionIndex, planIndex)}
                          className="absolute top-2 right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex justify-between items-center mb-3">
                          <input 
                            type="text"
                            value={p.name}
                            onChange={(e) => handlePlanChange(regionIndex, planIndex, 'name', e.target.value)}
                            className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent outline-none px-1 w-3/4"
                            placeholder="Nombre del plan"
                          />
                        </div>
                        
                        <label className="flex items-center gap-2 mb-3 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={p.isPopular || false}
                            onChange={(e) => handlePlanChange(regionIndex, planIndex, 'isPopular', e.target.checked)}
                            className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent"
                          />
                          <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">Recomendado</span>
                        </label>
                        
                        <label className="block text-xs font-bold text-gray-700 mb-1 mt-2">Precio</label>
                        <input 
                          type="text" 
                          value={p.price} 
                          onChange={(e) => handlePlanChange(regionIndex, planIndex, 'price', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-accent outline-none bg-white"
                        />

                        <label className="block text-xs font-bold text-gray-700 mb-1 mt-3">Almacenamiento (ej. 5 GB)</label>
                        <input 
                          type="text" 
                          value={p.storage} 
                          onChange={(e) => handlePlanChange(regionIndex, planIndex, 'storage', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-accent outline-none bg-white"
                        />

                        {region.slug === 'interno' && (
                          <>
                            <label className="block text-xs font-bold text-gray-700 mb-1 mt-3">Límite de Pacientes (0 = Ilimitado)</label>
                            <input 
                              type="number" 
                              value={p.max_patients ?? ''} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handlePlanChange(regionIndex, planIndex, 'max_patients', isNaN(val) ? undefined : val);
                              }}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-accent outline-none bg-white"
                              placeholder="Ej. 150"
                            />
                          </>
                        )}

                        <label className="block text-xs font-bold text-gray-700 mb-1 mt-3">Características (separadas por coma)</label>
                        <textarea 
                          value={(p.features || []).join(', ')} 
                          onChange={(e) => handlePlanChange(regionIndex, planIndex, 'features', e.target.value.split(',').map((s:string)=>s.trim()).filter((s:string)=>s))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-accent outline-none bg-white min-h-[80px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
