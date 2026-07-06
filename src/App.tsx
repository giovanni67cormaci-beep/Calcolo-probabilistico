/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import TokenViewer from "./components/TokenViewer";
import EmbeddingViewer from "./components/EmbeddingViewer";
import AttentionViewer from "./components/AttentionViewer";
import FFNViewer from "./components/FFNViewer";
import OutputViewer from "./components/OutputViewer";
import { computeTransformerState, VOCABULARY } from "./utils/transformerMath";
import { Sparkles, ArrowRight, BookOpen, Layers, Network, BrainCircuit, Github, Cpu, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [inputText, setInputText] = useState("L'attenzione è tutto ciò che serve");
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [selectedHeadIndex, setSelectedHeadIndex] = useState(0);
  const [temperature, setTemperature] = useState(0.7);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Re-compute the transformer layers state whenever input, selection or temperature changes
  const transformerState = useMemo(() => {
    return computeTransformerState(inputText, selectedTokenIndex, selectedHeadIndex, temperature);
  }, [inputText, selectedTokenIndex, selectedHeadIndex, temperature]);

  const { tokens, heads, ffn, candidates } = transformerState;

  // Track auto-generator interval
  const generatorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (generatorIntervalRef.current) clearInterval(generatorIntervalRef.current);
    };
  }, []);

  // Handle auto generation of words
  useEffect(() => {
    if (isAutoGenerating) {
      generatorIntervalRef.current = setInterval(() => {
        // Stop if we have generated too many tokens (context window threshold)
        if (tokens.length >= 14) {
          setIsAutoGenerating(false);
          alert("Lunghezza massima della sequenza per la visualizzazione raggiunta! Modifica il testo per ricominciare.");
          return;
        }

        if (candidates.length > 0) {
          // Weighted random sampling based on candidate probabilities
          const r = Math.random();
          let cumulative = 0;
          let sampledWord = candidates[0].word;

          for (const cand of candidates) {
            cumulative += cand.probability;
            if (r <= cumulative) {
              sampledWord = cand.word;
              break;
            }
          }

          // Append to text and select the new token
          setInputText((prev) => {
            const nextText = `${prev.trim()} ${sampledWord}`;
            // Let the state update finish, then focus on the new token
            setSelectedTokenIndex(tokens.length);
            return nextText;
          });
        } else {
          setIsAutoGenerating(false);
        }
      }, 1500);
    } else {
      if (generatorIntervalRef.current) {
        clearInterval(generatorIntervalRef.current);
        generatorIntervalRef.current = null;
      }
    }

    return () => {
      if (generatorIntervalRef.current) clearInterval(generatorIntervalRef.current);
    };
  }, [isAutoGenerating, candidates, tokens.length]);

  // Handle manual appending of candidates
  const handleAppendWord = (word: string) => {
    if (tokens.length >= 14) {
      alert("Lunghezza massima della sequenza per la visualizzazione raggiunta! Modifica il testo per accorciarlo.");
      return;
    }
    setInputText((prev) => `${prev.trim()} ${word}`);
    setSelectedTokenIndex(tokens.length);
  };

  const activeToken = tokens[selectedTokenIndex] || tokens[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pb-16 selection:bg-blue-500/30">
      
      {/* HEADER SECTION - High Density Style */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded shadow-lg shadow-blue-500/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Transformer Explainer <span className="text-slate-500 font-normal text-xs font-mono">v2.4.0</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] md:text-xs font-mono uppercase tracking-widest">
          <div className="flex flex-col text-right md:text-left">
            <span className="text-slate-500">Modello</span>
            <span className="text-blue-400">GPT-2 Small</span>
          </div>
          <div className="flex flex-col text-right md:text-left">
            <span className="text-slate-500">Dimensione</span>
            <span className="text-blue-400">d_model=8</span>
          </div>
          <div className="flex flex-col text-right md:text-left">
            <span className="text-slate-500">Teste</span>
            <span className="text-blue-400">04 / 04</span>
          </div>
          <div className="hidden md:flex flex-col">
            <button
              id="btn-toggle-info"
              onClick={() => setShowIntro((p) => !p)}
              className="text-slate-400 hover:text-white border border-slate-800 px-2 py-0.5 rounded bg-slate-900/50 transition-colors cursor-pointer"
            >
              {showIntro ? "Nascondi Intro" : "Mostra Intro"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-4 space-y-4 relative">
        
        {/* EDUCATIONAL EXPLANATION - Styled exactly for High Density slate look */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden"
            >
              {/* Closing Button */}
              <button
                id="btn-close-intro"
                onClick={() => setShowIntro(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-slate-500 hover:text-slate-300 transition-colors hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Sparkles className="h-3 w-3" />
                    Come Funzionano i Transformer
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Interagisci con un Modello Transformer dal vivo, 100% Locale
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    Benvenuto nel <strong>Transformer Explainer</strong>. Questo simulatore didattico implementa la reale architettura matematica di un modello GPT di sola decodifica (decoder-only). 
                    A differenza delle spiegazioni a "scatola nera", qui ogni numero viene calcolato dal vivo. Scrivi un testo personalizzato, clicca su qualsiasi token, osserva le teste di attenzione calcolare i pesi semantici, visualizza i livelli di attivazione feed-forward e regola la temperatura per modificare le probabilità di generazione delle parole.
                  </p>
                </div>
                <div className="md:col-span-4 bg-blue-500/5 p-4 rounded-lg border border-slate-800/80 space-y-2 text-center md:text-left">
                  <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase font-mono">Pipeline dell'Architettura Visiva</span>
                  <div className="flex justify-center md:justify-start items-center gap-2 text-xs font-mono font-bold text-slate-400">
                    <span className="text-blue-400">Input</span>
                    <ArrowRight className="h-3 w-3 text-slate-600" />
                    <span className="text-amber-400">Attenzione</span>
                    <ArrowRight className="h-3 w-3 text-slate-600" />
                    <span className="text-emerald-400">MLP</span>
                    <ArrowRight className="h-3 w-3 text-slate-600" />
                    <span className="text-rose-400">Predizione</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIPELINE CONTAINER */}
        <div className="space-y-4">
          
          {/* STEP 1: TOKENIZATION & INPUT */}
          <TokenViewer
            inputText={inputText}
            onInputChange={(val) => {
              setInputText(val);
              // Reset focus to first token when input text changes completely
              setSelectedTokenIndex(0);
            }}
            tokens={tokens}
            selectedTokenIndex={selectedTokenIndex}
            onSelectToken={setSelectedTokenIndex}
          />

          {/* STEP 2: EMBEDDING REPRESENTATIONS */}
          <EmbeddingViewer selectedToken={activeToken} />

          {/* STEP 3: ATTENTION BLOCK */}
          <AttentionViewer
            tokens={tokens}
            heads={heads}
            selectedHeadIndex={selectedHeadIndex}
            selectedTokenIndex={selectedTokenIndex}
            onSelectHead={setSelectedHeadIndex}
            onSelectToken={setSelectedTokenIndex}
          />

          {/* STEP 4: FEED FORWARD MLP BLOCK */}
          <FFNViewer
            selectedToken={activeToken}
            selectedTokenIndex={selectedTokenIndex}
            ffn={ffn}
          />

          {/* STEP 5: OUTPUT PREDICTION & SAMPLING */}
          <OutputViewer
            candidates={candidates}
            temperature={temperature}
            onTemperatureChange={setTemperature}
            onAppendWord={handleAppendWord}
            isAutoGenerating={isAutoGenerating}
            onToggleAutoGenerate={() => setIsAutoGenerating((g) => !g)}
          />

        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 mt-8 text-center text-[10px] text-slate-500 font-mono space-y-1 border-t border-slate-800 pt-6">
        <p>Transformer Explainer — Tema Dashboard ad Alta Densità</p>
        <p>Stile Tipografico: Outfit & JetBrains Mono</p>
      </footer>

    </div>
  );
}
