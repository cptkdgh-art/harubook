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

// OpenRouter 에서 엔드포인트가 사라진 모델들 — 자동 마이그레이션
const DEPRECATED_MODELS = new Set([
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
]);

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

    // 사라진 모델 → 기본 무료 모델로 자동 교체
    if (DEPRECATED_MODELS.has(config.modelId)) {
      const migrated: AIConfig = { ...config, modelId: DEFAULT_MODEL.id };
      if (config.id) {
        await db.aiConfig.update(config.id, { modelId: DEFAULT_MODEL.id });
      }
      console.info(
        `[AI] 모델 자동 마이그레이션: ${config.modelId} → ${DEFAULT_MODEL.id}`
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
      apiKey,
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
