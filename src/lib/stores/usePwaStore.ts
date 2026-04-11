/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / usePwaStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * PWA 설치 프롬프트 캡처 + 실행.
 * `beforeinstallprompt` 이벤트를 세션에 한 번만 캐시.
 */

import { create } from 'zustand';

/* 타입 보정: TS lib에 없는 BeforeInstallPromptEvent */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaState {
  installPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  canInstall: boolean;

  init: () => void;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

/* 모듈 스코프 리스너 중복 방지 */
let bound = false;

export const usePwaStore = create<PwaState>((set, get) => ({
  installPrompt: null,
  isInstalled: false,
  canInstall: false,

  init: () => {
    if (bound) return;
    if (typeof window === 'undefined') return;
    bound = true;

    // 이미 standalone 으로 실행 중 (설치됨)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (typeof navigator !== 'undefined' &&
        (navigator as { standalone?: boolean }).standalone === true);

    set({ isInstalled: standalone });

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      set({ installPrompt: evt, canInstall: true });
    });

    window.addEventListener('appinstalled', () => {
      set({ installPrompt: null, canInstall: false, isInstalled: true });
    });
  },

  install: async () => {
    const evt = get().installPrompt;
    if (!evt) return 'unavailable';
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    set({ installPrompt: null, canInstall: false });
    return outcome;
  },
}));
