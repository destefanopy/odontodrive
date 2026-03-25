"use client";

import React from "react";
import { HardDrive, Crown, AlertTriangle } from "lucide-react";

interface StorageProgressBarProps {
  usedBytes: number;
  planLimitBytes: number;
  planName: string;
}

export default function StorageProgressBar({ usedBytes, planLimitBytes, planName }: StorageProgressBarProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentage = Math.min(100, Math.round((usedBytes / planLimitBytes) * 100));
  
  // Colores dinámicos
  let progressColor = "bg-accent";
  if (percentage > 85) progressColor = "bg-red-500";
  else if (percentage > 70) progressColor = "bg-orange-400";
  
  const isDanger = percentage > 85;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-gray-700" />
          <span className="font-bold text-gray-900 text-sm">Almacenamiento</span>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase">
          {planName === 'premium' ? <Crown className="w-3 h-3 text-amber-500" /> : null}
          {planName}
        </div>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ${progressColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center text-xs font-medium text-gray-600 mt-2">
        <span>{formatBytes(usedBytes)} usados</span>
        <span>{formatBytes(planLimitBytes)}</span>
      </div>

      {isDanger && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-start gap-2 text-xs font-semibold animate-pulse">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Estás al límite de tu capacidad. Sube a un plan superior para evitar bloqueos.</p>
        </div>
      )}
    </div>
  );
}
