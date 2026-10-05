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

// OpenRouter 의 무료 엔드포인트는 수시로 바뀌므로 제공처가 살아 있는 것만 유지.
// 검증일: 2026-10-05 (진폭 실측 — /api/v1/models/{id}/endpoints 로 정상 제공처 확인)
// 4/11 목록(GPT-OSS 120B·Nemotron Nano 9B·Llama 3.3 70B 무료)은 제공처가 0개가 되어 교체.
// 전체 목록: https://openrouter.ai/models?max_price=0
export const FREE_MODELS: AIModel[] = [
  { id: 'qwen/qwen3.8-27b:free', name: 'Qwen3.8 27B ⭐ 무료 (한국어 추천)', provider: 'openrouter', free: true },
  { id: 'thinkingmachines/inkling:free', name: 'Inkling 🖋 무료', provider: 'openrouter', free: true },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron 3.5 Lightning ⚡ 무료 (빠름)', provider: 'openrouter', free: true },
];

/* ════════════════════════════════
   유료 모델 (OpenRouter 경유 or 직접)
   ════════════════════════════════ */

// 가격(1M 토큰, 입력/출력, 2026-10-05 OpenRouter 표기)은 이름 옆 설명용 — 바뀔 수 있음.
export const PAID_MODELS: AIModel[] = [
  { id: 'openai/gpt-6-luna', name: 'GPT-6 Luna · 가성비 최고', provider: 'openrouter' },
  { id: 'deepseek/deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash · 저렴', provider: 'openrouter' },
  { id: 'google/gemini-3.8-flash', name: 'Gemini 3.8 Flash · 빠르고 똑똑', provider: 'openrouter' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5 · 문장 자연스러움', provider: 'openrouter' },
  { id: 'anthropic/claude-sonnet-5.5', name: 'Claude Sonnet 5.5 · 소설 품질 최고', provider: 'openrouter' },
  { id: 'openai/gpt-6-sol', name: 'GPT-6 Sol · 고성능', provider: 'openrouter' },
];

export const ALL_MODELS = [...FREE_MODELS, ...PAID_MODELS];

export const DEFAULT_MODEL = FREE_MODELS[0]; // Qwen3.8 27B 무료

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
