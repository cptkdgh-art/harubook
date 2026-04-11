/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / AI 설정 타입
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * OpenRouter 통합 + 직접 API 키 입력 지원.
 * 무료 모델로 진입장벽 제로, 유료 모델은 사용자 선택.
 */

export type AIProvider = 'openrouter' | 'openai' | 'google' | 'anthropic';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  free?: boolean;
}

export interface AIConfig {
  id?: number;
  provider: AIProvider;
  modelId: string;
  apiKey: string;          // OpenRouter 토큰 or 직접 API 키
  baseUrl?: string;        // OpenRouter: https://openrouter.ai/api/v1
}

/* ════════════════════════════════
   무료 모델 (OpenRouter)
   ════════════════════════════════ */

// OpenRouter 의 무료 엔드포인트는 수시로 바뀌므로 확실히 작동하는 것만 유지.
// 검증일: 2026-04-11 (진폭 실측)
// 전체 목록: https://openrouter.ai/models?max_price=0
export const FREE_MODELS: AIModel[] = [
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B ⚡ 무료 ⭐', provider: 'openrouter', free: true },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B 🟢 무료', provider: 'openrouter', free: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B 🦙 무료 (혼잡 가능)', provider: 'openrouter', free: true },
];

/* ════════════════════════════════
   유료 모델 (OpenRouter 경유 or 직접)
   ════════════════════════════════ */

export const PAID_MODELS: AIModel[] = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter' },
  { id: 'anthropic/claude-haiku-4-5-20250514', name: 'Claude Haiku 4.5', provider: 'openrouter' },
  { id: 'anthropic/claude-sonnet-4-6-20250514', name: 'Claude Sonnet 4.6', provider: 'openrouter' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'openrouter' },
];

export const ALL_MODELS = [...FREE_MODELS, ...PAID_MODELS];

export const DEFAULT_MODEL = FREE_MODELS[0]; // Gemini Flash 무료

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
