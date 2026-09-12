import React, { useRef, useEffect, useState } from 'react';
import { renderCertificateCanvas } from '../utils/pdfGenerator';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function CertificateCanvas({ certData, className = '' }) {
  const canvasRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (canvasRef.current && certData) {
      setIsRendered(false);
      renderCertificateCanvas(canvasRef.current, certData)
        .then(() => setIsRendered(true))
        .catch(err => console.error('Canvas render error:', err));
    }
  }, [certData]);

  return (
    <div className={`relative group ${className}`}>
      {/* Container with crisp border and subtle gold shadow */}
      <div className={`relative rounded-2xl overflow-hidden bg-white shadow-soft-lg border border-slate-200 transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 flex items-center justify-center bg-black/90 p-4 border-none shadow-none rounded-none' : ''
      }`}>
        <canvas
          ref={canvasRef}
          className={`w-full h-auto object-contain block max-h-[75vh] ${isExpanded ? 'max-h-[90vh] rounded-lg' : ''}`}
          style={{ aspectRatio: '2380 / 1684' }}
        />

        {/* Fullscreen Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-slate-700 hover:text-brand-purple-600 hover:bg-white border border-slate-200 backdrop-blur-md shadow-md transition-all group-hover:opacity-100 opacity-90"
          title={isExpanded ? 'Close Preview' : 'Fullscreen Preview'}
        >
          {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {!isRendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
            <div className="text-sm font-semibold text-brand-purple-700 animate-pulse">
              Rendering Certificate Preview...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
