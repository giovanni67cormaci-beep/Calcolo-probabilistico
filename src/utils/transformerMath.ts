/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Token, AttentionHeadData, FFNData, PredictionCandidate, TransformerState } from "../types";

export const VOCABULARY = [
  "[PAD]", "The", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "AI",
  "learns", "patterns", "in", "text", "and", "generates", "words", "Attention", "is", "all",
  "you", "need", "for", "deep", "learning", "Data", "science", "a", "powerful", "neural",
  "network", "transformer", "architecture", "model", "query", "key", "value", "weights", "matrix", "vector",
  "softmax", "feed", "forward", "layer", "tokens", "embeddings", "context", "prediction", "temperature", "prob",
  "math", "code", "makes", "intelligent", "systems", "smart", "future", "world", "human", "brain",
  "input", "output", "token", "next"
];

// Aesthetic Tailwind color pairs for tokens
const TOKEN_COLORS = [
  { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-900/60", glow: "shadow-blue-500/10" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-900/60", glow: "shadow-emerald-500/10" },
  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-900/60", glow: "shadow-violet-500/10" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-900/60", glow: "shadow-amber-500/10" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-900/60", glow: "shadow-rose-500/10" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-900/60", glow: "shadow-cyan-500/10" },
  { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-900/60", glow: "shadow-purple-500/10" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-900/60", glow: "shadow-indigo-500/10" },
];

// Simple hash function to map custom words to a stable vocabulary index
function getWordHash(word: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % range;
}

// Generate a deterministic random value based on row, col, and seed
function getDeterministicWeight(row: number, col: number, seed: number): number {
  const x = Math.sin(row * 12.9898 + col * 78.233 + seed) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // Between -1 and 1
}

// Generate a deterministic weight matrix of size [rows][cols]
function generateMatrix(rows: number, cols: number, seed: number): number[][] {
  const matrix: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(getDeterministicWeight(r, c, seed));
    }
    matrix.push(row);
  }
  return matrix;
}

// Helper to calculate dot product
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
}

// Helper to multiply vector by matrix
function vectorMatrixMultiply(vector: number[], matrix: number[][]): number[] {
  const cols = matrix[0].length;
  const result: number[] = new Array(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    for (let r = 0; r < vector.length; r++) {
      sum += vector[r] * (matrix[r][c] || 0);
    }
    result[c] = sum;
  }
  return result;
}

// Helper to apply softmax to an array
export function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(val => Math.exp(val - max));
  const sum = exps.reduce((s, v) => s + v, 0);
  return exps.map(val => (sum === 0 ? 0 : val / sum));
}

// GELU activation function
function gelu(x: number): number {
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
}

// Sinusoidal positional encoding
function getPositionalEncoding(pos: number, d_model: number): number[] {
  const encoding = new Array(d_model).fill(0);
  for (let i = 0; i < d_model; i += 2) {
    const denom = Math.pow(10000, i / d_model);
    encoding[i] = Math.sin(pos / denom);
    if (i + 1 < d_model) {
      encoding[i + 1] = Math.cos(pos / denom);
    }
  }
  return encoding;
}

// Normalize a vector (LayerNorm simplification)
function layerNorm(vector: number[]): number[] {
  const mean = vector.reduce((s, v) => s + v, 0) / vector.length;
  const variance = vector.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vector.length;
  const std = Math.sqrt(variance + 1e-5);
  return vector.map(v => (v - mean) / std);
}

// Language transition boost dictionary to mimic logical generation outputs
const TRANSITIONS: Record<string, string[]> = {
  "the": ["quick", "lazy", "transformer", "neural", "network", "data", "model", "token", "next"],
  "quick": ["brown"],
  "brown": ["fox"],
  "fox": ["jumps"],
  "jumps": ["over"],
  "over": ["the", "lazy"],
  "lazy": ["dog"],
  "dog": ["and", "is"],
  "ai": ["is", "learns", "generates", "systems"],
  "attention": ["is", "mechanism", "weights", "layer"],
  "is": ["a", "all", "powerful", "intelligent", "transforming", "deep"],
  "neural": ["network", "networks", "systems"],
  "network": ["learns", "generates", "is", "models"],
  "deep": ["learning"],
  "learning": ["is", "generates", "models"],
  "data": ["science"],
  "science": ["is", "and", "learns"],
  "transformer": ["model", "architecture", "layer", "attention"],
  "model": ["generates", "learns", "is"],
  "generates": ["words", "text", "tokens", "next"],
  "all": ["you"],
  "you": ["need"],
  "need": ["for"],
  "for": ["deep", "human", "intelligence"],
  "intelligent": ["systems", "machines", "world"],
  "input": ["tokens", "embeddings"],
  "output": ["probabilities", "prediction"],
  "token": "prediction temperature context next".split(" "),
  "tokens": "and embeddings are".split(" "),
  "prediction": "is based on".split(" "),
  "context": "and weights are".split(" "),
};

// Compute the complete state of the transformer given an input text
export function computeTransformerState(
  text: string,
  selectedTokenIndex: number = 0,
  selectedHeadIndex: number = 0,
  temperature: number = 0.7
): TransformerState {
  const d_model = 8;
  const d_k = 4;
  const numHeads = 4;
  const d_ff = 12;

  // 1. Tokenize
  // We clean up and split by spaces, also keeping punctuation grouped for simplicity if any
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) {
    return {
      tokens: [],
      heads: [],
      ffn: { inputs: [], fc1: [], activated: [], fc2: [], outputs: [] },
      candidates: [],
      selectedTokenIndex: 0,
      selectedHeadIndex: 0,
      temperature,
    };
  }

  // Generate tokens
  const tokens: Token[] = rawWords.map((word, index) => {
    // Find vocabulary ID
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    let vocabId = VOCABULARY.findIndex(v => v.toLowerCase() === cleanWord.toLowerCase());
    if (vocabId === -1) {
      // Custom words map to a hashed index in VOCABULARY (avoiding special indices)
      vocabId = 10 + getWordHash(cleanWord, VOCABULARY.length - 10);
    }

    // Embeddings (deterministic but looking pseudo-random)
    const embedding = new Array(d_model).fill(0).map((_, i) => getDeterministicWeight(vocabId, i, 42) * 0.5);
    const positional = getPositionalEncoding(index, d_model);
    const combined = embedding.map((v, i) => v + positional[i]);

    const color = TOKEN_COLORS[index % TOKEN_COLORS.length];

    return {
      text: word,
      id: vocabId,
      color,
      embedding,
      positional,
      combined,
    };
  });

  // Ensure index bounds
  const activeTokenIndex = Math.min(selectedTokenIndex, tokens.length - 1);
  const activeHeadIndex = Math.min(selectedHeadIndex, numHeads - 1);

  // 2. Multi-Head Attention Calculations
  const heads: AttentionHeadData[] = [];
  const concatenatedOutputs: number[][] = Array.from({ length: tokens.length }, () => new Array(numHeads * d_k).fill(0));

  for (let h = 0; h < numHeads; h++) {
    // Generate deterministic matrices for this head
    const W_Q = generateMatrix(d_model, d_k, 100 + h * 50);
    const W_K = generateMatrix(d_model, d_k, 200 + h * 50);
    const W_V = generateMatrix(d_model, d_k, 300 + h * 50);

    // Compute Q, K, V for all tokens
    const queries: number[][] = [];
    const keys: number[][] = [];
    const values: number[][] = [];

    tokens.forEach(tok => {
      queries.push(vectorMatrixMultiply(tok.combined, W_Q));
      keys.push(vectorMatrixMultiply(tok.combined, W_K));
      values.push(vectorMatrixMultiply(tok.combined, W_V));
    });

    // Compute raw scores (Q * K^T) and scaled scores
    const rawScores: number[][] = [];
    const scaledScores: number[][] = [];
    const attentionWeights: number[][] = [];
    const headOutputs: number[][] = [];

    for (let r = 0; r < tokens.length; r++) {
      const q = queries[r];
      const tokenRaw: number[] = [];
      const tokenScaled: number[] = [];

      for (let c = 0; c < tokens.length; c++) {
        const k = keys[c];
        // Causal masking - in decoder-only, a token can only attend to previous tokens
        if (c > r) {
          tokenRaw.push(-Infinity);
          tokenScaled.push(-Infinity);
        } else {
          const raw = dotProduct(q, k);
          tokenRaw.push(raw);
          // Scale by sqrt(d_k) = sqrt(4) = 2
          tokenScaled.push(raw / Math.sqrt(d_k));
        }
      }

      rawScores.push(tokenRaw);
      scaledScores.push(tokenScaled);

      // Softmax over non-masked elements
      const validScaled = tokenScaled.filter(val => val !== -Infinity);
      const smax = softmax(validScaled);

      // Put back with masked elements being 0
      let validPtr = 0;
      const weights = tokenScaled.map(val => {
        if (val === -Infinity) return 0;
        return smax[validPtr++];
      });
      attentionWeights.push(weights);

      // Compute head output (AttentionWeights * V)
      const outVector = new Array(d_k).fill(0);
      for (let dk = 0; dk < d_k; dk++) {
        let sum = 0;
        for (let i = 0; i < tokens.length; i++) {
          sum += weights[i] * values[i][dk];
        }
        outVector[dk] = sum;
      }
      headOutputs.push(outVector);

      // Fill in concatenated outputs
      for (let dk = 0; dk < d_k; dk++) {
        concatenatedOutputs[r][h * d_k + dk] = outVector[dk];
      }
    }

    heads.push({
      headIndex: h,
      queries,
      keys,
      values,
      rawScores,
      scaledScores,
      attentionWeights,
      headOutputs,
    });
  }

  // 3. FFN Calculations
  // Project concatenated head outputs (N x 16) to d_model (8) using W_O
  const W_O = generateMatrix(numHeads * d_k, d_model, 400);
  const mhaOutputs: number[][] = concatenatedOutputs.map(vector => vectorMatrixMultiply(vector, W_O));

  // Add residual & LayerNorm
  const ffnInputs: number[][] = tokens.map((tok, index) => {
    const sum = tok.combined.map((v, i) => v + mhaOutputs[index][i]);
    return layerNorm(sum);
  });

  // FFN Linear 1
  const W_1 = generateMatrix(d_model, d_ff, 500);
  const b_1 = new Array(d_ff).fill(0).map((_, i) => getDeterministicWeight(99, i, 550) * 0.1);

  const fc1: number[][] = [];
  const activated: number[][] = [];

  ffnInputs.forEach(vector => {
    const rawProj = vectorMatrixMultiply(vector, W_1).map((val, idx) => val + b_1[idx]);
    fc1.push(rawProj);
    activated.push(rawProj.map(val => gelu(val)));
  });

  // FFN Linear 2
  const W_2 = generateMatrix(d_ff, d_model, 600);
  const b_2 = new Array(d_model).fill(0).map((_, i) => getDeterministicWeight(88, i, 650) * 0.1);

  const fc2: number[][] = [];
  const ffnOutputs: number[][] = [];

  activated.forEach((vector, index) => {
    const rawProj = vectorMatrixMultiply(vector, W_2).map((val, idx) => val + b_2[idx]);
    fc2.push(rawProj);

    // Residual & LayerNorm again
    const sumWithResidual = ffnInputs[index].map((v, i) => v + rawProj[i]);
    ffnOutputs.push(layerNorm(sumWithResidual));
  });

  const ffn: FFNData = {
    inputs: ffnInputs,
    fc1,
    activated,
    fc2,
    outputs: ffnOutputs,
  };

  // 4. Next-Token Predictions (LM Head)
  // We use the representation of the last token to predict the next token
  const lastTokenOutput = ffnOutputs[tokens.length - 1];

  // Base logits calculation from weight matrices (simulating weights tying)
  // We project size 8 to VocabSize (64)
  const W_vocab = generateMatrix(d_model, VOCABULARY.length, 700);
  const baseLogits = vectorMatrixMultiply(lastTokenOutput, W_vocab);

  // Apply contextual boosts based on our Transition Matrix to make predictions amazing
  const lastWordRaw = tokens[tokens.length - 1].text;
  const lastWordClean = lastWordRaw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  const boostedLogits = [...baseLogits];
  if (TRANSITIONS[lastWordClean]) {
    const targets = TRANSITIONS[lastWordClean];
    targets.forEach((target, rank) => {
      const vocabIdx = VOCABULARY.findIndex(v => v.toLowerCase() === target.toLowerCase());
      if (vocabIdx !== -1) {
        // Boost logit score. Higher rank gets bigger boost to maintain plausible order
        const boostAmount = 18.0 - rank * 2.5;
        boostedLogits[vocabIdx] += boostAmount;
      }
    });
  }

  // Logits for common punctuation or continuation can get minor default boosts
  const commaIdx = VOCABULARY.indexOf("and");
  if (commaIdx !== -1) boostedLogits[commaIdx] += 1.2;

  // Temperature scaling
  // Ensure we don't divide by zero
  const temp = Math.max(0.05, temperature);
  const scaledLogits = boostedLogits.map(l => l / temp);

  // Compute Softmax probabilities over all vocabulary words
  const probabilities = softmax(scaledLogits);

  // Sort and pick top 5 candidates
  const candidates: PredictionCandidate[] = VOCABULARY.map((word, id) => ({
    word,
    id,
    logit: boostedLogits[id],
    scaledLogit: scaledLogits[id],
    probability: probabilities[id],
  }))
    .filter(c => c.word !== "[PAD]") // Don't predict pad token
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  return {
    tokens,
    heads,
    ffn,
    candidates,
    selectedTokenIndex: activeTokenIndex,
    selectedHeadIndex: activeHeadIndex,
    temperature,
  };
}
