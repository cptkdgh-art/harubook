/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / useStatsStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 포인트 누적, 나무 단계, 최근 포인트 획득(플로팅용).
 */

import { create } from 'zustand';
import { db, now } from '@/lib/db/dexie';
import type { Stats } from '@/types/stats';
import {
  TREE_STAGES,
  getStageByPoints,
  getStageProgress,
  pointsForCategory,
  getSeasonalEffectivePoints,
} from '@/types/stats';
import { getSeasonKey, compareSeasonKeys } from '@/lib/seasons';

/* ════════════════════════════════
   STATE
   ════════════════════════════════ */

interface RecentGain {
  id: number;
  amount: number;
  at: number;       // timestamp for auto-clear
}

interface StatsState {
  stats: Stats | null;
  recentGains: RecentGain[];   // 플로팅 +N 애니용 큐
  levelUpFlash: boolean;       // 레벨업 순간 flash

  loadStats: () => Promise<void>;
  addPointsForCompletion: (category?: string, dateStr?: string) => Promise<void>;
  subtractPointsForUncompletion: (category?: string, dateStr?: string) => Promise<void>;
  /**
   * 소설 생성 등으로 시즌 포인트를 소모. 부족하면 false 리턴, 차감 안 함.
   * dateStr 의 시즌 effective points 기준으로 검사하고, 그 시즌의 raw points 에서 차감한다.
   * raw 가 부족하면 음수 방지 위해 0으로 클램프 (이월분은 그대로 유지).
   */
  spendSeasonalPoints: (amount: number, dateStr: string) => Promise<boolean>;
  reset: () => Promise<void>;
  clearGain: (id: number) => void;
  clearLevelUp: () => void;
}

/* ════════════════════════════════
   STORE
   ════════════════════════════════ */

let gainCounter = 0;

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: null,
  recentGains: [],
  levelUpFlash: false,

  loadStats: async () => {
    let stats = await db.stats.toCollection().first();
    if (!stats) {
      const newStats: Stats = {
        points: 0,
        completedCount: 0,
        createdAt: now(),
        seasonalPoints: {},
      };
      const id = await db.stats.add(newStats);
      stats = { ...newStats, id: id as number };
    }

    /* ── 레거시 마이그레이션 ──
       기존 사용자는 stats.points만 있고 seasonalPoints가 없다.
       처음 로드 시 누적 points 를 '현재 시즌'에 통째로 부어준다.
       그러면 사용자는 현재 시즌은 그대로, 다음 시즌부터 -3단계 이월이 적용됨. */
    if (stats && stats.id !== undefined && !stats.seasonalPoints) {
      const seedKey = getSeasonKey(new Date());
      const seasonalPoints: Record<string, number> = {};
      if (stats.points > 0) seasonalPoints[seedKey] = stats.points;
      const updated: Stats = { ...stats, seasonalPoints };
      await db.stats.update(stats.id, { seasonalPoints });
      stats = updated;
    }

    set({ stats });
  },

  addPointsForCompletion: async (category, dateStr) => {
    const current = get().stats;
    if (!current?.id) return;

    const delta = pointsForCategory(category);
    const seasonKey = getSeasonKey(
      dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
    );

    const seasonalPoints = { ...(current.seasonalPoints ?? {}) };
    seasonalPoints[seasonKey] = (seasonalPoints[seasonKey] ?? 0) + delta;

    // 레벨업 감지: 그 시즌의 effective points 비교
    const beforeEff = getSeasonalEffectivePoints(
      current.seasonalPoints,
      seasonKey,
      compareSeasonKeys
    );
    const afterEff = getSeasonalEffectivePoints(
      seasonalPoints,
      seasonKey,
      compareSeasonKeys
    );
    const leveledUp = getStageByPoints(afterEff).level > getStageByPoints(beforeEff).level;

    const updated: Stats = {
      ...current,
      points: current.points + delta, // 레거시 누적도 유지
      completedCount: current.completedCount + 1,
      lastCompletedAt: now(),
      seasonalPoints,
    };
    await db.stats.update(current.id, updated as unknown as Partial<Stats>);

    // 플로팅 큐에 추가
    const gainId = ++gainCounter;
    set((state) => ({
      stats: updated,
      recentGains: [...state.recentGains, { id: gainId, amount: delta, at: Date.now() }],
      levelUpFlash: leveledUp || state.levelUpFlash,
    }));

    // 1.6초 후 자동 제거
    setTimeout(() => {
      set((state) => ({
        recentGains: state.recentGains.filter((g) => g.id !== gainId),
      }));
    }, 1600);
  },

  subtractPointsForUncompletion: async (category, dateStr) => {
    const current = get().stats;
    if (!current?.id) return;

    const delta = pointsForCategory(category);
    const seasonKey = getSeasonKey(
      dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
    );
    const seasonalPoints = { ...(current.seasonalPoints ?? {}) };
    seasonalPoints[seasonKey] = Math.max(0, (seasonalPoints[seasonKey] ?? 0) - delta);

    const updated: Stats = {
      ...current,
      points: Math.max(0, current.points - delta),
      completedCount: Math.max(0, current.completedCount - 1),
      seasonalPoints,
    };
    await db.stats.update(current.id, updated as unknown as Partial<Stats>);
    set({ stats: updated });
  },

  spendSeasonalPoints: async (amount, dateStr) => {
    const current = get().stats;
    if (!current?.id) return false;

    const seasonKey = getSeasonKey(new Date(dateStr + 'T00:00:00'));
    const effective = getSeasonalEffectivePoints(
      current.seasonalPoints,
      seasonKey,
      compareSeasonKeys
    );
    if (effective < amount) return false; // 부족

    // 그 시즌의 raw 에서 차감 — 음수도 허용 (effective 계산 시 0으로 클램프됨).
    // 이래야 effective 기준으로 진짜 'amount' 만큼 사라진다.
    const seasonalPoints = { ...(current.seasonalPoints ?? {}) };
    const rawNow = seasonalPoints[seasonKey] ?? 0;
    seasonalPoints[seasonKey] = rawNow - amount;

    const updated: Stats = {
      ...current,
      points: Math.max(0, current.points - amount),
      seasonalPoints,
    };
    await db.stats.update(current.id, updated as unknown as Partial<Stats>);
    set({ stats: updated });
    return true;
  },

  reset: async () => {
    await db.stats.clear();
    await get().loadStats();
  },

  clearGain: (id) =>
    set((state) => ({ recentGains: state.recentGains.filter((g) => g.id !== id) })),

  clearLevelUp: () => set({ levelUpFlash: false }),
}));

/* ════════════════════════════════
   SELECTORS (유틸)
   ════════════════════════════════ */

/* ── 레거시 (전체 누적 기반) 셀렉터 ── */
export function selectCurrentStage(stats: Stats | null) {
  return getStageByPoints(stats?.points ?? 0);
}
export function selectProgress(stats: Stats | null) {
  return getStageProgress(stats?.points ?? 0);
}
export function selectNextStage(stats: Stats | null) {
  const cur = selectCurrentStage(stats);
  return TREE_STAGES.find((s) => s.level === cur.level + 1) ?? null;
}

/* ── 시즌 단위 셀렉터 (HaruTree·소설 운 스탯이 사용) ── */

export function selectEffectivePointsForDate(stats: Stats | null, dateStr: string): number {
  if (!stats) return 0;
  const key = getSeasonKey(new Date(dateStr + 'T00:00:00'));
  return getSeasonalEffectivePoints(stats.seasonalPoints, key, compareSeasonKeys);
}

export function selectStageForDate(stats: Stats | null, dateStr: string) {
  return getStageByPoints(selectEffectivePointsForDate(stats, dateStr));
}

export function selectProgressForDate(stats: Stats | null, dateStr: string) {
  return getStageProgress(selectEffectivePointsForDate(stats, dateStr));
}

export function selectNextStageForDate(stats: Stats | null, dateStr: string) {
  const cur = selectStageForDate(stats, dateStr);
  return TREE_STAGES.find((s) => s.level === cur.level + 1) ?? null;
}

/** 그 시즌에 직접 획득한 포인트 (이월분 제외) — 진행도 표시용 */
export function selectSeasonalRawPoints(stats: Stats | null, dateStr: string): number {
  if (!stats?.seasonalPoints) return 0;
  const key = getSeasonKey(new Date(dateStr + 'T00:00:00'));
  return stats.seasonalPoints[key] ?? 0;
}

