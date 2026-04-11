/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 types / Partner 타입 정의
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/** UI 시각 테마 — 4계절 + auto (현재 달 자동) */
export type ThemeType = 'auto' | 'spring' | 'summer' | 'fall' | 'winter';
export type WorldType = 'modern' | 'fantasy';
export type GenderType = 'female' | 'male';

/** 하위 호환용 alias (deprecated) */
export type SeasonModeType = ThemeType;

export interface Personality {
  calm: number;       // 0 (차분) ~ 1 (활발)
  emotion: number;    // 0 (논리) ~ 1 (감성)
  companion: number;  // 0 (관찰자) ~ 1 (동반자)
  serious: number;    // 0 (장난) ~ 1 (진지)
}

export interface Partner {
  id?: number;
  name: string;
  theme: ThemeType;           // UI 시각 테마 (4계절 + auto). 나무·파티클과 별개.
  world: WorldType;
  gender?: GenderType;
  personality: Personality;
  relationshipDepth: number;
  createdAt: string;
}

/* ════════════════════════════════
   테마 라벨 (auto + 4계절)
   ════════════════════════════════ */

export const THEME_LABELS: Record<ThemeType, { emoji: string; label: string; tagline: string }> = {
  auto:   { emoji: '🕰️', label: '자동',  tagline: '현재 달에 맞춰 자동 전환' },
  spring: { emoji: '🌸', label: '봄',    tagline: '벚꽃 · 파스텔 핑크 · 따뜻함' },
  summer: { emoji: '🌊', label: '여름',  tagline: '바다 · 시원한 블루 · 청량함' },
  fall:   { emoji: '🍁', label: '가을',  tagline: '단풍 · 앰버 · 금빛 거리' },
  winter: { emoji: '❄️', label: '겨울',  tagline: '눈 · 페일 블루 · 정적' },
};

/** 하위 호환 */
export const SEASON_MODE_LABELS = THEME_LABELS;

/* ════════════════════════════════
   성별 라벨
   ════════════════════════════════ */

export const GENDER_LABELS: Record<GenderType, { emoji: string; label: string; desc: string }> = {
  female: { emoji: '👩', label: '여성향', desc: '감성·관계·섬세한 묘사 중심' },
  male:   { emoji: '👨', label: '남성향', desc: '서사·행동·간결한 문체 중심' },
};

/* ════════════════════════════════
   세계관 라벨 + 요약
   ════════════════════════════════ */

export const WORLD_LABELS: Record<WorldType, { emoji: string; label: string; tagline: string }> = {
  modern: {
    emoji: '🏙️',
    label: '현대판',
    tagline: '일상 속 잔잔한 공명 — 카페, 지하철, 서재 한켠의 이야기',
  },
  fantasy: {
    emoji: '🔮',
    label: '판타지판',
    tagline: '일상에 마법이 스며든 세계 — 정령, 별빛, 오래된 주문',
  },
};

/** 온보딩 기본 프리셋 — 이름은 사용자 선택, 테마는 auto 기본 */
export const DEFAULT_PARTNER: Partial<Partner> = {
  name: '보리',
  theme: 'auto',
  world: 'modern',
  gender: 'female',
  personality: { calm: 0.3, emotion: 0.8, companion: 0.9, serious: 0.2 },
};

/** 하위 호환: 기존 DEFAULT_PARTNERS 참조를 위한 shim */
export const DEFAULT_PARTNERS: Record<string, Partial<Partner>> = {
  spring: DEFAULT_PARTNER,
  summer: { ...DEFAULT_PARTNER, theme: 'summer' },
  fall:   { ...DEFAULT_PARTNER, theme: 'fall' },
  winter: { ...DEFAULT_PARTNER, theme: 'winter' },
  auto:   { ...DEFAULT_PARTNER, theme: 'auto' },
};
