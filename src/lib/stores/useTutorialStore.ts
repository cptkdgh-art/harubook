/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useTutorialStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 첫 진입 웰컴 튜토리얼 표시 상태.
 * localStorage에 seen 플래그 저장 → 한 번 본 사용자에겐 재노출 안 함.
 * "다시 보기"로 언제든 재시작 가능.
 */

import { create } from 'zustand';

const LS_KEY = 'harubook:tutorial:seen:v1';

interface TutorialState {
  isOpen: boolean;
  step: number;
  seen: boolean;

  init: () => void;
  open: () => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  markSeen: () => void;
}

export const TUTORIAL_TOTAL_STEPS = 7;

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isOpen: false,
  step: 0,
  seen: false,

  init: () => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(LS_KEY) === '1';
    set({ seen, isOpen: !seen, step: 0 });
  },

  open: () => set({ isOpen: true, step: 0 }),
  close: () => {
    set({ isOpen: false });
    get().markSeen();
  },

  next: () =>
    set((s) => ({
      step: Math.min(s.step + 1, TUTORIAL_TOTAL_STEPS - 1),
    })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

  markSeen: () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LS_KEY, '1');
    set({ seen: true });
  },
}));
