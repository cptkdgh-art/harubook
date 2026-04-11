/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/stores / 채팅 스토어
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { create } from 'zustand';
import { db, now } from '@/lib/db/dexie';
import type { Message, AIAction } from '@/types/message';
import type { AIConfig } from '@/types/ai';
import { executeAction } from '@/lib/triggers';

/* ════════════════════════════════
   1. STATE INTERFACE
   ════════════════════════════════ */

interface ChatState {
  messages: Message[];
  isLoading: boolean;

  loadMessages: () => Promise<void>;
  sendMessage: (content: string, aiConfig: AIConfig) => Promise<void>;
  clearMessages: () => Promise<void>;
}

/* ════════════════════════════════
   2. STORE
   ════════════════════════════════ */

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  loadMessages: async () => {
    const msgs = await db.messages.orderBy('createdAt').toArray();
    set({ messages: msgs });
  },

  sendMessage: async (content: string, aiConfig: AIConfig) => {
    // 1. 사용자 메시지 저장
    const userMsg: Message = { role: 'user', content, createdAt: now() };
    await db.messages.add(userMsg);

    set({ isLoading: true });
    await get().loadMessages();

    try {
      // 2. API 호출
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          apiKey: aiConfig.apiKey,
          modelId: aiConfig.modelId,
          baseUrl: aiConfig.baseUrl,
        }),
      });

      const data: AIAction = await res.json();

      // 3. 트리거 실행 (add/update/delete)
      if (data.action && data.action !== 'chat' && data.action !== 'list') {
        await executeAction(data);
      }

      // 4. AI 응답 저장
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply || '처리했어!',
        action: data,
        createdAt: now(),
      };
      await db.messages.add(aiMsg);
    } catch (error) {
      const errorMsg: Message = {
        role: 'assistant',
        content: 'AI 연결에 실패했어요. 설정을 확인해주세요.',
        createdAt: now(),
      };
      await db.messages.add(errorMsg);
    }

    set({ isLoading: false });
    await get().loadMessages();
  },

  clearMessages: async () => {
    await db.messages.clear();
    set({ messages: [] });
  },
}));
