/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/stores / AI 설정 스토어
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { create } from 'zustand';
import { db } from '@/lib/db/dexie';
import type { AIConfig } from '@/types/ai';
import { DEFAULT_MODEL, OPENROUTER_BASE_URL, ALL_MODELS } from '@/types/ai';
import { checkOpenRouterKey } from '@/lib/ai/keyFormat';

// OpenRouter 에서 엔드포인트가 사라진 모델들 — 자동 마이그레이션
const DEPRECATED_MODELS = new Set([
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  // 2026-10-05 실측: 제공처 0개(무료 종료)
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  // 처음부터 없는 ID(404) — 비슷한 현재 모델로는 아래 REPLACED_MODELS
]);

// 없어진 유료 모델 ID → 같은 계열의 현재 모델 (유료를 고른 사용자를 무료로 내리지 않는다)
const REPLACED_MODELS: Record<string, string> = {
  'anthropic/claude-haiku-4-5-20250514': 'anthropic/claude-haiku-4.5',
  'anthropic/claude-sonnet-4-6-20250514': 'anthropic/claude-sonnet-5.5',
};

/* ════════════════════════════════
   1. STATE INTERFACE
   ════════════════════════════════ */

interface AIState {
  config: AIConfig | null;
  isConfigured: boolean;

  loadConfig: () => Promise<void>;
  saveConfig: (apiKey: string, modelId?: string) => Promise<void>;
  clearConfig: () => Promise<void>;
}

/* ════════════════════════════════
   2. STORE
   ════════════════════════════════ */

export const useAIStore = create<AIState>((set) => ({
  config: null,
  isConfigured: false,

  loadConfig: async () => {
    const config = await db.aiConfig.toCollection().first();
    if (!config) {
      set({ config: null, isConfigured: false });
      return;
    }

    // 사라진 모델 → 기본 무료 모델(유료 ID는 같은 계열 현재 모델)로 자동 교체
    const replacement = REPLACED_MODELS[config.modelId] ?? (DEPRECATED_MODELS.has(config.modelId) ? DEFAULT_MODEL.id : null);
    if (replacement) {
      const migrated: AIConfig = { ...config, modelId: replacement };
      if (config.id) {
        await db.aiConfig.update(config.id, { modelId: replacement });
      }
      console.info(
        `[AI] 모델 자동 마이그레이션: ${config.modelId} → ${replacement}`
      );
      set({ config: migrated, isConfigured: !!migrated.apiKey });
      return;
    }

    // 등록된 모델 목록에 없으면 경고 (삭제는 안 함 — 사용자 커스텀일 수 있음)
    if (!ALL_MODELS.some((m) => m.id === config.modelId)) {
      console.warn(
        `[AI] 설정된 모델(${config.modelId})이 기본 목록에 없어요.`
      );
    }

    set({ config, isConfigured: !!config.apiKey });
  },

  saveConfig: async (apiKey: string, modelId?: string) => {
    await db.aiConfig.clear();
    const newConfig: AIConfig = {
      provider: 'openrouter',
      modelId: modelId || DEFAULT_MODEL.id,
      // 붙여넣기 실수(공백·줄바꿈·Bearer·따옴표)를 정리해서 저장
      apiKey: checkOpenRouterKey(apiKey).key,
      baseUrl: OPENROUTER_BASE_URL,
    };
    await db.aiConfig.add(newConfig);
    set({ config: newConfig, isConfigured: true });
  },

  clearConfig: async () => {
    await db.aiConfig.clear();
    set({ config: null, isConfigured: false });
  },
}));
