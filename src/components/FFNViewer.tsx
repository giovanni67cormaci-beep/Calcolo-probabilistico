/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Token, FFNData } from "../types";
import { HelpCircle, RefreshCw, Layers } from "lucide-react";

interface FFNViewerProps {
  selectedToken: Token | undefined;
  selectedTokenIndex: number;
  ffn: FFNData;
}

export default function FFNViewer({ selectedToken, selectedTokenIndex, ffn }: FFNViewerProps) {
  if (!selectedToken || !ffn.inputs[selectedTokenIndex]) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center h-40">
        <p className="text-slate-500 text-xs font-mono">Seleziona un token per visualizzare i valori del suo livello feed-forward.</p>
      </div>
    );
  }

  const inputVec = ffn.inputs[selectedTokenIndex];
  const fc1Vec = ffn.fc1[selectedTokenIndex];
  const actVec = ffn.activated[selectedTokenIndex];
  const outputVec = ffn.outputs[selectedTokenIndex];

  // Helper for magnitude cell styling
  const renderValueCell = (val: number, label: string) => {
    const isPositive = val >= 0;
    const opacity = Math.min(1, Math.abs(val) * 1.5);
    const bgClass = isPositive
      ? `rgba(59, 130, 246, ${opacity * 0.2})` // blue
      : `rgba(239, 68, 68, ${opacity * 0.2})`; // red
    const borderClass = isPositive
      ? "border-blue-500/30"
      : "border-rose-500/30";
    const textClass = isPositive
      ? "text-blue-400"
      : "text-rose-400";

    return (
      <div
        className={`flex flex-col items-center justify-center rounded border p-1 font-mono text-[10px] font-semibold transition-colors ${borderClass}`}
        style={{ backgroundColor: bgClass }}
        title={`${label}: ${val.toFixed(4)}`}
      >
        <span className={textClass}>
          {val >= 0 ? "+" : ""}
          {val.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
            04
          </span>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Rete Feed-Forward (FFN)</h3>
            <p className="text-[10px] text-slate-400">Fase 4: Elabora i token in modo indipendente utilizzando la proiezione di espansione e le attivazioni GELU.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          <span>Blocco MLP (d_ff=12)</span>
          <HelpCircle className="h-3 w-3 text-slate-500 cursor-help" title="La rete FFN applica una mappatura non lineare a ciascun vettore di token individualmente per estrarre relazioni semantiche complesse." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* PIPELINE CARDS */}
        <div className="lg:col-span-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Input Vector */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Input FFN (Xin)</span>
                <span className="text-[10px] text-slate-500 font-mono">Dim 8</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {inputVec.map((val, i) => (
                  <React.Fragment key={i}>
                    {renderValueCell(val, `In_${i}`)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Expansion Linear Projection */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Proiezione (X * W1 + b1)</span>
                <span className="text-[10px] text-slate-500 font-mono">Dim 12</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {fc1Vec.map((val, i) => (
                  <React.Fragment key={i}>
                    {renderValueCell(val, `FC1_${i}`)}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* GELU Activation output */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">Attivazione GELU (H)</span>
                <span className="text-[10px] text-slate-500 font-mono">Non Lineare</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {actVec.map((val, i) => (
                  <React.Fragment key={i}>
                    {renderValueCell(val, `Act_${i}`)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Final Output vector */}
            <div className="bg-blue-500/5 p-3.5 rounded border border-blue-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">Output FFN + Connessione Residua</span>
                <span className="text-[10px] text-blue-600 font-mono">Dim 8</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {outputVec.map((val, i) => (
                  <React.Fragment key={i}>
                    {renderValueCell(val, `Out_${i}`)}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ACTIVATION CURVE EXPLANATION */}
        <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-5 pt-4 lg:pt-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
              <Layers className="h-3 w-3 text-blue-500" />
              Curva di Attivazione GELU
            </span>

            {/* SVG Plot for GELU */}
            <div className="bg-slate-950 border border-slate-800 rounded p-3 flex items-center justify-center relative">
              <svg width="150" height="90" viewBox="0 0 150 90" className="text-blue-500 overflow-visible">
                {/* Axes */}
                <line x1="10" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="75" y1="10" x2="75" y2="85" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                
                {/* Reference line y=x */}
                <line x1="15" y1="80" x2="135" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.2" />

                {/* GELU Curve */}
                <path
                  d="M 15 70 Q 60 70 75 45 T 135 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                {/* Labels */}
                <text x="135" y="82" fill="currentColor" fontSize="8" className="font-mono text-[8px] fill-slate-500">x</text>
                <text x="79" y="15" fill="currentColor" fontSize="8" className="font-mono text-[8px] fill-slate-500">f(x)</text>
              </svg>
            </div>

            <div className="mt-2 text-center">
              <span className="font-mono text-[9px] text-slate-500">
                GELU(x) ≈ 0.5x * (1 + tanh(sqrt(2/π)*(x + 0.0447x³)))
              </span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
            <p>
              <strong className="text-slate-300 font-mono uppercase tracking-wider text-[10px]">Meccanismo:</strong> L'attenzione canalizza la struttura relazionale tra le colonne della sequenza. La FFN proietta queste caratteristiche a una dimensione pari a 12 e applica attivazioni <strong>GELU</strong> non lineari prima di sommare le connessioni residue per tornare a 8 canali.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
