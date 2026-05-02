import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RefreshCcw, Check } from 'lucide-react';

interface LienzoFirmaProps {
  onSignatureSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
}

export function LienzoFirma({ onSignatureSave, onCancel }: LienzoFirmaProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setHasSignature(false);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setHasSignature(true);
    } else {
      setHasSignature(false);
    }
  };

  const save = () => {
    if (!agreed) {
      alert("Debes aceptar los términos y condiciones antes de continuar.");
      return;
    }
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Debes proveer una firma antes de continuar.");
      return;
    }
    
    try {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSignatureSave(dataUrl);
    } catch (err) {
      alert("Error capturando la firma: " + err);
    }
  };

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="font-medium leading-relaxed">
            He leído y comprendido los riesgos del procedimiento. Doy mi consentimiento libre y voluntario para que el profesional proceda con el tratamiento, y reconozco que esta firma digital tiene plena validez.
          </span>
        </label>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white relative overflow-hidden">
        <div className="absolute top-2 left-2 text-xs font-bold text-gray-400 pointer-events-none uppercase tracking-widest">
          Firma del Paciente
        </div>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 sm:h-64 cursor-crosshair'
          }}
          onEnd={handleEnd}
          penColor="#111827"
          backgroundColor="transparent"
        />
        {hasSignature && (
          <button 
            onClick={clear}
            className="absolute bottom-2 left-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            title="Borrar firma"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={save}
          className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Confirmar y Guardar
        </button>
      </div>
    </div>
  );
}
