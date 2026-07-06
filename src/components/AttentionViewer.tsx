/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Token, AttentionHeadData } from "../types";
import { HelpCircle, Lock, Cpu, Eye, Network } from "lucide-react";

interface AttentionViewerProps {
  tokens: Token[];
  heads: AttentionHeadData[];
  selectedHeadIndex: number;
  selectedTokenIndex: number;
  onSelectHead: (idx: number) => void;
  onSelectToken: (idx: number) => void;
}

export default function AttentionViewer({
  tokens,
  heads,
  selectedHeadIndex,
  selectedTokenIndex,
  onSelectHead,
  onSelectToken,
}: AttentionViewerProps) {
  if (tokens.length === 0 || heads.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center h-40">
        <p className="text-slate-500 text-xs font-mono">Scrivi del testo per calcolare i pesi dell'attenzione.</p>
      </div>
    );
  }

  const activeHead = heads[selectedHeadIndex] || heads[0];
  const activeToken = tokens[selectedTokenIndex] || tokens[0];

  // Colors for each head
  const headColors = [
    { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", activeBg: "bg-amber-600 text-white" },
    { text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10", activeBg: "bg-cyan-600 text-white" },
    { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", activeBg: "bg-rose-600 text-white" },
    { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", activeBg: "bg-emerald-600 text-white" },
  ];

  const currentHeadColor = headColors[selectedHeadIndex % headColors.length];

  // Numerical display helper
  const numStyle = (val: number) => {
    return (
      <span className="font-mono text-xs font-semibold">
        {val >= 0 ? "+" : ""}
        {val.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
            03
          </span>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Auto-Attenzione Multi-Testa</h3>
            <p className="text-[10px] text-slate-400">Fase 3: Calcola la rilevanza tra i diversi token nella sequenza di testo inserita.</p>
          </div>
        </div>
        
        {/* Head Selector Tabs */}
        <div className="flex flex-wrap gap-1">
          {heads.map((head, idx) => {
            const isSelected = idx === selectedHeadIndex;
            const hColor = headColors[idx % headColors.length];
            return (
              <button
                key={idx}
                id={`attention-head-tab-${idx}`}
                onClick={() => onSelectHead(idx)}
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-all border ${
                  isSelected
                    ? `${hColor.activeBg} border-transparent shadow-sm font-bold`
                    : `bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white cursor-pointer`
                }`}
              >
                Testa {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* HEATMAP COLUMN */}
        <div className="xl:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Eye className="h-3 w-3 text-slate-500" />
                Mappa di Attenzione (Le Query sulle righe guardano le Key sulle colonne)
              </span>
              <span className="text-[10px] text-amber-500 font-mono">Maschera Causale Attiva</span>
            </div>

            {/* HEATMAP GRID */}
            <div className="border border-slate-800 rounded p-3 bg-slate-950 overflow-auto max-w-full">
              <div className="min-w-[340px]">
                {/* Columns headers (Key tokens) */}
                <div className="grid grid-cols-13 items-center text-center mb-1">
                  <div className="col-span-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-left pl-1 font-mono">Query / Key</div>
                  {tokens.map((tok, cIdx) => (
                    <div
                      key={cIdx}
                      className="col-span-1 text-[9px] font-mono font-bold text-slate-400 truncate"
                      title={tok.text}
                    >
                      {tok.text}
                    </div>
                  ))}
                  {/* Fill in the rest of the 10 cols if tokens are fewer */}
                  {tokens.length < 10 && (
                    <div className={`col-span-${10 - tokens.length}`} />
                  )}
                </div>

                {/* Rows (Query tokens) */}
                <div className="space-y-1">
                  {tokens.map((qTok, rIdx) => {
                    const isSelectedQuery = rIdx === selectedTokenIndex;
                    return (
                      <div key={rIdx} className="grid grid-cols-13 items-center">
                        {/* Row header (Query token) */}
                        <button
                          onClick={() => onSelectToken(rIdx)}
                          className={`col-span-3 text-left px-1.5 py-0.5 rounded text-xs truncate font-mono border transition-all ${
                            isSelectedQuery
                              ? `${qTok.color.bg} ${qTok.color.text} ${qTok.color.border} font-bold shadow-xs`
                              : "bg-transparent text-slate-400 border-transparent hover:bg-slate-900"
                          }`}
                        >
                          {qTok.text}
                        </button>

                        {/* Attention cells */}
                        {tokens.map((kTok, cIdx) => {
                          const weight = activeHead.attentionWeights[rIdx]?.[cIdx] ?? 0;
                          const isMasked = cIdx > rIdx;
                          const isCellSelected = isSelectedQuery && cIdx <= rIdx;

                          // Heatmap styling based on weight strength
                          const cellBg = isMasked
                            ? "bg-slate-900/40"
                            : `rgba(217, 119, 6, ${Math.max(0.02, weight * 0.95)})`; // amber-600 scale

                          return (
                            <div
                              key={cIdx}
                              onClick={() => {
                                if (!isMasked) {
                                  onSelectToken(rIdx);
                                }
                              }}
                              style={{ backgroundColor: !isMasked ? cellBg : undefined }}
                              className={`col-span-1 aspect-square rounded flex items-center justify-center border transition-all cursor-pointer relative ${
                                isMasked
                                  ? "border-slate-900/60 cursor-not-allowed"
                                  : isCellSelected
                                  ? "border-amber-500 shadow-md scale-105 z-10"
                                  : "border-slate-800/40 hover:border-amber-400"
                              }`}
                              title={
                                isMasked
                                  ? `Maschera Causale: "${qTok.text}" non può fare attenzione al token futuro "${kTok.text}"`
                                  : `Peso di Attenzione: ${(weight * 100).toFixed(1)}%`
                              }
                            >
                              {isMasked ? (
                                <Lock className="h-2 w-2 text-slate-800" />
                              ) : (
                                <span className={`text-[9px] font-mono font-bold ${weight > 0.45 ? "text-white" : "text-slate-300"}`}>
                                  {weight > 0.05 ? (weight * 100).toFixed(0) : "."}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
            <p className="flex items-start gap-1.5 font-sans">
              <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-300 font-mono uppercase tracking-wider text-[10px]">Mascheramento Causale:</strong> Nota come i token futuri siano bloccati. Nella generazione autoregressiva del linguaggio, applichiamo una maschera triangolare causale affinché la sequenza di addestramento o esecuzione rimanga matematicamente coerente.
              </span>
            </p>
          </div>
        </div>

        {/* DETAILS COLUMN (Vector Multiplications) */}
        <div className="xl:col-span-6 border-t xl:border-t-0 xl:border-l border-slate-800 xl:pl-5 pt-4 xl:pt-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-slate-500" />
              Dettaglio Matematico: Token "{activeToken.text}"
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
              Output Testa {selectedHeadIndex + 1} (dk=4)
            </span>
          </div>

          <div className="space-y-3">
            {/* Query Vector */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex justify-between uppercase">
                <span>Vettore Query (q per "{activeToken.text}")</span>
                <span className="text-slate-600">X_i * W_Q</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {activeHead.queries[selectedTokenIndex]?.map((val, i) => (
                  <div key={i} className="bg-slate-900 p-1 rounded text-center border border-slate-800/80">
                    {numStyle(val)}
                  </div>
                ))}
              </div>
            </div>

            {/* Keys & Multiplication */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex justify-between uppercase">
                <span>Attenzione verso le Key disponibili (k)</span>
                <span className="text-slate-600">Softmax(q * kᵀ / √d_k)</span>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {tokens.map((tok, kIdx) => {
                  if (kIdx > selectedTokenIndex) return null; // Masked out
                  const keyVector = activeHead.keys[kIdx];
                  const rawScore = activeHead.rawScores[selectedTokenIndex]?.[kIdx] || 0;
                  const weight = activeHead.attentionWeights[selectedTokenIndex]?.[kIdx] || 0;

                  return (
                    <div
                      key={kIdx}
                      className={`grid grid-cols-12 items-center text-[10px] gap-1 p-1 rounded transition-colors ${
                        kIdx === selectedTokenIndex
                          ? "bg-amber-500/10 border border-amber-500/20"
                          : "hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      {/* Token Label */}
                      <span className="col-span-3 font-mono text-slate-300 truncate">
                        "{tok.text}"
                      </span>

                      {/* Key Vector preview */}
                      <span className="col-span-4 font-mono text-[9px] text-slate-500 truncate">
                        [{keyVector?.map(v => v.toFixed(1)).join(", ")}]
                      </span>

                      {/* Raw Score */}
                      <span className="col-span-2 text-center text-slate-500 font-mono">
                        {rawScore.toFixed(1)}
                      </span>

                      {/* Attention Weight % */}
                      <span className="col-span-3 text-right text-amber-400 font-bold font-mono">
                        {(weight * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weighted Value Summation */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex justify-between uppercase">
                <span>Vettore di Output della Testa di Attenzione</span>
                <span className="text-slate-600">Σ(weight * v)</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {activeHead.headOutputs[selectedTokenIndex]?.map((val, i) => (
                  <div key={i} className="bg-amber-500/10 p-1 rounded text-center border border-amber-500/20">
                    <span className="font-mono text-xs font-semibold text-amber-400">
                      {val >= 0 ? "+" : ""}
                      {val.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
