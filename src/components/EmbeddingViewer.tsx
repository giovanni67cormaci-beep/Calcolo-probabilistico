/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Token } from "../types";
import { HelpCircle, Plus, Equal } from "lucide-react";

interface EmbeddingViewerProps {
  selectedToken: Token | undefined;
}

export default function EmbeddingViewer({ selectedToken }: EmbeddingViewerProps) {
  if (!selectedToken) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center h-40">
        <p className="text-slate-500 text-xs font-mono">Seleziona un token per visualizzare i suoi embedding.</p>
      </div>
    );
  }

  // Helper to render a numerical cell with color coding based on magnitude
  const renderCell = (val: number, label: string) => {
    const isPositive = val >= 0;
    const opacity = Math.min(1, Math.abs(val) * 1.5);
    const bgClass = isPositive
      ? `rgba(16, 185, 129, ${opacity * 0.2})` // emerald
      : `rgba(239, 68, 68, ${opacity * 0.2})`; // red
    const borderClass = isPositive
      ? "border-emerald-500/30"
      : "border-rose-500/30";
    const textClass = isPositive
      ? "text-emerald-400"
      : "text-rose-400";

    return (
      <div
        className={`flex flex-col items-center justify-center rounded border p-1 transition-colors ${borderClass}`}
        style={{ backgroundColor: bgClass }}
        title={`${label}: ${val.toFixed(4)}`}
      >
        <span className={`font-mono text-xs font-semibold ${textClass}`}>
          {val >= 0 ? "+" : ""}
          {val.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
            02
          </span>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Livello di Embedding</h3>
            <p className="text-[10px] text-slate-400">Fase 2: Mappa i token discreti in vettori continui (embedding).</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          <span>Dimensione (d_model=8)</span>
          <HelpCircle className="h-3 w-3 text-slate-500 cursor-help" title="Le rappresentazioni di input sono vettori a 8 dimensioni che combinano il significato lessicale e la posizione relativa nella sequenza." />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Selezionato:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${selectedToken.color.bg} ${selectedToken.color.text} ${selectedToken.color.border}`}>
            "{selectedToken.text}"
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            ID: <span className="font-semibold text-slate-300">{selectedToken.id}</span>
          </span>
        </div>
      </div>

      {/* Grid of the three vectors interacting */}
      <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-2 bg-slate-950 p-3 rounded border border-slate-800/80">
        
        {/* Token Embedding */}
        <div className="lg:col-span-2">
          <div className="mb-1.5 flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Embedding Token (WE)</span>
            <span className="text-[9px] text-slate-600 font-mono">Semantico</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {selectedToken.embedding.map((val, idx) => (
              <React.Fragment key={idx}>
                {renderCell(val, `WE_${idx}`)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Plus Symbol */}
        <div className="flex justify-center text-slate-600 lg:col-span-1 py-1 lg:py-0">
          <Plus className="h-4 w-4" />
        </div>

        {/* Positional Encoding */}
        <div className="lg:col-span-2">
          <div className="mb-1.5 flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Codifica Posizionale (PE)</span>
            <span className="text-[9px] text-slate-600 font-mono">Sinusoide</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {selectedToken.positional.map((val, idx) => (
              <React.Fragment key={idx}>
                {renderCell(val, `PE_${idx}`)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Equals Symbol */}
        <div className="flex justify-center text-slate-600 lg:col-span-1 py-1 lg:py-0">
          <Equal className="h-4 w-4" />
        </div>

        {/* Combined Representation */}
        <div className="lg:col-span-2">
          <div className="mb-1.5 flex justify-between items-center px-1">
            <span className="text-[10px] text-blue-400 font-mono uppercase font-bold">Input Combinato (X0)</span>
            <span className="text-[9px] text-blue-600 font-mono">Somma Vettori</span>
          </div>
          <div className="grid grid-cols-4 gap-1 border border-blue-500/20 p-1 rounded bg-blue-500/5">
            {selectedToken.combined.map((val, idx) => (
              <React.Fragment key={idx}>
                {renderCell(val, `X_${idx}`)}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
        <p>
          <strong className="text-slate-300 font-mono">Flusso di lavoro:</strong> I Token ID vengono mappati nei pesi della tabella di embedding (WE). Poiché il meccanismo di attenzione è invariante alle permutazioni, aggiungiamo un vettore di <strong>Codifica Posizionale (PE)</strong> a frequenza fissa. La somma risultante, l'<strong>Input Combinato (X0)</strong>, viene passata direttamente ai livelli di attenzione.
        </p>
      </div>
    </div>
  );
}
