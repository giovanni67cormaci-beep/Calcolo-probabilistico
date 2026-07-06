/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { PredictionCandidate } from "../types";
import { Sliders, HelpCircle, Play, Pause, Sparkles, PlusCircle } from "lucide-react";

interface OutputViewerProps {
  candidates: PredictionCandidate[];
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  onAppendWord: (word: string) => void;
  isAutoGenerating: boolean;
  onToggleAutoGenerate: () => void;
}

export default function OutputViewer({
  candidates,
  temperature,
  onTemperatureChange,
  onAppendWord,
  isAutoGenerating,
  onToggleAutoGenerate,
}: OutputViewerProps) {
  if (candidates.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center h-40">
        <p className="text-slate-500 text-xs font-mono">Scrivi del testo per ottenere le predizioni del prossimo token.</p>
      </div>
    );
  }

  // Descriptions of what temperature does at different levels
  const getTempDescription = (t: number) => {
    if (t < 0.3) return "Sicuro / Greedy (Solo la parola principale domina)";
    if (t < 0.8) return "Standard (Bilanciamento coerente e vario)";
    if (t < 1.3) return "Creativo (Output più diversi)";
    return "Caotico / Casuale (Alta entropia, distribuzione piatta)";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
            05
          </span>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Predizione Prossimo Token & Softmax</h3>
            <p className="text-[10px] text-slate-400">Fase 5: Scala i logit tramite la Temperatura per produrre la distribuzione di probabilità finale.</p>
          </div>
        </div>
        
        {/* Auto Generate Button */}
        <button
          id="btn-auto-generate"
          onClick={onToggleAutoGenerate}
          className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider shadow-xs transition-colors cursor-pointer border ${
            isAutoGenerating
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
              : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {isAutoGenerating ? (
            <>
              <Pause className="h-3 w-3" />
              Sospendi Auto
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              Genera Auto
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* CANDIDATES CHART */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Parole Candidate Principali</span>
            <span className="text-[10px] text-slate-500 font-mono">Probabilità Softmax (P)</span>
          </div>

          <div className="space-y-1.5">
            {candidates.map((cand, idx) => {
              const probPercent = (cand.probability * 100).toFixed(1);
              
              return (
                <div
                  key={idx}
                  id={`candidate-row-${idx}`}
                  className="group relative flex items-center justify-between p-2 rounded border border-slate-850 bg-slate-950 hover:bg-slate-900/60 transition-colors"
                >
                  {/* Probability background bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/5 pointer-events-none transition-all duration-300 rounded-l"
                    style={{ width: `${cand.probability * 100}%` }}
                  />

                  <div className="flex items-center gap-2.5 z-10 pl-1">
                    <span className="font-mono text-[9px] text-slate-500 font-bold w-3">#{idx + 1}</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {cand.word}
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      Logit: {cand.logit.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 z-10 pr-1">
                    <span className="font-mono text-xs font-bold text-rose-400 mr-1.5">
                      {probPercent}%
                    </span>
                    <button
                      id={`btn-append-word-${idx}`}
                      onClick={() => onAppendWord(cand.word)}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                      title="Append word to prompt"
                    >
                      <PlusCircle className="h-3 w-3" />
                      Aggiungi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TEMPERATURE SLIDER & CONTROLS */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-5 pt-4 lg:pt-0 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-rose-500" />
                Controlli di Temperatura
              </span>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                T = {temperature.toFixed(2)}
              </span>
            </div>

            {/* SLIDER */}
            <div className="space-y-1.5">
              <input
                id="temperature-slider"
                type="range"
                min="0.10"
                max="2.00"
                step="0.05"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1 rounded bg-slate-950 border border-slate-800"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                <span>0.1 Coerente</span>
                <span>1.0 Standard</span>
                <span>2.0 Caotico</span>
              </div>
            </div>

            {/* Current Temp Status */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] font-mono">
              <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">Modalità:</span>
              <span className="text-rose-400 font-bold">
                {getTempDescription(temperature)}
              </span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
            <p>
              <strong className="text-slate-300 font-mono uppercase tracking-wider text-[10px]">La Matematica della Softmax:</strong> Mappiamo i valori dei logit in probabilità reali scalando in base alle Temperature attive.
            </p>
            <p className="font-mono text-[9px] text-center text-slate-400 py-1 bg-slate-900 rounded border border-slate-850">
              P(w_i) = exp(Logit_i / T) / Σ_j exp(Logit_j / T)
            </p>
            <p>
              La divisione per la <strong>Temperatura (T)</strong> scala i valori. Un valore piccolo di T amplifica le differenze (rendendo estremamente probabile il token più forte), mentre un valore elevato di T appiattisce i picchi per stimolare la creatività.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
