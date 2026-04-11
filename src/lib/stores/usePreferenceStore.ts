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

const LS_KEY_ANIMATE = 'harubook:pref:animate:v1';
const LS_KEY_FONT = 'harubook:pref:font:v1';

/**
 * 글씨 크기 스케일 — CSS zoom 으로 body 전체를 비례 스케일.
 * Tailwind 의 `text-[11px]` 같은 하드코딩 px 까지 같이 커지게 하려면
 * html font-size 만으로는 안 되고 zoom 이 필요하다.
 *
 * - sm: 0.9× (작게)
 * - md: 1.0× (기본)
 * - lg: 1.125× (크게, +약 2px 체감)
 * - xl: 1.25× (더 크게, +약 4px 체감)
 */
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_SCALE_ZOOM: Record<FontScale, number> = {
  sm: 0.9,
  md: 1.0,
  lg: 1.125,
  xl: 1.25,
};

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  sm: '작게',
  md: '보통',
  lg: '크게',
  xl: '더 크게',
};

const FONT_CYCLE: FontScale[] = ['md', 'lg', 'xl', 'sm'];

interface PreferenceState {
  animationsEnabled: boolean;
  fontScale: FontScale;

  init: () => void;
  toggleAnimations: () => void;
  setAnimations: (on: boolean) => void;
  setFontScale: (scale: FontScale) => void;
  cycleFontScale: () => void;
}

function applyAnimateDOM(enabled: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (enabled) {
    root.removeAttribute('data-animate');
  } else {
    root.setAttribute('data-animate', 'off');
  }
}

function applyFontDOM(scale: FontScale) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  // data-font-scale 속성으로 CSS zoom 규칙 트리거 (globals.css 에 정의)
  root.setAttribute('data-font-scale', scale);
}

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  animationsEnabled: true,
  fontScale: 'md',

  init: () => {
    if (typeof window === 'undefined') return;
    // 애니메이션
    const storedAnim = window.localStorage.getItem(LS_KEY_ANIMATE);
    const enabled = storedAnim === null ? true : storedAnim === '1';
    // 글씨 크기
    const storedFont = window.localStorage.getItem(LS_KEY_FONT) as FontScale | null;
    const scale: FontScale =
      storedFont && FONT_SCALE_ZOOM[storedFont] !== undefined ? storedFont : 'md';
    set({ animationsEnabled: enabled, fontScale: scale });
    applyAnimateDOM(enabled);
    applyFontDOM(scale);
  },

  toggleAnimations: () => {
    const next = !get().animationsEnabled;
    set({ animationsEnabled: next });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY_ANIMATE, next ? '1' : '0');
    }
    applyAnimateDOM(next);
  },

  setAnimations: (on) => {
    set({ animationsEnabled: on });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY_ANIMATE, on ? '1' : '0');
    }
    applyAnimateDOM(on);
  },

  setFontScale: (scale) => {
    set({ fontScale: scale });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY_FONT, scale);
    }
    applyFontDOM(scale);
  },

  cycleFontScale: () => {
    const current = get().fontScale;
    const idx = FONT_CYCLE.indexOf(current);
    const next = FONT_CYCLE[(idx + 1) % FONT_CYCLE.length];
    get().setFontScale(next);
  },
}));
