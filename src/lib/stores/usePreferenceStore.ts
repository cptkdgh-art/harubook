/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / usePreferenceStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 사용자 기기별 UX 선호 (애니메이션 on/off 등).
 * localStorage에 저장, 파트너·클라우드와 무관.
 */

import { create } from 'zustand';

const LS_KEY = 'harubook:pref:animate:v1';

interface PreferenceState {
  animationsEnabled: boolean;
  init: () => void;
  toggleAnimations: () => void;
  setAnimations: (on: boolean) => void;
}

function applyToDOM(enabled: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (enabled) {
    root.removeAttribute('data-animate');
  } else {
    root.setAttribute('data-animate', 'off');
  }
}

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  animationsEnabled: true,

  init: () => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(LS_KEY);
    const enabled = stored === null ? true : stored === '1';
    set({ animationsEnabled: enabled });
    applyToDOM(enabled);
  },

  toggleAnimations: () => {
    const next = !get().animationsEnabled;
    set({ animationsEnabled: next });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY, next ? '1' : '0');
    }
    applyToDOM(next);
  },

  setAnimations: (on) => {
    set({ animationsEnabled: on });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY, on ? '1' : '0');
    }
    applyToDOM(on);
  },
}));
