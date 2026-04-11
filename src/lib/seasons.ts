/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 lib/seasons — 4계절 테마 유틸
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 현재 달 → 계절 자동 감지.
 * 각 계절의 파티클 이모지·나무 색상·accent 컬러 토큰 제공.
 */

export type SeasonType = 'spring' | 'summer' | 'fall' | 'winter';
export type SeasonMode = 'auto' | SeasonType;

/* ════════════════════════════════
   현재 달 → 계절 매핑
   ════════════════════════════════ */

export function getCurrentSeason(date: Date = new Date()): SeasonType {
  const m = date.getMonth() + 1; // 1~12
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter'; // 12, 1, 2
}

export function resolveSeason(mode: SeasonMode | undefined): SeasonType {
  if (!mode || mode === 'auto') return getCurrentSeason();
  return mode;
}

/* ════════════════════════════════
   시즌 키 — 'YYYY-spring' 같은 식.
   포인트 누적·이월 계산용.
   12월은 그해 winter, 1~2월은 전년도 winter (한 시즌으로 묶임).
   ════════════════════════════════ */

export function getSeasonKey(date: Date = new Date()): string {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  if (m >= 3 && m <= 5) return `${y}-spring`;
  if (m >= 6 && m <= 8) return `${y}-summer`;
  if (m >= 9 && m <= 11) return `${y}-fall`;
  if (m === 12) return `${y}-winter`;
  return `${y - 1}-winter`; // 1, 2월
}

export function seasonKeyToType(key: string): SeasonType {
  const part = key.split('-')[1];
  if (part === 'spring' || part === 'summer' || part === 'fall' || part === 'winter') {
    return part;
  }
  return 'spring';
}

const SEASON_ORDER: Record<SeasonType, number> = {
  spring: 0,
  summer: 1,
  fall: 2,
  winter: 3,
};

/** 시즌 키를 chronological 정수로 변환 — 정렬·비교용 */
export function seasonKeyOrdinal(key: string): number {
  const [yStr, sStr] = key.split('-');
  const y = parseInt(yStr, 10);
  const s = (sStr as SeasonType) ?? 'spring';
  return y * 4 + (SEASON_ORDER[s] ?? 0);
}

export function compareSeasonKeys(a: string, b: string): number {
  return seasonKeyOrdinal(a) - seasonKeyOrdinal(b);
}

/* ════════════════════════════════
   계절별 설정
   ════════════════════════════════ */

export interface SeasonConfig {
  id: SeasonType;
  label: string;
  emoji: string;
  months: string;
  tagline: string;
  /** 파티클로 떨어지는 이모지들 */
  particles: string[];
  /** 파티클 떨어지는 회전 유무 */
  spinParticles: boolean;
  /** 나무 잎 그라디언트 (light, dark) */
  leafColors: { light: string; dark: string };
  /** 나무 줄기 */
  trunkColors: { light: string; dark: string };
  /** 추가 장식 (꽃잎·열매 등) 색 */
  blossomColor: string;
  fruitColor: string;
  /** 배경 radial 오버레이 색 (투명도 포함) */
  bgTint: string;
  /** 나무 종 — Lv3 이상에서 실루엣이 달라진다 */
  treeShape: 'cherry' | 'maple' | 'pine' | 'palm';
}

export const SEASON_CONFIG: Record<SeasonType, SeasonConfig> = {
  spring: {
    id: 'spring',
    label: '봄',
    emoji: '🌸',
    months: '3~5월',
    tagline: '벚꽃이 흩날리는 분홍의 계절',
    // 가중치: 벚꽃 위주, 가끔 다른 꽃
    particles: ['🌸', '🌸', '🌸', '🌸', '🌷', '🌺', '💮'],
    spinParticles: true,
    leafColors: { light: '#fbb6ce', dark: '#ec4899' },
    trunkColors: { light: '#a1724f', dark: '#6b4423' },
    blossomColor: '#ffffff',
    fruitColor: '#e11d48',
    bgTint: 'oklch(0.92 0.1 340 / 0.55)',
    treeShape: 'cherry',
  },
  summer: {
    id: 'summer',
    label: '여름',
    emoji: '🌊',
    months: '6~8월',
    tagline: '바다 바람과 녹음이 짙은 계절',
    // 가중치: 물방울 위주, 가끔 조개·잎
    particles: ['💧', '💧', '💧', '💧', '🌊', '🐚', '🌿'],
    spinParticles: false,
    leafColors: { light: '#6ee7b7', dark: '#059669' },
    trunkColors: { light: '#78716c', dark: '#44403c' },
    blossomColor: '#fef3c7',
    fruitColor: '#f59e0b',
    bgTint: 'oklch(0.85 0.12 200 / 0.45)',
    treeShape: 'palm',
  },
  fall: {
    id: 'fall',
    label: '가을',
    emoji: '🍁',
    months: '9~11월',
    tagline: '단풍이 천천히 내리는 금빛 계절',
    // 가중치: 단풍잎 위주
    particles: ['🍁', '🍁', '🍁', '🍂', '🍂', '🍃', '🌰'],
    spinParticles: true,
    leafColors: { light: '#fdba74', dark: '#ea580c' },
    trunkColors: { light: '#92400e', dark: '#451a03' },
    blossomColor: '#fde68a',
    fruitColor: '#dc2626',
    bgTint: 'oklch(0.82 0.15 55 / 0.5)',
    treeShape: 'maple',
  },
  winter: {
    id: 'winter',
    label: '겨울',
    emoji: '❄️',
    months: '12~2월',
    tagline: '눈이 조용히 내리는 정적의 계절',
    // 가중치: 눈송이 위주
    particles: ['❄️', '❄️', '❄️', '❄️', '❄️', '✨', '🌨️'],
    spinParticles: false,
    leafColors: { light: '#86efac', dark: '#166534' },
    trunkColors: { light: '#57534e', dark: '#292524' },
    blossomColor: '#ffffff',
    fruitColor: '#e2e8f0',
    bgTint: 'oklch(0.92 0.03 220 / 0.5)',
    treeShape: 'pine',
  },
};
