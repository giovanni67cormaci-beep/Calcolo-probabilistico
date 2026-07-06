/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Token {
  text: string;
  id: number;
  color: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
  embedding: number[];
  positional: number[];
  combined: number[];
}

export interface AttentionHeadData {
  headIndex: number;
  queries: number[][]; // [numTokens][d_k]
  keys: number[][];    // [numTokens][d_k]
  values: number[][];  // [numTokens][d_k]
  rawScores: number[][]; // [numTokens][numTokens]
  scaledScores: number[][]; // [numTokens][numTokens]
  attentionWeights: number[][]; // [numTokens][numTokens]
  headOutputs: number[][]; // [numTokens][d_k]
}

export interface FFNData {
  inputs: number[][];    // [numTokens][d_model]
  fc1: number[][];       // [numTokens][d_ff]
  activated: number[][]; // [numTokens][d_ff]
  fc2: number[][];       // [numTokens][d_model]
  outputs: number[][];   // [numTokens][d_model]
}

export interface PredictionCandidate {
  word: string;
  id: number;
  logit: number;
  scaledLogit: number;
  probability: number;
}

export interface TransformerState {
  tokens: Token[];
  heads: AttentionHeadData[];
  ffn: FFNData;
  candidates: PredictionCandidate[];
  selectedTokenIndex: number;
  selectedHeadIndex: number;
  temperature: number;
}
