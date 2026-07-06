/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Token } from "../types";
import { HelpCircle, Terminal, HelpCircle as HelpIcon, Sparkles } from "lucide-react";

interface TokenViewerProps {
  inputText: string;
  onInputChange: (val: string) => void;
  tokens: Token[];
  selectedTokenIndex: number;
  onSelectToken: (idx: number) => void;
}

const PRESETS = [
  "La volpe marrone veloce salta sopra il cane pigro",
  "L'intelligenza artificiale impara pattern nel testo",
  "L'attenzione è tutto ciò che serve per il deep learning",
  "La scienza dei dati è una potente rete neurale",
];

export default function TokenViewer({
  inputText,
  onInputChange,
  tokens,
  selectedTokenIndex,
  onSelectToken,
}: TokenViewerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
            01
          </span>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Input & Tokenizzazione</h3>
            <p className="text-[10px] text-slate-400">Converte stringhe di testo grezzo in interi discreti (Token ID).</p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Preset:</span>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-btn-${idx}`}
                onClick={() => onInputChange(preset)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
              >
                Preset {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INPUT FIELD */}
      <div className="relative">
        <textarea
          id="transformer-input-text"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Scrivi una frase qui per vederla calcolata in tempo reale..."
          className="w-full h-14 min-h-14 px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
          maxLength={120}
        />
        <div className="absolute right-2.5 bottom-2 text-[9px] text-slate-500 font-mono">
          {inputText.length} / 120 caratteri
        </div>
      </div>

      {/* TOKENS GRID */}
      <div>
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-slate-500" />
            Token Attivi (Clicca su un token per esaminare le rappresentazioni)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Lunghezza: {tokens.length}</span>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-slate-800 rounded">
            <p className="text-slate-500 text-xs font-mono">Inserisci del testo nella casella sopra.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/40 rounded border border-slate-800/80">
            {tokens.map((tok, idx) => {
              const isSelected = idx === selectedTokenIndex;
              return (
                <button
                  key={idx}
                  id={`token-badge-${idx}`}
                  onClick={() => onSelectToken(idx)}
                  className={`group flex flex-col items-center px-2.5 py-1 rounded border transition-all relative ${
                    tok.color.bg
                  } ${tok.color.text} ${tok.color.border} ${tok.color.glow} ${
                    isSelected
                      ? "ring-1 ring-blue-500 ring-offset-1 ring-offset-slate-950 scale-105 font-bold"
                      : "opacity-80 hover:opacity-100 hover:scale-[1.01] cursor-pointer"
                  }`}
                >
                  <span className="text-xs font-semibold">{tok.text}</span>
                  <span className="text-[9px] font-mono opacity-70 font-medium">ID {tok.id}</span>
                  
                  {/* Hover indicator of positional sequence */}
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-1 py-0.2 rounded border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-mono">
                    Pos {idx}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
